import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Visit } from './visits-list.interface';

@Injectable({
  providedIn: 'root',
})
export class VisitsListService {
  private http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/Visits';

  getTodayVisits(): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/today`);
  }

  getVisitsByDate(date: string): Observable<Visit[]> {
    return this.http.get<Visit[]>(`${this.apiUrl}/by-date/${date}`);
  }

  getVisitById(id: string): Observable<Visit> {
    return this.http.get<Visit>(`${this.apiUrl}/${id}`);
  }
}
