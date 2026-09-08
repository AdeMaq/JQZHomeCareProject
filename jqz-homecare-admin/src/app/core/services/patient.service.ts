import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// PATIENT MODEL
// ============================================================

export interface Patient {
  id: string;
  name: string;
  phone: string;
  visitCount: number;
  locationAddress: string;
  patientDescription?: string | null;
}

// ============================================================
// PATIENT SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/patients';

  // ============================================================
  // GET ALL PATIENTS
  // ============================================================

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.apiUrl);
  }

  // ============================================================
  // GET PATIENT BY ID
  // ============================================================

  getPatientById(id: string): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  // ============================================================
  // GET PATIENT BY PHONE
  // ============================================================

  getPatientByPhone(phone: string): Observable<Patient> {
    const normalizedPhone = phone.trim();

    return this.http.get<Patient>(`${this.apiUrl}/phone/${encodeURIComponent(normalizedPhone)}`);
  }
}
