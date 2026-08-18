import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Visit } from './visits.interface';

// ============================================================
// CREATE VISIT REQUEST
// Matches the backend Create Visit request
// ============================================================

export interface CreateVisitRequest {
  patientName: string;
  patientPhone: string;
  locationAddress: string;

  packageId: string;

  paymentType: 'FullAdvance' | 'Installment';

  initialAmountPaid: number | null;

  visitAssignments: {
    practitionerId: string | null;
    areaId: string | null;
    scheduledDate: string | null;
    slotStart: string | null;
    slotEnd: string | null;
  }[];
}

// ============================================================
// VISITS SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class VisitsService {
  private readonly http = inject(HttpClient);

  // ============================================================
  // API ENDPOINT
  // ============================================================

  private readonly apiUrl = 'http://localhost:5212/api/visits';

  // ============================================================
  // GET ALL VISITS
  // ============================================================

  getAll(): Observable<Visit[]> {
    return this.http.get<Visit[]>(this.apiUrl);
  }

  // ============================================================
  // GET VISIT BY ID
  // Used later by Visit Details
  // ============================================================

  getById(id: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/${id}`);
  }

  // ============================================================
  // CREATE VISIT
  // ============================================================

  create(request: CreateVisitRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, request);
  }
}
