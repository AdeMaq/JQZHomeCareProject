// ============================================================
// COLLECTION STATUS
// ============================================================
//
// Backend enum:
//
// Pending = 0
// Received = 1
//
// The frontend uses readable string values.
// ============================================================

export type CollectionStatus = 'Pending' | 'Received';

// ============================================================
// PAYMENT VISIT
// ============================================================
//
// Represents a visit returned inside WeeklySettlementDto.
// Matches the relevant fields from backend VisitDto.
// ============================================================

export interface PaymentVisit {
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

  amountDue: number;
  amountReceived: number;

  collectionStatus: CollectionStatus;

  settlementId?: string | null;
}

// ============================================================
// PRACTITIONER SETTLEMENT
// ============================================================
//
// Matches backend PractitionerSettlementDto.
// Returned from:
//
// GET /api/payments/pending
// GET /api/payments/{id}
// POST /api/payments/generate
// ============================================================

export interface PractitionerSettlement {
  id: string;

  practitionerId: string;
  practitionerName: string;

  weekStart: string;
  weekEnd: string;

  totalVisitAmount: number;

  practitionerShareAmount: number;
  companyShareAmount: number;

  status: CollectionStatus;

  receivedDate?: string | null;
}

// ============================================================
// WEEKLY SETTLEMENT SUMMARY
// ============================================================
//
// Matches backend WeeklySettlementDto.
//
// Returned from:
//
// GET /api/payments/weekly-summary/{practitionerId}
// ============================================================

export interface WeeklySettlement {
  settlementId?: string | null;

  practitionerId: string;
  practitionerName: string;

  weekStart: string;
  weekEnd: string;

  visitCount: number;

  totalVisitAmount: number;

  practitionerShareAmount: number;
  companyShareAmount: number;

  status: CollectionStatus;

  receivedDate?: string | null;

  visits: PaymentVisit[];
}

// ============================================================
// GENERATE SETTLEMENT REQUEST
// ============================================================
//
// Matches backend GenerateSettlementRequest.
//
// POST /api/payments/generate
// ============================================================

export interface GenerateSettlementRequest {
  practitionerId: string;
  weekStart: string;
}

// ============================================================
// RAW BACKEND TYPES
// ============================================================
//
// The backend serializes CollectionStatus as numbers:
//
// Pending = 0
// Received = 1
//
// These interfaces represent the raw API response before
// converting the numeric enum into readable frontend values.
// ============================================================

export interface BackendPaymentVisit extends Omit<PaymentVisit, 'collectionStatus'> {
  collectionStatus: number;
}

export interface BackendPractitionerSettlement extends Omit<PractitionerSettlement, 'status'> {
  status: number;
}

export interface BackendWeeklySettlement extends Omit<WeeklySettlement, 'status' | 'visits'> {
  status: number;

  visits: BackendPaymentVisit[];
}
