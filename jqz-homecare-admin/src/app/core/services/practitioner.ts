import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =========================
// AREA MODEL
// =========================

export interface Area {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
}

// =========================
// PRACTITIONER AREA MODEL
// =========================

export interface PractitionerArea {
  id: string;
  name: string;
  cityId: string;
  cityName: string;
}

// =========================
// SERVICE MODEL
// =========================

export interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  serviceCategoryName: string;
  description: string;
}

// =========================
// PRACTITIONER MODEL
// =========================

export interface Practitioner {
  id: string;
  name: string;
  email: string;
  phone: string;

  serviceId: string;
  serviceName: string;

  education: string;

  priority: number;
  sharePercentage: number;

  areas: PractitionerArea[];

  visitCount: number;
  cancellationCount: number;
}

// =========================
// CREATE PRACTITIONER
// =========================

export interface CreatePractitionerRequest {
  name: string;
  email: string;
  password: string;
  phone: string;

  serviceId: string;

  education: string;

  priority: number;

  sharePercentage: number;

  areaIds: string[];
}

// =========================
// UPDATE PRACTITIONER
// =========================

/*
 * IMPORTANT:
 *
 * Area assignment is managed separately.
 *
 * Therefore areaIds does NOT belong here.
 *
 * Password reset is also handled separately
 * through resetPractitionerPassword().
 */
export interface UpdatePractitionerRequest {
  name: string;
  phone: string;
  email: string;

  serviceId: string;
  serviceName: string;

  education: string;

  priority: number;

  sharePercentage: number;

  areaIds: string[];
}

// =========================
// RESET PRACTITIONER PASSWORD
// =========================

export interface ResetPractitionerPasswordRequest {
  newPassword: string;
}

// =========================
// PRACTITIONER SERVICE
// =========================

@Injectable({
  providedIn: 'root',
})
export class PractitionerService {
  private readonly http = inject(HttpClient);

  // =========================
  // API URLS
  // =========================

  private readonly apiUrl = 'http://localhost:5212/api/practitioners';

  private readonly servicesUrl = 'http://localhost:5212/api/services';

  private readonly areasUrl = 'http://localhost:5212/api/areas';

  // ============================================================
  // PRACTITIONERS
  // ============================================================

  // =========================
  // GET ALL PRACTITIONERS
  // =========================

  getPractitioners(): Observable<Practitioner[]> {
    return this.http.get<Practitioner[]>(this.apiUrl);
  }

  // =========================
  // GET PRACTITIONER BY ID
  // =========================

  getPractitionerById(id: string): Observable<Practitioner> {
    return this.http.get<Practitioner>(`${this.apiUrl}/${id}`);
  }

  // =========================
  // CREATE PRACTITIONER
  // =========================

  createPractitioner(request: CreatePractitionerRequest): Observable<Practitioner> {
    return this.http.post<Practitioner>(this.apiUrl, request);
  }

  // =========================
  // UPDATE PRACTITIONER
  // =========================

  /*
   * Updates only practitioner information.
   *
   * Areas and password are intentionally
   * handled separately.
   */

  updatePractitioner(id: string, request: UpdatePractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  // =========================
  // RESET PRACTITIONER PASSWORD
  // =========================

  /*
   * Resets the practitioner's login password.
   *
   * Backend endpoint:
   *
   * PUT /api/practitioners/{id}/reset-password
   *
   * Backend authorization:
   * SuperAdmin, MiddlePowerAdmin
   */

  resetPractitionerPassword(
    id: string,
    request: ResetPractitionerPasswordRequest,
  ): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/reset-password`, request);
  }

  // ============================================================
  // PRIORITY
  // ============================================================

  // =========================
  // SET PRIORITY
  // =========================

  setPriority(id: string, priority: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/priority`, priority);
  }

  // ============================================================
  // SHARE PERCENTAGE
  // ============================================================

  // =========================
  // SET SHARE PERCENTAGE
  // =========================

  setSharePercentage(id: string, sharePercentage: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/share`, sharePercentage);
  }

  // ============================================================
  // PRACTITIONER AREAS
  // ============================================================

  // =========================
  // GET PRACTITIONER AREAS
  // =========================

  getPractitionerAreas(id: string): Observable<PractitionerArea[]> {
    return this.http.get<PractitionerArea[]>(`${this.apiUrl}/${id}/areas`);
  }

  // =========================
  // ASSIGN AREA
  // =========================

  assignArea(practitionerId: string, areaId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${practitionerId}/areas`, JSON.stringify(areaId), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // =========================
  // REMOVE AREA
  // =========================

  removeArea(practitionerId: string, areaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${practitionerId}/areas/${areaId}`);
  }

  // ============================================================
  // AVAILABLE PRACTITIONERS
  // ============================================================

  findAvailable(serviceId: string, areaId: string): Observable<Practitioner[]> {
    return this.http.get<Practitioner[]>(`${this.apiUrl}/available`, {
      params: {
        serviceId,
        areaId,
      },
    });
  }

  // ============================================================
  // SEARCH
  // ============================================================

  searchByName(name: string): Observable<Practitioner[]> {
    return this.http.get<Practitioner[]>(`${this.apiUrl}/search`, {
      params: {
        name,
      },
    });
  }

  // ============================================================
  // SERVICES
  // ============================================================

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.servicesUrl);
  }

  // ============================================================
  // AREAS
  // ============================================================

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.areasUrl);
  }
}
