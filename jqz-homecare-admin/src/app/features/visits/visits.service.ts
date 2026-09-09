import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { PackagePaymentType, Visit, VisitStatus } from './visits.interface';

// ============================================================
// REQUEST MODELS
// ============================================================

export interface VisitAssignment {
  areaId?: string | null;
  practitionerId?: string | null;
  scheduledDate?: string | null;
  slotStart?: string | null;
  slotEnd?: string | null;
}

export interface CreateVisitRequest {
  patientPhone: string;
  patientName: string;
  patientAddress: string;
  patientDescription?: string | null;

  packageId: string;
  paymentType: PackagePaymentType;

  initialAmount?: number;

  assignments: VisitAssignment[];
}

export interface ScheduleVisitRequest {
  scheduledDate: string;
  slotStart: string;
  slotEnd: string;
}

export interface ReassignPractitionerRequest {
  practitionerId: string;
}

export interface CollectPaymentRequest {
  amount: number;
}

export interface MarkPaymentReceivedRequest {
  amount: number;
}

// ============================================================
// BACKEND ENUM TYPES
//
// ASP.NET Core may return enums as numeric values or strings,
// depending on JSON configuration.
// ============================================================

type BackendVisitStatus = number | string;
type BackendPaymentType = number | string;

// ============================================================
// BACKEND VISIT DTO
//
// This mirrors the actual backend VisitDto.
//
// IMPORTANT:
// Visit no longer contains visit-level payment fields such as:
// - amountDue
// - amountReceived
// - collectionStatus
// - receivedBy
//
// Payment collection information is package-level.
// ============================================================

interface BackendVisit extends Omit<Visit, 'status' | 'paymentType'> {
  status: BackendVisitStatus;
  paymentType?: BackendPaymentType | null;
}

