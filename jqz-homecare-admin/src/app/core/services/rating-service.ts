import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// =====================================================
// RATING MODEL
// =====================================================

export interface Rating {
  id: string;

  practitionerId: string;

  month: number;

  score: number;

  comments: string;
}

// =====================================================
// CREATE RATING REQUEST
// =====================================================

export interface CreateRatingRequest {
  practitionerId: string;

  month: number;

  score: number;

  comments: string;
}

// =====================================================
// UPDATE RATING REQUEST
// =====================================================

export interface UpdateRatingRequest {
  score: number;

  comments: string;
}

// =====================================================
// RATING SERVICE
// =====================================================

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly http = inject(HttpClient);

  // ===================================================
  // API URL
  // ===================================================

  private readonly apiUrl = 'http://localhost:5212/api/Ratings';

  // ===================================================
  // GET RATINGS BY PRACTITIONER
  // ===================================================

  getRatingsByPractitioner(practitionerId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/practitioner/${practitionerId}`);
  }

  // ===================================================
  // GET MONTHLY RATINGS
  // ===================================================
  //
  // IMPORTANT:
  // The current backend expects:
  //
  // GET /api/Ratings/monthly?year=2026&month=8
  //
  // The UI only selects the month.
  //
  // Therefore, the current year is supplied internally.
  //
  // Once the backend teammate removes the year parameter,
  // this method can simply send:
  //
  // /api/Ratings/monthly?month=8
  //
  // ===================================================

  getMonthlyRatings(month: number): Observable<Rating[]> {
    const currentYear = new Date().getFullYear();

    return this.http.get<Rating[]>(`${this.apiUrl}/monthly`, {
      params: {
        year: currentYear.toString(),
        month: month.toString(),
      },
    });
  }

  // ===================================================
  // ADD RATING
  // ===================================================

  addRating(request: CreateRatingRequest): Observable<Rating> {
    return this.http.post<Rating>(this.apiUrl, request);
  }

  // ===================================================
  // UPDATE RATING
  // ===================================================

  updateRating(id: string, request: UpdateRatingRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, request);
  }
}
