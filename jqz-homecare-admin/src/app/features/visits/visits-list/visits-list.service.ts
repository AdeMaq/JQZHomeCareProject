import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Visit, UpdateVisitRequest } from './visits-list.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitsListService {
  // =========================
  // DEPENDENCIES
  // =========================

  private http = inject(HttpClient);

  // =========================
  // API URL
  // =========================

  private readonly apiUrl = 'http://localhost:5212/api/Visits';

  // =========================
  // GET TODAY'S VISITS
  // =========================

  getTodayVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/today`);
  }

  // =========================
  // GET VISITS BY DATE
  // =========================

  getVisitsByDate(date: string): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/by-date/${date}`);
  }

  // =========================
  // GET VISIT BY ID
  // =========================

  getVisitById(id: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/${id}`);
  }

  // =========================
  // UPDATE VISIT
  // =========================

  updateVisit(id: string, request: UpdateVisitRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }
}