// ============================================================
// VISITS SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class VisitsService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/visits';

  // ============================================================
  // GET ALL VISITS
  // ============================================================

  getAll(): Observable<Visit[]> {
    return new Observable<Visit[]>((subscriber) => {
      this.http.get<BackendVisit[]>(this.apiUrl).subscribe({
        next: (visits) => {
          subscriber.next(visits.map((visit) => this.mapVisit(visit)));

          subscriber.complete();
        },

        error: (error) => {
          subscriber.error(error);
        },
      });
    });
  }

  // ============================================================
  // GET VISIT BY ID
  // ============================================================

  getById(id: string): Observable<Visit> {
    return new Observable<Visit>((subscriber) => {
      this.http.get<BackendVisit>(`${this.apiUrl}/${id}`).subscribe({
        next: (visit) => {
          subscriber.next(this.mapVisit(visit));

          subscriber.complete();
        },

        error: (error) => {
          subscriber.error(error);
        },
      });
    });
  }

  // ============================================================
  // CREATE VISIT
  // ============================================================

  createVisit(request: CreateVisitRequest): Observable<unknown> {
    return this.http.post(this.apiUrl, request);
  }

  // ============================================================
  // SCHEDULE VISIT
  //
  // Backend:
  // PUT /api/visits/{id}/schedule
  //
  // The edit-visit component expects a method named `schedule`
  // returning Observable<void>.
  // ============================================================

  schedule(id: string, request: ScheduleVisitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/schedule`, request);
  }

  // ============================================================
  // SCHEDULE VISIT ALIAS
  //
  // Kept for compatibility with any existing component that
  // already uses scheduleVisit().
  // ============================================================

  scheduleVisit(id: string, request: ScheduleVisitRequest): Observable<void> {
    return this.schedule(id, request);
  }

  // ============================================================
  // GET TODAY'S VISITS
  // ============================================================

  getToday(): Observable<Visit[]> {
    return new Observable<Visit[]>((subscriber) => {
      this.http.get<BackendVisit[]>(`${this.apiUrl}/today`).subscribe({
        next: (visits) => {
          subscriber.next(visits.map((visit) => this.mapVisit(visit)));

          subscriber.complete();
        },

        error: (error) => {
          subscriber.error(error);
        },
      });
    });
  }

  // ============================================================
  // GET VISITS BY DATE
  //
  // Backend:
  // GET /api/visits/by-date?date=YYYY-MM-DD
  // ============================================================

  getByDate(date: string): Observable<Visit[]> {
    return new Observable<Visit[]>((subscriber) => {
      this.http
        .get<BackendVisit[]>(`${this.apiUrl}/by-date`, {
          params: {
            date,
          },
        })
        .subscribe({
          next: (visits) => {
            subscriber.next(visits.map((visit) => this.mapVisit(visit)));

            subscriber.complete();
          },

          error: (error) => {
            subscriber.error(error);
          },
        });
    });
  }

  // ============================================================
  // GET PRACTITIONER VISITS BY DATE
  //
  // IMPORTANT:
  // There is NO backend endpoint:
  //
  // GET /api/visits/practitioner/{practitionerId}/by-date
  //
  // Therefore, this method intentionally uses the existing
  // GET /api/visits/by-date endpoint and filters the visits
  // on the frontend by practitionerId.
  //
  // This keeps the solution completely frontend-side and
  // avoids changing the backend controller/service.
  // ============================================================

  getPractitionerVisitsByDate(practitionerId: string, date: string): Observable<Visit[]> {
    return this.getByDate(date).pipe(
      map((visits) => visits.filter((visit) => visit.practitionerId === practitionerId)),
    );
  }

  // ============================================================
  // CHECK IN
  // ============================================================

  checkIn(id: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/checkin`, {});
  }

  // ============================================================
  // CHECK OUT
  // ============================================================

  checkOut(id: string, amount?: number): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/checkout`, {
      amount,
    });
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(id: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/cancel`, {});
  }

  // ============================================================
  // REASSIGN PRACTITIONER
  //
  // Backend:
  // PUT /api/visits/{id}/reassign
  //
  // The edit-visit component expects Observable<void>.
  // ============================================================

  reassign(id: string, request: ReassignPractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reassign`, request);
  }

  // ============================================================
  // ASSIGN VISIT
  //
  // Backend:
  // PUT /api/visits/{id}/assign
  // ============================================================

  assign(id: string, request: ReassignPractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/assign`, request);
  }

  // ============================================================
  // MAP BACKEND VISIT DTO → FRONTEND VISIT
  // ============================================================

  private mapVisit(visit: BackendVisit): Visit {
    return {
      id: visit.id,

      // --------------------------------------------------------
      // Patient
      // --------------------------------------------------------

      patientId: visit.patientId,
      patientName: visit.patientName ?? '',
      patientPhone: visit.patientPhone ?? '',
      patientAddress: visit.patientAddress ?? '',
      patientDescription: visit.patientDescription ?? null,

      // --------------------------------------------------------
      // Practitioner
      // --------------------------------------------------------

      practitionerId: visit.practitionerId ?? null,

      practitionerName: visit.practitionerName ?? null,

      // --------------------------------------------------------
      // Area
      // --------------------------------------------------------

      areaId: visit.areaId ?? null,

      areaName: visit.areaName ?? null,

      // --------------------------------------------------------
      // Service
      // --------------------------------------------------------

      serviceId: visit.serviceId,
      serviceName: visit.serviceName ?? null,

      // --------------------------------------------------------
      // Patient Package
      // --------------------------------------------------------

      patientPackageId: visit.patientPackageId ?? null,
      packageName: visit.packageName ?? null,

      // --------------------------------------------------------
      // Schedule
      // --------------------------------------------------------

      scheduledDate: visit.scheduledDate ?? null,
      slotStart: visit.slotStart ?? null,
      slotEnd: visit.slotEnd ?? null,

      // --------------------------------------------------------
      // Status
      // --------------------------------------------------------

      status: this.mapVisitStatus(visit.status),

      // --------------------------------------------------------
      // Payment
      //
      // Only payment type and settlement ID belong to Visit.
      //
      // Package-level payment information is loaded separately
      // through PatientPackageService.
      // --------------------------------------------------------

      paymentType: this.mapPaymentType(visit.paymentType),

      settlementId: visit.settlementId ?? null,
    };
  }

  // ============================================================
  // MAP VISIT STATUS
  // ============================================================

  private mapVisitStatus(status: BackendVisitStatus): VisitStatus {
    if (typeof status === 'number') {
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
          return 'Scheduled';
      }
    }

    switch (status) {
      case 'Scheduled':
        return 'Scheduled';

      case 'Accepted':
        return 'Accepted';

      case 'Completed':
        return 'Completed';

      case 'Cancelled':
        return 'Cancelled';

      default:
        return 'Scheduled';
    }
  }

  // ============================================================
  // MAP PAYMENT TYPE
  // ============================================================

  private mapPaymentType(paymentType?: BackendPaymentType | null): PackagePaymentType | null {
    if (paymentType === null || paymentType === undefined) {
      return null;
    }

    if (typeof paymentType === 'number') {
      switch (paymentType) {
        case 0:
          return 'FullAdvance';

        case 1:
          return 'Installment';

        default:
          return null;
      }
    }

    switch (paymentType) {
      case 'FullAdvance':
        return 'FullAdvance';

      case 'Installment':
        return 'Installment';

      default:
        return null;
    }
  }
}
