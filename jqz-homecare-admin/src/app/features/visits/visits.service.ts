import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { CollectionStatus, PackagePaymentType, Visit, VisitStatus } from './visits.interface';

// ============================================================
// CREATE VISIT REQUEST
//
// Matches backend CreateVisitDto
// ============================================================

export interface CreateVisitRequest {
  patientName: string;

  patientPhone: string;

  locationAddress: string;

  /**
   * Matches backend CreateVisitDto.PatientDescription.
   */
  patientDescription: string | null;

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
//
// Matches backend ScheduleVisitDto
// ============================================================

export interface ScheduleVisitRequest {
  scheduledDate: string;

  slotStart: string;

  slotEnd: string;
}

// ============================================================
// REASSIGN PRACTITIONER REQUEST
// ============================================================

export interface ReassignPractitionerRequest {
  practitionerId: string;

  areaId: string | null;

  refusedBy: 'Patient' | 'Practitioner';

  reason: string;
}

// ============================================================
// COLLECT PAYMENT REQUEST
//
// Used by Admin/Company to collect payment for a visit.
//
// Example:
//
// Amount Due       = 5000
// Amount Received  = 2000
// Remaining        = 3000
//
// A later collection can record the remaining balance.
//
// FullAdvance visits should never reach this endpoint from
// the Payment Collection screen because their package amount
// has already been received by the company.
// ============================================================

export interface CollectPaymentRequest {
  amount: number;
}

// ============================================================
// MARK PAYMENT RECEIVED REQUEST
//
// Used for the practitioner payment workflow.
//
// Matches backend MarkPaymentReceivedDto
// ============================================================

export interface MarkPaymentReceivedRequest {
  amount: number;
}

// ============================================================
// BACKEND ENUM VALUES
//
// Backend may return enum values as:
//
// Numeric:
// VisitStatus:
// 0 = Scheduled
// 1 = Accepted
// 2 = Completed
// 3 = Cancelled
//
// CollectionStatus:
// 0 = Pending
// 1 = Received
// 2 = InstallmentPending
//
// PackagePaymentType:
// 0 = FullAdvance
// 1 = Installment
//
// Or as strings:
//
// "Scheduled"
// "Accepted"
// "Completed"
// "Cancelled"
//
// "Pending"
// "Received"
// "InstallmentPending"
//
// "FullAdvance"
// "Installment"
//
// The frontend supports both formats.
// ============================================================

type BackendVisitStatus = number | string;

type BackendCollectionStatus = number | string;

type BackendPaymentType = number | string;

// ============================================================
// RAW BACKEND VISIT
// ============================================================

interface BackendVisit extends Omit<Visit, 'status' | 'collectionStatus' | 'paymentType'> {
  status: BackendVisitStatus;

  collectionStatus: BackendCollectionStatus;

  paymentType?: BackendPaymentType | null;
}

// ============================================================
// VISITS SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class VisitsService {
  // ==========================================================
  // SERVICES
  // ==========================================================

  private readonly http = inject(HttpClient);

  // ==========================================================
  // API ENDPOINT
  // ==========================================================

  private readonly apiUrl = 'http://localhost:5212/api/visits';

  // ==========================================================
  // GET ALL VISITS
  // ==========================================================

  getAll(): Observable<Visit[]> {
    return this.http
      .get<BackendVisit[]>(this.apiUrl)
      .pipe(
        map((visits: BackendVisit[]) => visits.map((visit: BackendVisit) => this.mapVisit(visit))),
      );
  }

  // ==========================================================
  // GET VISIT BY ID
  // ==========================================================

  getById(id: string): Observable<Visit> {
    return this.http
      .get<BackendVisit>(`${this.apiUrl}/${id}`)
      .pipe(map((visit: BackendVisit) => this.mapVisit(visit)));
  }

  // ==========================================================
  // CREATE VISIT
  // ==========================================================

  create(request: CreateVisitRequest): Observable<unknown> {
    return this.http.post<unknown>(this.apiUrl, request);
  }

  // ==========================================================
  // SCHEDULE VISIT
  // ==========================================================

