/* =====================================================
   DASHBOARD MODELS
===================================================== */

/* =====================================================
   DASHBOARD SUMMARY

   Matches:

   GET /api/dashboard/summary?from=&to=

   Backend DashboardSummaryDto currently returns:

   ExpectedVisits
   ActualVisitsDone
   PaymentReceived
   PendingCollectionAmount
===================================================== */

export interface DashboardSummary {
  expectedVisits: number;

  actualVisitsDone: number;

  paymentReceived: number;

  pendingCollectionAmount: number;
}

/* =====================================================
   FRONTEND DASHBOARD PAYMENT SUMMARY

   These values are calculated from the Visits API.

   This allows the dashboard to calculate outstanding
   amounts without requiring backend changes.
===================================================== */

export interface DashboardPaymentSummary {
  totalAmountDue: number;

  totalAmountReceived: number;

  totalOutstandingAmount: number;
}

/* =====================================================
   REFUSAL

   Matches records returned by:

   GET /api/dashboard/refusals?from=&to=
===================================================== */

export interface DashboardRefusal {
  visitId: string;

  refusedBy: string;

  reason: string;

  date: string;
}

/* =====================================================
   REFUSAL TYPE
===================================================== */

export type RefusedBy = 'Patient' | 'Practitioner';

/* =====================================================
   DASHBOARD DATE RANGE
===================================================== */

export interface DashboardDateRange {
  from: string;

  to: string;
}
