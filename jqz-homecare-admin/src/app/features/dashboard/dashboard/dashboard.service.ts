import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { DashboardSummary, Refusal } from './dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/Dashboard';

  getSummary(from: string, to: string): Observable<DashboardSummary> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`, { params });
  }

  getRefusals(from: string, to: string): Observable<Refusal[]> {
    const params = new HttpParams().set('from', from).set('to', to);

    return this.http.get<Refusal[]>(`${this.apiUrl}/refusals`, { params });
  }
}
