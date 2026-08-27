import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { CollectionStatus, Visit, VisitStatus } from './visits.interface';

/* ============================================================
   CREATE VISIT REQUEST

   Matches backend CreateVisitDto
============================================================ */

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

/* ============================================================
   SCHEDULE VISIT REQUEST

   Matches backend ScheduleVisitDto
============================================================ */

export interface ScheduleVisitRequest {
  scheduledDate: string;

  slotStart: string;

  slotEnd: string;
}

/* ============================================================
   REASSIGN PRACTITIONER REQUEST
============================================================ */

export interface ReassignPractitionerRequest {
  practitionerId: string;

  areaId: string | null;

  refusedBy: 'Patient' | 'Practitioner';

  reason: string;
}

/* ============================================================
   BACKEND ENUM VALUES

   The backend may return enum values either as:

   Numeric:

   0, 1, 2, 3

   Or strings:

   "Scheduled"
   "Accepted"
   "Completed"
   "Cancelled"

   Therefore, the frontend supports both formats.
============================================================ */

type BackendVisitStatus = number | string;

type BackendCollectionStatus = number | string;

/* ============================================================
   RAW BACKEND VISIT
============================================================ */

interface BackendVisit extends Omit<Visit, 'status' | 'collectionStatus'> {
  status: BackendVisitStatus;

  collectionStatus: BackendCollectionStatus;
}

/* ============================================================
   VISITS SERVICE
============================================================ */

@Injectable({
  providedIn: 'root',
})
export class VisitsService {
  /* ============================================================
     SERVICES
  ============================================================ */

  private readonly http = inject(HttpClient);

  /* ============================================================
     API ENDPOINT
  ============================================================ */

  private readonly apiUrl = 'http://localhost:5212/api/visits';

  /* ============================================================
     GET ALL VISITS
  ============================================================ */

  getAll(): Observable<Visit[]> {
    return this.http
      .get<BackendVisit[]>(this.apiUrl)
      .pipe(
        map((visits: BackendVisit[]) => visits.map((visit: BackendVisit) => this.mapVisit(visit))),
      );
  }

  /* ============================================================
     GET VISIT BY ID
  ============================================================ */

  getById(id: string): Observable<Visit> {
    return this.http
      .get<BackendVisit>(`${this.apiUrl}/${id}`)
      .pipe(map((visit: BackendVisit) => this.mapVisit(visit)));
  }

  /* ============================================================
     CREATE VISIT
  ============================================================ */

  create(request: CreateVisitRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, request);
  }

  /* ============================================================
     SCHEDULE VISIT
  ============================================================ */

  schedule(id: string, request: ScheduleVisitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/schedule`, request);
  }

  /* ============================================================
     REASSIGN PRACTITIONER
  ============================================================ */

  reassign(id: string, request: ReassignPractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reassign`, request);
  }

  /* ============================================================
     GET TODAY VISITS
  ============================================================ */

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

  /* ============================================================
     GET VISITS BY DATE
  ============================================================ */

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

  /* ============================================================
     GET PRACTITIONER VISITS BY DATE
  ============================================================ */

  getPractitionerVisitsByDate(practitionerId: string, date: string): Observable<Visit[]> {
    return this.getByDate(date).pipe(
      map((visits: Visit[]) =>
        visits.filter((visit: Visit) => visit.practitionerId === practitionerId),
      ),
    );
  }

  /* ============================================================
     MAP BACKEND VISIT
  ============================================================ */

  private mapVisit(visit: BackendVisit): Visit {
    return {
      ...visit,

      amountDue: Number(visit.amountDue ?? 0),

      amountReceived: Number(visit.amountReceived ?? 0),

      status: this.mapVisitStatus(visit.status),

      collectionStatus: this.mapCollectionStatus(visit.collectionStatus),
    };
  }

  /* ============================================================
     MAP VISIT STATUS
  ============================================================ */

  private mapVisitStatus(status: BackendVisitStatus): VisitStatus {
    /*
     * Backend returns string enum values.
     */

    if (typeof status === 'string') {
      switch (status.trim().toLowerCase()) {
        case 'scheduled':
          return 'Scheduled';

        case 'accepted':
          return 'Accepted';

        case 'completed':
          return 'Completed';

        case 'cancelled':
        case 'canceled':
          return 'Cancelled';

        default:
          console.warn('Unknown visit status received from API:', status);

          return 'Scheduled';
      }
    }

    /*
     * Numeric enum support.
     */

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

  /* ============================================================
     MAP COLLECTION STATUS
  ============================================================ */

  private mapCollectionStatus(status: BackendCollectionStatus): CollectionStatus {
    /*
     * Backend returns string enum values.
     */

    if (typeof status === 'string') {
      switch (status.trim().toLowerCase()) {
        case 'pending':
          return 'Pending';

        case 'received':
          return 'Received';

        default:
          console.warn('Unknown collection status received from API:', status);

          return 'Pending';
      }
    }

    /*
     * Numeric enum support.
     */

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
