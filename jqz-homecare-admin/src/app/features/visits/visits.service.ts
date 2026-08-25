import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { CollectionStatus, Visit, VisitStatus } from './visits.interface';

// ============================================================
// CREATE VISIT REQUEST
// Matches backend CreateVisitDto
// ============================================================

export interface CreateVisitRequest {
  patientName: string;
  patientPhone: string;
  locationAddress: string;

  description: string | null;

  packageId: string;

  /*
   * Backend PackagePaymentType enum:
   *
   * FullAdvance = 0
   * Installment = 1
   */
  paymentType: 0 | 1;

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
// SCHEDULE VISIT REQUEST
// Matches backend ScheduleVisitDto
// ============================================================

export interface ScheduleVisitRequest {
  scheduledDate: string;
  slotStart: string;
  slotEnd: string;
}

// ============================================================
// REASSIGN PRACTITIONER REQUEST
// Matches backend ReassignPractitionerDto
// ============================================================

export interface ReassignPractitionerRequest {
  practitionerId: string;
  areaId: string | null;
  refusedBy: 'Patient' | 'Practitioner';
  reason: string;
}

// ============================================================
// RAW BACKEND VISIT
// ============================================================
//
// Backend returns enum values as numbers.
//
// VisitStatus:
// 0 = Scheduled
// 1 = Accepted
// 2 = Completed
// 3 = Cancelled
//
// CollectionStatus:
// 0 = Pending
// 1 = Received
//
// We convert these numeric values into the string values
// expected by the frontend Visit interface.
// ============================================================

interface BackendVisit extends Omit<Visit, 'status' | 'collectionStatus'> {
  status: number;
  collectionStatus: number;
}

// ============================================================
// VISITS SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class VisitsService {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly http = inject(HttpClient);

  // ============================================================
  // API ENDPOINT
  // ============================================================

  private readonly apiUrl = 'http://localhost:5212/api/visits';

  // ============================================================
  // GET ALL VISITS
  // ============================================================

  getAll(): Observable<Visit[]> {
    return this.http
      .get<BackendVisit[]>(this.apiUrl)
      .pipe(
        map((visits: BackendVisit[]) => visits.map((visit: BackendVisit) => this.mapVisit(visit))),
      );
  }

  // ============================================================
  // GET VISIT BY ID
  // ============================================================

  getById(id: string): Observable<Visit> {
    return this.http
      .get<BackendVisit>(`${this.apiUrl}/${id}`)
      .pipe(map((visit: BackendVisit) => this.mapVisit(visit)));
  }

  // ============================================================
  // CREATE VISIT
  // ============================================================

  create(request: CreateVisitRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, request);
  }

  // ============================================================
  // SCHEDULE VISIT
  // ============================================================

  schedule(id: string, request: ScheduleVisitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/schedule`, request);
  }

  // ============================================================
  // REASSIGN PRACTITIONER
  // ============================================================

  reassign(id: string, request: ReassignPractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reassign`, request);
  }

  // ============================================================
  // GET TODAY VISITS
  //
  // Backend:
  // GET /api/visits/today
  //
  // Optional query:
  // ?practitionerId={guid}
  // ============================================================

  getToday(practitionerId?: string): Observable<Visit[]> {
    let params = new HttpParams();

    if (practitionerId) {
      params = params.set('practitionerId', practitionerId);
    }

    return this.http
      .get<BackendVisit[]>(`${this.apiUrl}/today`, { params })
      .pipe(
        map((visits: BackendVisit[]) => visits.map((visit: BackendVisit) => this.mapVisit(visit))),
      );
  }

  // ============================================================
  // GET VISITS BY DATE
  //
  // Backend:
  // GET /api/visits/by-date
  //
  // Optional query:
  //
  // ?date=2026-08-21
  //
  // If no date is provided, backend returns all visits.
  // ============================================================

  getByDate(date?: string): Observable<Visit[]> {
    let params = new HttpParams();

    if (date) {
      params = params.set('date', date);
    }

    return this.http
      .get<BackendVisit[]>(`${this.apiUrl}/by-date`, { params })
      .pipe(
        map((visits: BackendVisit[]) => visits.map((visit: BackendVisit) => this.mapVisit(visit))),
      );
  }

  // ============================================================
  // GET PRACTITIONER VISITS BY DATE
  //
  // Backend:
  //
  // GET /api/visits/by-date?date=2026-08-21
  //
  // The backend returns visits for the selected date.
  //
  // We then filter those visits on the frontend so that
  // only visits belonging to the selected practitioner
  // are returned.
  // ============================================================

  getPractitionerVisitsByDate(practitionerId: string, date: string): Observable<Visit[]> {
    return this.getByDate(date).pipe(
      map((visits: Visit[]) =>
        visits.filter((visit: Visit) => visit.practitionerId === practitionerId),
      ),
    );
  }

  // ============================================================
  // MAP BACKEND VISIT
  // ============================================================

  private mapVisit(visit: BackendVisit): Visit {
    return {
      ...visit,

      status: this.mapVisitStatus(visit.status),

      collectionStatus: this.mapCollectionStatus(visit.collectionStatus),
    };
  }

  // ============================================================
  // MAP VISIT STATUS
  // ============================================================

  private mapVisitStatus(status: number): VisitStatus {
    switch (status) {
      case 0:
        return 'Scheduled';

      case 1:
        return 'Accepted';

      case 2:
        return 'Completed';

      case 3:
        return 'Cancelled';

      default:
        console.warn('Unknown visit status received from API:', status);

        return 'Scheduled';
    }
  }

  // ============================================================
  // MAP COLLECTION STATUS
  // ============================================================

  private mapCollectionStatus(status: number): CollectionStatus {
    switch (status) {
      case 0:
        return 'Pending';

      case 1:
        return 'Received';

      default:
        console.warn('Unknown collection status received from API:', status);

        return 'Pending';
    }
  }
}
