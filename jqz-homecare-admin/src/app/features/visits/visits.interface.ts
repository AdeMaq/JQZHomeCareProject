// ============================================================
// VISIT STATUS
// ============================================================

export type VisitStatus = 'Scheduled' | 'Accepted' | 'Completed' | 'Cancelled';

// ============================================================
// RECEIVED BY
// ============================================================

export type ReceivedByType = 'Practitioner' | 'Company';

// ============================================================
// COLLECTION STATUS
// ============================================================

export type CollectionStatus = 'Pending' | 'Received';

// ============================================================
// VISIT DTO
//
// Matches Backend VisitDto
// ============================================================

export interface Visit {
  id: string;

  // ==========================================================
  // PATIENT INFORMATION
  // ==========================================================

  patientId: string;

  patientName: string;

  patientPhone?: string | null;

  locationAddress?: string | null;

  // ==========================================================
  // PRACTITIONER INFORMATION
  // ==========================================================

  practitionerId?: string | null;

  practitionerName?: string | null;

  // ==========================================================
  // AREA INFORMATION
  // ==========================================================

  areaId?: string | null;

  areaName?: string | null;

  // ==========================================================
  // SERVICE INFORMATION
  // ==========================================================

  serviceId: string;

  serviceName?: string | null;

  // ==========================================================
  // PACKAGE INFORMATION
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
  // VISIT STATUS
  // ==========================================================

  status: VisitStatus;

  // ==========================================================
  // PAYMENT INFORMATION
  // ==========================================================

  amountDue: number;

  amountReceived: number;

  receivedBy?: ReceivedByType | null;

  collectionStatus: CollectionStatus;

  settlementId?: string | null;
}

// ============================================================
// DISPLAY / FILTER TYPES
// ============================================================

export interface VisitFilters {
  searchTerm: string;

  status: VisitStatus | 'All';

  collectionStatus: CollectionStatus | 'All';
}
