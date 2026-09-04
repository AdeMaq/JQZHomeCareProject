// ============================================================
// VISIT STATUS
// ============================================================

export type VisitStatus = 'Scheduled' | 'Accepted' | 'Completed' | 'Cancelled';

// ============================================================
// RECEIVED BY
// ============================================================

export type ReceivedByType = 'Practitioner' | 'Company';

// ============================================================
// PACKAGE PAYMENT TYPE
//
// Matches backend PackagePaymentType enum:
//
// FullAdvance = 0
// Installment = 1
// ============================================================

export type PackagePaymentType = 'FullAdvance' | 'Installment';

// ============================================================
// COLLECTION STATUS
//
// Matches backend CollectionStatus enum:
//
// Pending = 0
// Received = 1
// InstallmentPending = 2
// ============================================================

export type CollectionStatus = 'Pending' | 'Received' | 'InstallmentPending';

// ============================================================
// VISIT DTO
//
// Matches backend VisitDto
// ============================================================

export interface Visit {
  id: string;

  // ==========================================================
  // PATIENT INFORMATION
  // ==========================================================

  patientId: string;

  patientName: string;

  patientPhone?: string | null;

  patientAddress?: string | null;

  patientDescription?: string | null;

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

  /**
   * Payment type of the patient's package.
   *
   * FullAdvance:
   * The package amount was already paid to the company
   * at the time of package purchase.
   *
   * Installment:
   * The package/visit balance may still require collection.
   */
  paymentType?: PackagePaymentType | null;

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

  /**
   * Amount assigned to this individual visit.
   */
  amountDue: number;

  /**
   * Amount actually received for this visit.
   */
  amountReceived: number;

  /**
   * Who received the payment.
   *
   * Practitioner
   * Company
   * null when payment has not been received.
   *
   * This is informational/audit data and should not be
   * treated as an exclusive collection lock.
   */
  receivedBy?: ReceivedByType | null;

  /**
   * AUTHORITATIVE PAYMENT/COLLECTION STATUS.
   *
   * Pending:
   * Payment has not yet been received/recorded for the visit.
   *
   * Received:
   * Full payment for the visit has been received.
   *
   * InstallmentPending:
   * A partial payment has been received and a balance remains.
   */
  collectionStatus: CollectionStatus;

  // ==========================================================
  // SETTLEMENT
  // ==========================================================

  /**
   * Settlement created for the practitioner.
   *
   * null when the visit has not yet been included
   * in a practitioner settlement.
   */
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
