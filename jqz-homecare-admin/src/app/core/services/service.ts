import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
  id: string;
  name: string;
  serviceCategoryId: string;
  serviceCategoryName: string;
  description?: string | null;
}

export interface CreateServiceRequest {
  name: string;
  serviceCategoryId: string;
  description?: string | null;
}

export interface UpdateServiceRequest {
  name: string;
  description?: string | null;
}

export interface ServiceCategory {
  id: string;
  name: string;
}

export interface CreateServiceCategoryRequest {
  name: string;
}

export interface UpdateServiceCategoryRequest {
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class ServiceService {
  private http = inject(HttpClient);

  private readonly servicesApiUrl = 'http://localhost:5212/api/services';
  private readonly categoriesApiUrl = 'http://localhost:5212/api/service-categories';

  // =========================
  // SERVICES
  // =========================

  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(this.servicesApiUrl);
  }

  getServiceById(id: string): Observable<Service> {
    return this.http.get<Service>(`${this.servicesApiUrl}/${id}`);
  }

  createService(request: CreateServiceRequest): Observable<Service> {
    return this.http.post<Service>(this.servicesApiUrl, request);
  }

  updateService(id: string, request: UpdateServiceRequest): Observable<void> {
    return this.http.put<void>(`${this.servicesApiUrl}/${id}`, request);
  }

  deleteService(id: string): Observable<void> {
    return this.http.delete<void>(`${this.servicesApiUrl}/${id}`);
  }

  // =========================
  // SERVICE CATEGORIES
  // =========================

  getServiceCategories(): Observable<ServiceCategory[]> {
    return this.http.get<ServiceCategory[]>(this.categoriesApiUrl);
  }

  getServiceCategoryById(id: string): Observable<ServiceCategory> {
    return this.http.get<ServiceCategory>(`${this.categoriesApiUrl}/${id}`);
  }

  createServiceCategory(request: CreateServiceCategoryRequest): Observable<ServiceCategory> {
    return this.http.post<ServiceCategory>(this.categoriesApiUrl, request);
  }

  updateServiceCategory(id: string, request: UpdateServiceCategoryRequest): Observable<void> {
    return this.http.put<void>(`${this.categoriesApiUrl}/${id}`, request);
  }

  deleteServiceCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoriesApiUrl}/${id}`);
  }
}
