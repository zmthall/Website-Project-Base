import { createError } from 'h3';
import { validateManagedFields } from './management-validation';
import type { ManagedRecord } from '../../shared/types/management';
export function applicationFields(body: Record<string, unknown>, jobs: ManagedRecord[]) {
  if (
    body.website ||
    body.accuracy !== true ||
    (body.consent as { granted?: boolean } | undefined)?.granted !== true
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Confirm the application notices and information.',
    });
  const positionId = body.positionId;
  if (typeof positionId !== 'string')
    throw createError({ statusCode: 400, statusMessage: 'Select a position' });
  const job = jobs.find((job) => job.id === positionId && job.fields.status === 'open');
  if (positionId !== 'general' && !job)
    throw createError({
      statusCode: 400,
      statusMessage: 'This opening is no longer available. Choose another position.',
    });
  const fields = validateManagedFields('applications', {
    ...body,
    position: job ? String(job.fields.title) : 'General application',
    consentAt: new Date().toISOString(),
    status: 'new',
    notes: '',
  });
  if (
    !['Full-time', 'Part-time', 'Either', 'Contract', 'Temporary', 'Internship'].includes(
      String(fields.employmentType),
    )
  )
    throw createError({ statusCode: 400, statusMessage: 'Select an employment preference' });
  const phone = String(fields.phone).replace(/\D/g, '');
  if (phone.length < 7 || phone.length > 15)
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid phone number' });
  if (
    fields.startDate &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(String(fields.startDate)) ||
      !Number.isFinite(Date.parse(String(fields.startDate))) ||
      new Date(String(fields.startDate)).toISOString().slice(0, 10) !== fields.startDate)
  )
    throw createError({ statusCode: 400, statusMessage: 'Enter a valid start date' });
  if (fields.portfolioUrl) {
    let url: URL;
    try {
      url = new URL(String(fields.portfolioUrl));
    } catch {
      throw createError({ statusCode: 400, statusMessage: 'Enter a valid portfolio URL' });
    }
    if (url.protocol !== 'https:' || url.username || url.password)
      throw createError({ statusCode: 400, statusMessage: 'Portfolio links must use HTTPS' });
  }
  return fields;
}
