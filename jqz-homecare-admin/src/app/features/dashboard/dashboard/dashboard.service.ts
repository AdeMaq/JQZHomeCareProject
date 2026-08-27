import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { DashboardDateRange, DashboardRefusal, DashboardSummary } from './dashboard.models';

/* =====================================================
   DASHBOARD SERVICE
===================================================== */

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  /* ===================================================
     DEPENDENCIES
  =================================================== */

  private readonly http = inject(HttpClient);

  /* ===================================================
     API BASE URL
  =================================================== */

  private readonly apiUrl = '/api/dashboard';

  /* ===================================================
     DASHBOARD SUMMARY
  =================================================== */

  /**
   * Gets dashboard KPI summary data.
   *
   * Endpoint:
   * GET /api/dashboard/summary?from=&to=
   */
  getSummary(dateRange: DashboardDateRange): Observable<DashboardSummary> {
    const params = new HttpParams().set('from', dateRange.from).set('to', dateRange.to);

    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`, {
      params,
    });
  }

  /* ===================================================
     DASHBOARD REFUSALS
  =================================================== */

  /**
   * Gets refusal records for the selected date range.
   *
   * Endpoint:
   * GET /api/dashboard/refusals?from=&to=
   */
  getRefusals(dateRange: DashboardDateRange): Observable<DashboardRefusal[]> {
    const params = new HttpParams().set('from', dateRange.from).set('to', dateRange.to);

    return this.http.get<DashboardRefusal[]>(`${this.apiUrl}/refusals`, {
      params,
    });
  }
}
