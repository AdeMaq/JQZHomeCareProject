export interface DashboardStat {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

export interface DashboardSummary {
  expectedVisits: number;
  actualVisitsDone: number;
  paymentReceived: number;
}

export interface Refusal {
  id: number;
  visitId: number;
  patientName: string;
  practitionerName: string;
  refusedBy: string;
  reason: string;
  date: string;
}
