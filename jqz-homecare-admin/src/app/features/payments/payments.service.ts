import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

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
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/payments';

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
      .pipe(map((response) => this.mapWeeklySettlement(response)));
  }

  // ============================================================
  // GET PENDING SETTLEMENTS
  //
  // GET:
  // /api/payments/pending
  // ============================================================

  getPendingSettlements(): Observable<PractitionerSettlement[]> {
    return this.http
      .get<BackendPractitionerSettlement[]>(`${this.apiUrl}/pending`)
      .pipe(
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
    return this.http
      .get<BackendPractitionerSettlement>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => this.mapPractitionerSettlement(response)));
  }

  // ============================================================
  // GENERATE WEEKLY SETTLEMENT
  //
  // POST:
  // /api/payments/generate
  // ============================================================

  generateSettlement(request: GenerateSettlementRequest): Observable<PractitionerSettlement> {
    return this.http
      .post<BackendPractitionerSettlement>(`${this.apiUrl}/generate`, request)
      .pipe(map((response) => this.mapPractitionerSettlement(response)));
  }

  // ============================================================
  // MARK SETTLEMENT AS RECEIVED
  //
  // PUT:
  // /api/payments/{id}/received
  // ============================================================

  markSettlementReceived(id: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/received`, {});
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
