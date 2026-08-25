import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, timeout } from 'rxjs';

import {
  BackendPractitionerSettlement,
  BackendWeeklySettlement,
  GenerateSettlementRequest,
  PractitionerSettlement,
  WeeklySettlement,
} from './payments.interface';

@Injectable({
  providedIn: 'root',
})
export class PaymentsService {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly http = inject(HttpClient);

  // ============================================================
  // API CONFIGURATION
  // ============================================================

  private readonly apiUrl = 'http://localhost:5212/api/payments';

  private readonly requestTimeout = 15000;

  // ============================================================
  // GET WEEKLY SETTLEMENT SUMMARY
  //
  // GET:
  // /api/payments/weekly-summary/{practitionerId}?weekStart=...
  // ============================================================

  getWeeklySummary(practitionerId: string, weekStart: string): Observable<WeeklySettlement> {
    return this.http
      .get<BackendWeeklySettlement>(`${this.apiUrl}/weekly-summary/${practitionerId}`, {
        params: {
          weekStart,
        },
      })
      .pipe(
        timeout(this.requestTimeout),

        map((response) => this.mapWeeklySettlement(response)),
      );
  }

  // ============================================================
  // GET PENDING SETTLEMENTS
  //
  // GET:
  // /api/payments/pending
  // ============================================================

  getPendingSettlements(): Observable<PractitionerSettlement[]> {
    return this.http.get<BackendPractitionerSettlement[]>(`${this.apiUrl}/pending`).pipe(
      timeout(this.requestTimeout),

      map((settlements) =>
        settlements.map((settlement) => this.mapPractitionerSettlement(settlement)),
      ),
    );
  }

  // ============================================================
  // GET SETTLEMENT BY ID
  //
  // GET:
  // /api/payments/{id}
  // ============================================================

  getSettlementById(id: string): Observable<PractitionerSettlement> {
    return this.http.get<BackendPractitionerSettlement>(`${this.apiUrl}/${id}`).pipe(
      timeout(this.requestTimeout),

      map((response) => this.mapPractitionerSettlement(response)),
    );
  }

  // ============================================================
  // GENERATE WEEKLY SETTLEMENT
  //
  // POST:
  // /api/payments/generate
  // ============================================================

  generateSettlement(request: GenerateSettlementRequest): Observable<PractitionerSettlement> {
    return this.http.post<BackendPractitionerSettlement>(`${this.apiUrl}/generate`, request).pipe(
      timeout(this.requestTimeout),

      map((response) => this.mapPractitionerSettlement(response)),
    );
  }

  // ============================================================
  // MARK SETTLEMENT AS RECEIVED
  //
  // PUT:
  // /api/payments/{id}/received
  // ============================================================

  markSettlementReceived(id: string): Observable<void> {
    return this.http
      .put<void>(`${this.apiUrl}/${id}/received`, {})
      .pipe(timeout(this.requestTimeout));
  }

  // ============================================================
  // BACKEND ENUM MAPPING
  // ============================================================

  private mapCollectionStatus(status: number): 'Pending' | 'Received' {
    return status === 1 ? 'Received' : 'Pending';
  }

  // ============================================================
  // MAP PRACTITIONER SETTLEMENT
  // ============================================================

  private mapPractitionerSettlement(
    settlement: BackendPractitionerSettlement,
  ): PractitionerSettlement {
    return {
      ...settlement,

      status: this.mapCollectionStatus(settlement.status),
    };
  }

  // ============================================================
  // MAP WEEKLY SETTLEMENT
  // ============================================================

  private mapWeeklySettlement(settlement: BackendWeeklySettlement): WeeklySettlement {
    return {
      ...settlement,

      status: this.mapCollectionStatus(settlement.status),

      visits: settlement.visits.map((visit) => ({
        ...visit,

        collectionStatus: this.mapCollectionStatus(visit.collectionStatus),
      })),
    };
  }
}
