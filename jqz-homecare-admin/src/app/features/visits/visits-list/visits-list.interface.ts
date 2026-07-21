import { VisitStatus } from '../../../shared/enums/visit-status';

export interface Visit {
  id: string;

  patientName: string;

  practitionerName: string;

  areaName: string;

  serviceName: string;

  packageName?: string | null;

  scheduledDate: string;

  timeSlot: string;

  status: VisitStatus;

  amountDue: number;

  amountReceived: number;

  receivedBy?: string | null;
}
