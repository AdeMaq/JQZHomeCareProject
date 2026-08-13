import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// =========================================================
// PACKAGE MODELS
// =========================================================

export interface Package {
  id: string;
  serviceId: string;
  serviceName: string;
  name: string;
  numberOfVisits: number;
  amount: number;
  pricePerVisit: number;
  savings: number;
}

// =========================================================
// CREATE PACKAGE REQUEST
// =========================================================

export interface CreatePackageRequest {
  serviceId: string;
  name: string;
  numberOfVisits: number;
  amount: number;
}

// =========================================================
// UPDATE PACKAGE REQUEST
// =========================================================

export interface UpdatePackageRequest {
  name: string;
  numberOfVisits: number;
  amount: number;
}

// =========================================================
// SERVICE MODEL
// =========================================================

export interface PackageServiceOption {
  id: string;
  name: string;
}

// =========================================================
// PACKAGE SERVICE
// =========================================================

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private readonly http = inject(HttpClient);

  private readonly packagesApiUrl = 'http://localhost:5212/api/packages';

  private readonly servicesApiUrl = 'http://localhost:5212/api/services';

  // =========================================================
  // PACKAGES
  // =========================================================

  getPackages(serviceId?: string): Observable<Package[]> {
    let params = new HttpParams();

    if (serviceId) {
      params = params.set('serviceId', serviceId);
    }

    return this.http.get<Package[]>(this.packagesApiUrl, { params });
  }

  getPackageById(id: string): Observable<Package> {
    return this.http.get<Package>(`${this.packagesApiUrl}/${id}`);
  }

  createPackage(request: CreatePackageRequest): Observable<Package> {
    return this.http.post<Package>(this.packagesApiUrl, request);
  }

  updatePackage(id: string, request: UpdatePackageRequest): Observable<void> {
    return this.http.put<void>(`${this.packagesApiUrl}/${id}`, request);
  }

  deletePackage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.packagesApiUrl}/${id}`);
  }

  // =========================================================
  // SERVICES
  // Used by Add Package / Edit Package
  // =========================================================

  getServices(): Observable<PackageServiceOption[]> {
    return this.http.get<PackageServiceOption[]>(this.servicesApiUrl);
  }
}
