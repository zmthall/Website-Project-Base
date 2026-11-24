import { workflowRepository } from '../../../../server/repositories/workflows';
import { AppointmentService } from '../services/appointments';

export const appointmentService = new AppointmentService(workflowRepository);