  schedule(id: string, request: ScheduleVisitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/schedule`, request);
  }

  // ==========================================================
  // REASSIGN PRACTITIONER
  // ==========================================================

  reassign(id: string, request: ReassignPractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reassign`, request);
  }

  // ==========================================================
  // GET TODAY VISITS
  // ==========================================================

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

  // ==========================================================
  // GET VISITS BY DATE
  // ==========================================================

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

  // ==========================================================
  // GET PRACTITIONER VISITS BY DATE
  // ==========================================================

  getPractitionerVisitsByDate(practitionerId: string, date: string): Observable<Visit[]> {
    return this.getByDate(date).pipe(
      map((visits: Visit[]) =>
        visits.filter((visit: Visit) => visit.practitionerId === practitionerId),
      ),
    );
  }

  // ==========================================================
  // COLLECT PAYMENT
  //
  // Backend:
  //
  // PUT /api/visits/{id}/collect-payment
  //
  // This is the Admin/Company payment collection workflow.
  //
  // FullAdvance visits should not call this endpoint because
  // their package amount has already been received by Company.
  // ==========================================================

  collectPayment(id: string, request: CollectPaymentRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/collect-payment`, request);
  }

  // ==========================================================
  // MARK PAYMENT RECEIVED
  //
  // Backend:
  //
  // PUT /api/visits/{id}/mark-payment-received
  //
  // This endpoint is available for the practitioner-payment
  // workflow.
  //
  // The backend remains responsible for changing the
  // CollectionStatus to Received when the full visit amount
  // has been collected.
  // ==========================================================

  markPaymentReceived(id: string, request: MarkPaymentReceivedRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/mark-payment-received`, request);
  }

  // ==========================================================
  // MAP BACKEND VISIT
  // ==========================================================

  private mapVisit(visit: BackendVisit): Visit {
    return {
      ...visit,

      amountDue: Number(visit.amountDue ?? 0),

      amountReceived: Number(visit.amountReceived ?? 0),

      status: this.mapVisitStatus(visit.status),

      collectionStatus: this.mapCollectionStatus(visit.collectionStatus),

      paymentType: this.mapPaymentType(visit.paymentType),
    };
  }

  // ==========================================================
  // MAP VISIT STATUS
  // ==========================================================

  private mapVisitStatus(status: BackendVisitStatus): VisitStatus {
    // --------------------------------------------------------
    // STRING ENUM SUPPORT
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // NUMERIC ENUM SUPPORT
    // --------------------------------------------------------

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

  // ==========================================================
  // MAP COLLECTION STATUS
  //
  // Backend enum:
  //
  // Pending = 0
  // Received = 1
  // InstallmentPending = 2
  // ==========================================================

  private mapCollectionStatus(status: BackendCollectionStatus): CollectionStatus {
    // --------------------------------------------------------
    // STRING ENUM SUPPORT
    // --------------------------------------------------------

    if (typeof status === 'string') {
      switch (status.trim().toLowerCase()) {
        case 'pending':
          return 'Pending';

        case 'received':
          return 'Received';

        case 'installmentpending':
        case 'installment_pending':
        case 'installment pending':
          return 'InstallmentPending';

        default:
          console.warn('Unknown collection status received from API:', status);

          /*
           * Safe fallback:
           *
           * Unknown payment status must not accidentally
           * hide a payment that could still be pending.
           */

          return 'Pending';
      }
    }

    // --------------------------------------------------------
    // NUMERIC ENUM SUPPORT
    // --------------------------------------------------------

    switch (status) {
      case 0:
        return 'Pending';

      case 1:
        return 'Received';

      case 2:
        return 'InstallmentPending';

      default:
        console.warn('Unknown collection status received from API:', status);

        return 'Pending';
    }
  }

  // ==========================================================
  // MAP PACKAGE PAYMENT TYPE
  //
  // Backend enum:
  //
  // FullAdvance = 0
  // Installment = 1
  //
  // Supports both numeric and string JSON enum responses.
  // ==========================================================

  private mapPaymentType(
    paymentType: BackendPaymentType | null | undefined,
  ): PackagePaymentType | null {
    // --------------------------------------------------------
    // NULL / UNDEFINED
    // --------------------------------------------------------

    if (paymentType === null || paymentType === undefined) {
      return null;
    }

    // --------------------------------------------------------
    // STRING ENUM SUPPORT
    // --------------------------------------------------------

    if (typeof paymentType === 'string') {
      switch (paymentType.trim().toLowerCase()) {
        case 'fulladvance':
        case 'full_advance':
        case 'full advance':
          return 'FullAdvance';

        case 'installment':
          return 'Installment';

        default:
          console.warn('Unknown payment type received from API:', paymentType);

          return null;
      }
    }

    // --------------------------------------------------------
    // NUMERIC ENUM SUPPORT
    // --------------------------------------------------------

    switch (paymentType) {
      case 0:
        return 'FullAdvance';

      case 1:
        return 'Installment';

      default:
        console.warn('Unknown payment type received from API:', paymentType);

        return null;
    }
  }
}
