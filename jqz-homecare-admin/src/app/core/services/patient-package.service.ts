import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Visit } from '../../features/visits/visits.interface';

// ============================================================
// ENUM TYPES
// ============================================================

export type PackagePaymentType = 'FullAdvance' | 'Installment';

export type CollectionStatus = 'Pending' | 'Received' | 'InstallmentPending';

export type ReceivedByType = 'Practitioner' | 'Company';

// ============================================================
// INSTALLMENT PAYMENT MODEL
// ============================================================

export interface InstallmentPayment {
  id: string;

  patientPackageId: string;

  visitId?: string | null;

  amount: number;

  receivedBy: ReceivedByType;

  date: string;
}

// ============================================================
// PATIENT PACKAGE MODEL
// ============================================================

export interface PatientPackage {
  id: string;

  patientId: string;
  patientName: string;

  packageId: string;
  packageName: string;

  paymentType: PackagePaymentType;

  totalAmount: number;
  amountPaid: number;
  amountPending: number;

  collectionStatus: CollectionStatus;

  receivedBy?: ReceivedByType | null;

  status: string;

  purchaseDate: string;

  // ==========================================================
  // PACKAGE VISITS
  //
  // Matches backend PatientPackageDto.Visits
  // ==========================================================

  visits: Visit[];

  // ==========================================================
  // INSTALLMENT PAYMENT HISTORY
  //
  // Matches backend PatientPackageDto.InstallmentPayments
  // ==========================================================

  installmentPayments: InstallmentPayment[];
}

// ============================================================
// PATIENT PACKAGE SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class PatientPackageService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/patient-packages';

  // ============================================================
  // GET PATIENT PACKAGE BY ID
  // ============================================================

  getById(id: string): Observable<PatientPackage> {
    return this.http.get<PatientPackage>(`${this.apiUrl}/${id}`);
  }
}
