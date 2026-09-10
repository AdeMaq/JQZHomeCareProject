// ============================================================
// ADD VISIT FORM MODELS
// ============================================================

export interface VisitAssignmentForm {
  practitionerId: string | null;
  areaId: string | null;
  scheduledDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
}

// ============================================================
// PRACTITIONER SCHEDULE ITEM
// ============================================================

export interface PractitionerScheduleItem {
  start: string;
  end: string;
  status: 'BOOKED' | 'AVAILABLE';
  patientName?: string;
  visitId?: string;
}

// ============================================================
// ADD VISIT FORM
// ============================================================

export interface AddVisitForm {
  patientName: string;
  patientPhone: string;
  locationAddress: string;
  description: string;
  packageId: string;
  paymentType: 'FullAdvance' | 'Installment';
  initialAmountPaid: number | null;
  visitAssignments: VisitAssignmentForm[];
}

// ============================================================
// OPEN DROPDOWN
// ============================================================

export type OpenDropdown = {
  type: 'area' | 'practitioner';
  index: number;
} | null;
