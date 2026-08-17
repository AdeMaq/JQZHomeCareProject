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
// UPDATE RATING REQUEST
// ============================================================

export interface UpdateRatingRequest {
  /**
   * Backend UpdateRatingDto.Score
   */
  score: number;

  /**
   * Backend UpdateRatingDto.Comments
   */
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

  /**
   * Current backend endpoint:
   *
   * GET /api/Ratings/monthly?year={year}&month={month}
   *
   * Retrieves all ratings for the selected month.
   */

  getMonthlyRatings(year: number, month: number): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/monthly?year=${year}&month=${month}`);
  }

  // ============================================================
  // GET RATINGS FOR PRACTITIONER
  // ============================================================

  /**
   * Current backend endpoint:
   *
   * GET /api/Ratings/practitioner/{practitionerId}
   *
   * Retrieves all ratings belonging to a practitioner.
   */

  getRatingsByPractitioner(practitionerId: string): Observable<Rating[]> {
    return this.http.get<Rating[]>(`${this.apiUrl}/practitioner/${practitionerId}`);
  }

  // ============================================================
  // GET RATING BY ID
  // ============================================================

  /**
   * Backend endpoint:
   *
   * GET /api/Ratings/{ratingId}
   *
   * Retrieves a single rating using its ID.
   *
   * This is used by the Edit Rating page to load the
   * existing rating before editing it.
   */

  getRatingById(ratingId: string): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/${ratingId}`);
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

  // ============================================================
  // UPDATE RATING
  // ============================================================

  /**
   * Current backend endpoint:
   *
   * PUT /api/Ratings/{ratingId}
   *
   * The rating ID belongs in the URL.
   *
   * The request body contains ONLY:
   *
   * {
   *   score: 4,
   *   comments: "Updated comments"
   * }
   *
   * Practitioner and month are intentionally NOT included
   * because they cannot be changed from the Edit Rating page.
   */

  updateRating(ratingId: string, request: UpdateRatingRequest): Observable<Rating> {
    return this.http.put<Rating>(`${this.apiUrl}/${ratingId}`, request);
  }
}
