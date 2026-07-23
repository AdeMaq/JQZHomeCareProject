import { VisitStatus } from '../../../shared/enums/visit-status';

export interface Visit {
  id: string;

  // =========================
  // PATIENT
  // =========================

  patientId: string;

  patientName: string;

  // =========================
  // PRACTITIONER
  // =========================

  practitionerId: string;

  practitionerName: string;

  // =========================
  // AREA
  // =========================

  areaId: string;

  areaName: string;

  // =========================
  // SERVICE
  // =========================

  serviceId: string;

  serviceName: string;

  // =========================
  // PACKAGE
  // =========================

  packageId?: string | null;

  packageName?: string | null;

  // =========================
  // SCHEDULE
  // =========================

  scheduledDate: string;

  timeSlot: string;

  // =========================
  // STATUS
  // =========================

  status: VisitStatus;

  // =========================
  // PAYMENT
  // =========================

  amountDue: number;

  amountReceived: number;

  receivedBy?: string | null;
}

// ==================================================
// UPDATE VISIT REQUEST
// ==================================================

export interface UpdateVisitRequest {
  practitionerId: string;

  areaId: string;

  serviceId: string;

  packageId?: string | null;

  scheduledDate: string;

  timeSlot: string;

  amountDue: number;
}
