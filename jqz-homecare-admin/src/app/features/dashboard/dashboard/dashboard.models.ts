/* =====================================================
   DASHBOARD MODELS
===================================================== */

/* =====================================================
   DASHBOARD SUMMARY
===================================================== */

/**
 * Matches the response returned by:
 *
 * GET /api/dashboard/summary?from=&to=
 */
export interface DashboardSummary {
  expectedVisits: number;
  actualVisitsDone: number;
  paymentReceived: number;
  pendingCollectionAmount: number;
}

/* =====================================================
   REFUSAL
===================================================== */

/**
 * Matches the Refusal records returned by:
 *
 * GET /api/dashboard/refusals?from=&to=
 */
export interface DashboardRefusal {
  visitId: string;
  refusedBy: string;
  reason: string;
  date: string;
}

/* =====================================================
   REFUSAL TYPE
===================================================== */

/**
 * Values currently supported by the backend.
 */
export type RefusedBy = 'Patient' | 'Practitioner';

/* =====================================================
   DASHBOARD DATE RANGE
===================================================== */

/**
 * Represents the date range used for dashboard API calls.
 */
export interface DashboardDateRange {
  from: string;
  to: string;
}
