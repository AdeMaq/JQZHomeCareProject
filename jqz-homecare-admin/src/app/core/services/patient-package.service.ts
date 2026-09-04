import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PackagePaymentType = 'FullAdvance' | 'Installment';

export type CollectionStatus = 'Pending' | 'Received' | 'InstallmentPending';

export type ReceivedByType = 'Practitioner' | 'Company';

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
