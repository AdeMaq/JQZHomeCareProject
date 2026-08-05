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
 * Area assignment is managed separately now.
 *
 * Therefore areaIds does NOT belong here.
 *
 * Practitioner information is updated from the
 * Edit Practitioner page.
 *
 * Practitioner areas are managed from the
 * dedicated Manage Practitioner Areas page.
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
   * Areas are intentionally NOT included here.
   *
   * Area assignment/removal is handled through:
   *
   * assignArea()
   * removeArea()
   */

  updatePractitioner(id: string, request: UpdatePractitionerRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
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

  /*
   * Gets only the areas currently assigned
   * to a specific practitioner.
   */

  getPractitionerAreas(id: string): Observable<PractitionerArea[]> {
    return this.http.get<PractitionerArea[]>(`${this.apiUrl}/${id}/areas`);
  }

  // =========================
  // ASSIGN AREA
  // =========================

  /*
   * Assigns one area to a practitioner.
   *
   * This is used by the dedicated
   * Manage Practitioner Areas page.
   */

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

  /*
   * Removes one assigned area from a practitioner.
   *
   * This is also handled by the dedicated
   * Manage Practitioner Areas page.
   */

  removeArea(practitionerId: string, areaId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${practitionerId}/areas/${areaId}`);
  }

  // ============================================================
  // AVAILABLE PRACTITIONERS
  // ============================================================

  // =========================
  // FIND AVAILABLE PRACTITIONERS
  // =========================

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

  // =========================
  // SEARCH BY NAME
  // =========================

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

  // =========================
  // GET SERVICES
  // =========================

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.servicesUrl);
  }

  // ============================================================
  // AREAS
  // ============================================================

  // =========================
  // GET ALL AREAS
  // =========================

  /*
   * Gets all available areas.
   *
   * The Manage Practitioner Areas page can use this
   * to show areas that can be assigned.
   */

  getAreas(): Observable<Area[]> {
    return this.http.get<Area[]>(this.areasUrl);
  }
}
