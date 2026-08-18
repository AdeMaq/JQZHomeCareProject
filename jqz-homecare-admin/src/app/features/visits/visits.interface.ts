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
// Matches Backend VisitDto
// ============================================================

export interface Visit {
  id: string;

  patientId: string;
  patientName: string;

  practitionerId?: string | null;
  practitionerName?: string | null;

  areaId?: string | null;
  areaName?: string | null;

  serviceId: string;
  serviceName?: string | null;

  patientPackageId?: string | null;
  packageName?: string | null;

  scheduledDate?: string | null;

  slotStart?: string | null;
  slotEnd?: string | null;

  status: VisitStatus;

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
