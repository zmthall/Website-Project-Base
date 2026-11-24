// TODO [BOOK-01]: Add provider-specific schedules, holidays, duration/buffer and location capacity rules with transactional overlap constraints, timezone/DST tests and authoritative clock handling. See docs/integration-audit.md.
import { randomUUID } from 'node:crypto';
import { zonedDate, zonedInstant } from '../../../../shared/utils/scheduling';
import type { WorkflowCoreRepository } from '../../../../shared/types/workflows';
import {
  fail,
  validText,
  validateContact,
  WorkflowServiceSupport,
} from '../../../../server/services/workflow-support';
import { appointments, appointmentWorkflow } from '../../shared/appointments';
import type {
  Appointment,
  AppointmentRequest,
  AvailabilityQuery,
  TimeSlot,
} from '../../app/features/appointments/types';

export interface AppointmentRepository extends WorkflowCoreRepository {
  appointments: Map<string, Appointment>;
}

/** Process-local scheduling domain service owned by the Appointments feature layer. */
export class AppointmentService extends WorkflowServiceSupport<AppointmentRepository> {
  private stopReminders(id: string) {
    for (const job of this.repo.notifications.values())
      if (job.resourceId === id && job.kind === 'appointment-reminder') job.status = 'canceled';
  }

  availability(query: AvailabilityQuery, ignoreId?: string): TimeSlot[] {
    const cfg = appointmentWorkflow;
    if (
      !query ||
      !validText(query.date, 10) ||
      !validText(query.service) ||
      !validText(query.location) ||
      !validText(query.provider)
    )
      fail(400, 'Select a date, service, location and provider');
    const duration = Object.hasOwn(cfg.serviceMinutes, query.service)
      ? cfg.serviceMinutes[query.service]
      : undefined;
    if (
      !duration ||
      !cfg.locations.some((location) => location.value === query.location) ||
      !cfg.providers.some(
        (provider) =>
          provider.value === query.provider && provider.locations.includes(query.location),
      )
    )
      return fail(400, 'Invalid scheduling options');
    const day = Date.parse(query.date + 'T00:00:00Z');
    if (!Number.isFinite(day) || new Date(day).toISOString().slice(0, 10) !== query.date)
      fail(400, 'Invalid date');
    const today = zonedDate(this.now(), cfg.timeZone);
    if (
      query.date < today ||
      day > Date.parse(today + 'T00:00:00Z') + cfg.horizonDays * 86400000
    )
      fail(400, 'Choose a date inside the booking window');
    if (!cfg.weekdays.includes(new Date(day).getUTCDay()) || cfg.closedDates.includes(query.date))
      return [];
    const minute = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
    const slots: TimeSlot[] = [];
    for (
      let value = minute(cfg.opens);
      value + duration <= minute(cfg.closes);
      value += cfg.intervalMinutes
    ) {
      const time = `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
      const startsAt = zonedInstant(query.date, time, cfg.timeZone);
      if (!startsAt) continue;
      const end = Date.parse(startsAt) + duration * 60000;
      if (Date.parse(startsAt) < this.now() + cfg.leadMinutes * 60000) continue;
      const conflict = [...this.repo.appointments.values()].some(
        (appointment) =>
          appointment.id !== ignoreId &&
          appointment.status === 'confirmed' &&
          appointment.provider === query.provider &&
          Date.parse(appointment.startsAt) < end &&
          Date.parse(appointment.endsAt) > Date.parse(startsAt),
      );
      if (!conflict)
        slots.push({
          id: `${query.date}/${time}/${query.provider}/${query.location}/${query.service}`,
          service: query.service,
          location: query.location,
          provider: query.provider,
          startsAt,
          endsAt: new Date(end).toISOString(),
          timeZone: cfg.timeZone,
        });
    }
    return slots;
  }

  book(ownerId: string, input: AppointmentRequest, key: string) {
    return this.repeat(ownerId, 'book', key, input, () => {
      validateContact(input.contact);
      if (
        input.consent !== true ||
        !appointments.meetingTypes.some((meeting) => meeting.value === input.meeting) ||
        (input.meeting === 'phone' && !validText(input.contact.phone)) ||
        (input.meeting === 'in-person' && input.location !== 'office') ||
        (input.meeting !== 'in-person' && input.location !== 'remote') ||
        (input.notes !== undefined &&
          (typeof input.notes !== 'string' || input.notes.length > 10000))
      )
        fail(400, 'Check meeting format, location, consent and notes');
      const startsAt = zonedInstant(input.date, input.time, appointmentWorkflow.timeZone);
      const slot = this.availability(input).find((candidate) => candidate.startsAt === startsAt);
      if (!slot)
        return fail(409, 'This time is unavailable. Refresh availability and choose another slot.');
      const record: Appointment = {
        ...slot,
        id: randomUUID(),
        ownerId,
        contact: input.contact,
        meeting: input.meeting,
        notes: input.notes ?? '',
        status: 'confirmed',
        version: 1,
      };
      this.repo.appointments.set(record.id, structuredClone(record));
      this.notify(ownerId, record.id, 'appointment-confirmed');
      this.notify(
        ownerId,
        record.id,
        'appointment-reminder',
        new Date(Math.max(this.now(), Date.parse(slot.startsAt) - 86400000)).toISOString(),
      );
      return record;
    });
  }

  list(ownerId: string) {
    return structuredClone(
      [...this.repo.appointments.values()].filter((appointment) => appointment.ownerId === ownerId),
    );
  }

  change(
    ownerId: string,
    id: string,
    input: { version: number; cancel?: boolean; date?: string; time?: string },
    key: string,
  ) {
    return this.repeat(ownerId, `appointment:${id}`, key, input, () => {
      const current = this.owned(this.repo.appointments, id, ownerId);
      if (
        current.version !== input.version ||
        current.status !== 'confirmed' ||
        Date.parse(current.startsAt) <= this.now()
      )
        return fail(409, 'Appointment changed or can no longer be modified');
      if (input.cancel) {
        current.status = 'canceled';
        this.stopReminders(id);
        this.notify(ownerId, id, 'appointment-canceled');
      } else {
        const startsAt = zonedInstant(input.date ?? '', input.time ?? '', current.timeZone);
        const slot = this.availability(
          {
            date: input.date ?? '',
            service: current.service,
            location: current.location,
            provider: current.provider,
          },
          id,
        ).find((candidate) => candidate.startsAt === startsAt);
        if (!slot) return fail(409, 'This time is unavailable. Choose another slot.');
        Object.assign(current, slot, { id });
        this.stopReminders(id);
        this.notify(ownerId, id, 'appointment-rescheduled');
        this.notify(
          ownerId,
          id,
          'appointment-reminder',
          new Date(Math.max(this.now(), Date.parse(slot.startsAt) - 86400000)).toISOString(),
        );
      }
      current.version++;
      return structuredClone(current);
    });
  }
}
