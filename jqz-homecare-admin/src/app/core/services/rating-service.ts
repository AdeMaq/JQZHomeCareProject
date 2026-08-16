import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ============================================================
// RATING RESPONSE MODEL
// ============================================================

export interface Rating {
  id: string;

  practitionerId: string;

  /**
   * Backend stores Rating.Month as DateTime.
   *
   * Example:
   * "2026-08-01T00:00:00"
   */
  month: string;

  score: number;

  comments: string | null;
}

// ============================================================
// CREATE RATING REQUEST
// ============================================================

export interface CreateRatingRequest {
  /**
   * Backend RatingDto.Month is DateTime.
   *
   * Therefore Angular must send an ISO date string,
   * NOT a numeric month such as 8.
   *
   * Example:
   * "2026-08-01T00:00:00"
   */
  month: string;

  score: number;

  comments: string;
}

// ============================================================
// RATING SERVICE
// ============================================================

@Injectable({
  providedIn: 'root',
})
export class RatingService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:5212/api/Ratings';

  // ============================================================
  // GET MONTHLY RATINGS
  // ============================================================

  getMonthlyRatings(year: number, month: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/monthly?year=${year}&month=${month}`);
  }

  // ============================================================
  // GET RATINGS FOR PRACTITIONER
  // ============================================================

  getRatingsByPractitioner(practitionerId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/practitioner/${practitionerId}`);
  }

  // ============================================================
  // ADD RATING
  // ============================================================

  /**
   * Current backend endpoint:
   *
   * POST /api/Ratings/{practitionerId}
   *
   * The practitioner ID belongs in the URL.
   *
   * The request body contains:
   *
   * {
   *   month: "2026-08-01T00:00:00",
   *   score: 3,
   *   comments: "..."
   * }
   */
  addRating(practitionerId: string, request: CreateRatingRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${practitionerId}`, request);
  }
}
