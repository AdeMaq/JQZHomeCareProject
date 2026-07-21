import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Area, CreateVisit, Package, Practitioner, Service } from './add-visit.interface';

@Injectable({
  providedIn: 'root',
})
export class AddVisitService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api';

  // =========================
  // GET ALL PRACTITIONERS
  // =========================

  getPractitioners(): Observable<Practitioner[]> {
    return this.http.get<Practitioner[]>(`${this.apiUrl}/Practitioners`);
  }

  // =========================
  // GET AREAS OF PRACTITIONER
  // =========================

  getPractitionerAreas(practitionerId: string): Observable<Area[]> {
    return this.http.get<Area[]>(`${this.apiUrl}/Practitioners/${practitionerId}/areas`);
  }

  // =========================
  // GET ALL SERVICES
  // =========================

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/Services`);
  }

  // =========================
  // GET ALL PACKAGES
  // =========================

  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/Packages`);
  }

  // =========================
  // CREATE VISIT
  // =========================

  createVisit(visit: CreateVisit): Observable<any> {
    return this.http.post(`${this.apiUrl}/Visits`, visit);
  }
}
