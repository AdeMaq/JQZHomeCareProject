import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// PACKAGE MODEL
// =====================================================

export interface Package {
  id: string;
  serviceId: string;
  serviceName: string;
  name: string;
  numberOfVisits: number;
  amount: number;
  pricePerVisit: number;
}

// =====================================================
// CREATE PACKAGE REQUEST
// =====================================================

export interface CreatePackageRequest {
  serviceId: string;
  name: string;
  numberOfVisits: number;
  amount: number;
}

// =====================================================
// UPDATE PACKAGE REQUEST
// =====================================================

export interface UpdatePackageRequest {
  name: string;
  numberOfVisits: number;
  amount: number;
}

// =====================================================
// PACKAGE SERVICE
// =====================================================

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/packages';

  // ===================================================
  // GET ALL PACKAGES
  // ===================================================

  getPackages(): Observable<Package[]> {
    return this.http.get<Package[]>(this.apiUrl);
  }

  // ===================================================
  // GET PACKAGES BY SERVICE
  // ===================================================

  getPackagesByService(serviceId: string): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}?serviceId=${serviceId}`);
  }

  // ===================================================
  // GET PACKAGE BY ID
  // ===================================================

  getPackageById(id: string): Observable<Package> {
    return this.http.get<Package>(`${this.apiUrl}/${id}`);
  }

  // ===================================================
  // CREATE PACKAGE
  // ===================================================

  createPackage(request: CreatePackageRequest): Observable<Package> {
    return this.http.post<Package>(this.apiUrl, request);
  }

  // ===================================================
  // UPDATE PACKAGE
  // ===================================================

  updatePackage(id: string, request: UpdatePackageRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }

  // ===================================================
  // DELETE PACKAGE
  // ===================================================

  deletePackage(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
