// ============================================================
// VISIT STATUS
// ============================================================

export type VisitStatus = 'Scheduled' | 'Accepted' | 'Completed' | 'Cancelled';

// ============================================================
// PAYMENT TYPES
//
// Payment information is package-level in the backend.
// A Visit only exposes PaymentType and SettlementId.
// ============================================================

export type PackagePaymentType = 'FullAdvance' | 'Installment';

// ============================================================
// VISIT
// ============================================================

export interface Visit {
  // ==========================================================
  // IDENTIFICATION
  // ==========================================================

  id: string;

  // ==========================================================
  // PATIENT
  // ==========================================================

  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAddress: string;
  patientDescription?: string | null;

  // ==========================================================
  // PRACTITIONER
  // ==========================================================

  practitionerId?: string | null;
  practitionerName?: string | null;

  // ==========================================================
  // AREA
  // ==========================================================

  areaId?: string | null;
  areaName?: string | null;

  // ==========================================================
  // SERVICE
  // ==========================================================

  serviceId: string;
  serviceName?: string | null;

  // ==========================================================
  // PATIENT PACKAGE
  // ==========================================================

  patientPackageId?: string | null;
  packageName?: string | null;

  // ==========================================================
  // SCHEDULE
  // ==========================================================

  scheduledDate?: string | null;
  slotStart?: string | null;
  slotEnd?: string | null;

  // ==========================================================
  // STATUS
  // ==========================================================

  status: VisitStatus;

  // ==========================================================
  // PAYMENT CONTRACT
  //
  // Payment ownership/state is package-level.
  // A Visit only carries:
  //
  // 1. PaymentType from PatientPackage
  // 2. SettlementId for practitioner settlement tracking
  // ==========================================================

  paymentType?: PackagePaymentType | null;

  settlementId?: string | null;
}

// ============================================================
// VISIT FILTERS
// ============================================================

export interface VisitFilters {
  searchTerm?: string;

  status?: VisitStatus | 'All';
}
