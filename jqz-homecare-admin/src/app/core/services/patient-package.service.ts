import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// ENUM TYPES
// ============================================================

export type PackagePaymentType = 'FullAdvance' | 'Installment';

export type CollectionStatus = 'Pending' | 'Received' | 'InstallmentPending';

export type ReceivedByType = 'Practitioner' | 'Company';

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
