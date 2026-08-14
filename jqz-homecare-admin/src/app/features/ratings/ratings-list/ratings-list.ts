import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { Rating, RatingService } from '../../../core/services/rating-service';
import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-ratings-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './ratings-list.html',
  styleUrl: './ratings-list.css',
})
export class RatingsList implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly ratingService = inject(RatingService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly router = inject(Router);

  // ============================================================
  // RATINGS
  // ============================================================

  ratings: Rating[] = [];

  // ============================================================
  // PRACTITIONERS
  // ============================================================

  practitioners: Practitioner[] = [];

  // ============================================================
  // MONTH FILTER
  // ============================================================

  selectedMonth = new Date().getMonth() + 1;

  // ============================================================
  // MONTHS
  // ============================================================

  months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

  // ============================================================
  // THERAPIST OF THE MONTH
  // ============================================================

  therapistOfTheMonth: Rating | null = null;

  // ============================================================
  // LOAD STATE
  // ============================================================

  /**
   * There are only three possible states:
   *
   * loading -> API request is running
   * loaded  -> API request completed successfully
   * error   -> API request failed
   *
   * This avoids conflicting isLoading / hasLoaded combinations.
   */
  loadState: 'loading' | 'loaded' | 'error' = 'loading';

  /**
   * Returns true only while the ratings request is running.
   *
   * This getter is kept so the existing template/component
   * logic can still use isLoading if needed.
   */
  get isLoading(): boolean {
    return this.loadState === 'loading';
  }

  /**
   * Returns true once the ratings request has completed.
   *
   * This getter replaces the old hasLoaded property.
   */
  get hasLoaded(): boolean {
    return this.loadState === 'loaded' || this.loadState === 'error';
  }

  /**
   * Error message returned when the ratings request fails.
   */
  errorMessage = '';

  // ============================================================
  // PAGINATION
  // ============================================================

  currentPage = 1;

  pageSize = 10;

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadPractitioners();

    this.loadRatings();
  }

  // ============================================================
  // LOAD PRACTITIONERS
  // ============================================================

  private loadPractitioners(): void {
    this.practitionerService.getPractitioners().subscribe({
      next: (practitioners) => {
        this.practitioners = practitioners ?? [];
      },

      error: (error) => {
        console.error('Failed to load practitioners:', error);

        this.practitioners = [];
      },
    });
  }

  // ============================================================
  // LOAD RATINGS
  // ============================================================

  loadRatings(): void {
    // ----------------------------------------------------------
    // RESET STATE
    // ----------------------------------------------------------

    this.loadState = 'loading';

    this.errorMessage = '';

    this.currentPage = 1;

    this.ratings = [];

    this.therapistOfTheMonth = null;

    // ----------------------------------------------------------
    // API REQUEST
    // ----------------------------------------------------------

    this.ratingService.getMonthlyRatings(this.selectedMonth).subscribe({
      // ======================================================
      // SUCCESS
      // ======================================================

      next: (ratings) => {
        // ----------------------------------------------------
        // Store API response
        // ----------------------------------------------------

        this.ratings = ratings ?? [];

        // ----------------------------------------------------
        // Calculate Therapist of the Month
        // ----------------------------------------------------

        this.calculateTherapistOfTheMonth();

        // ----------------------------------------------------
        // REQUEST COMPLETED SUCCESSFULLY
        // ----------------------------------------------------

        this.loadState = 'loaded';

        /*
         * IMPORTANT:
         *
         * At this point:
         *
         * ratings.length === 0
         *
         * means:
         *
         * "The API successfully returned zero ratings."
         *
         * Therefore the template will show:
         *
         * No Ratings Found
         *
         * instead of:
         *
         * Loading ratings...
         */

        console.log('MONTHLY RATINGS RESPONSE:', this.ratings);
        console.log('RATINGS LOAD STATE:', this.loadState);
      },

      // ======================================================
      // ERROR
      // ======================================================

      error: (error) => {
        console.error('Failed to load ratings:', error);

        // ----------------------------------------------------
        // Clear previous data
        // ----------------------------------------------------

        this.ratings = [];

        this.therapistOfTheMonth = null;

        // ----------------------------------------------------
        // Store error message
        // ----------------------------------------------------

        this.errorMessage = error?.error?.message ?? 'Failed to load ratings. Please try again.';

        // ----------------------------------------------------
        // REQUEST COMPLETED WITH ERROR
        // ----------------------------------------------------

        this.loadState = 'error';

        console.log('RATINGS LOAD STATE:', this.loadState);
      },
    });
  }

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  onMonthChange(): void {
    this.loadRatings();
  }

  // ============================================================
  // CALCULATE THERAPIST OF THE MONTH
  // ============================================================

  private calculateTherapistOfTheMonth(): void {
    // ----------------------------------------------------------
    // No ratings
    // ----------------------------------------------------------

    if (this.ratings.length === 0) {
      this.therapistOfTheMonth = null;

      return;
    }

    /*
     * The backend returns individual ratings.
     *
     * We group them by practitioner and calculate
     * the average score for each practitioner.
     *
     * The practitioner with the highest average score
     * becomes Therapist of the Month.
     */

    const grouped = new Map<string, Rating[]>();

    // ----------------------------------------------------------
    // GROUP RATINGS BY PRACTITIONER
    // ----------------------------------------------------------

    for (const rating of this.ratings) {
      const existing = grouped.get(rating.practitionerId);

      if (existing) {
        existing.push(rating);
      } else {
        grouped.set(rating.practitionerId, [rating]);
      }
    }

    // ----------------------------------------------------------
    // FIND BEST PRACTITIONER
    // ----------------------------------------------------------

    let bestPractitionerId: string | null = null;

    let bestAverage = -1;

    for (const [practitionerId, practitionerRatings] of grouped.entries()) {
      const total = practitionerRatings.reduce((sum, rating) => sum + rating.score, 0);

      const average = total / practitionerRatings.length;

      if (average > bestAverage) {
        bestAverage = average;

        bestPractitionerId = practitionerId;
      }
    }

    // ----------------------------------------------------------
    // NO WINNER
    // ----------------------------------------------------------

    if (!bestPractitionerId) {
      this.therapistOfTheMonth = null;

      return;
    }

    // ----------------------------------------------------------
    // GET WINNER RATINGS
    // ----------------------------------------------------------

    const winnerRatings = grouped.get(bestPractitionerId);

    if (!winnerRatings || winnerRatings.length === 0) {
      this.therapistOfTheMonth = null;

      return;
    }

    // ----------------------------------------------------------
    // SELECT HIGHEST-SCORING RATING
    // ----------------------------------------------------------

    this.therapistOfTheMonth = winnerRatings.reduce((best, current) =>
      current.score > best.score ? current : best,
    );
  }

  // ============================================================
  // GET PRACTITIONER NAME
  // ============================================================

  getPractitionerName(practitionerId: string): string {
    const practitioner = this.practitioners.find((p) => p.id === practitionerId);

    return practitioner?.name ?? 'Unknown Practitioner';
  }

  // ============================================================
  // GET PRACTITIONER SERVICE
  // ============================================================

  getPractitionerService(practitionerId: string): string {
    const practitioner = this.practitioners.find((p) => p.id === practitionerId);

    return practitioner?.serviceName ?? 'N/A';
  }

  // ============================================================
  // GET SELECTED MONTH LABEL
  // ============================================================

  getSelectedMonthLabel(): string {
    return this.months.find((month) => month.value === this.selectedMonth)?.label ?? '';
  }

  // ============================================================
  // ADD RATING
  // ============================================================

  addRating(): void {
    this.router.navigate(['/ratings/add']);
  }

  // ============================================================
  // EDIT RATING
  // ============================================================

  editRating(ratingId: string): void {
    this.router.navigate(['/ratings', ratingId, 'edit']);
  }

  // ============================================================
  // PAGINATED RATINGS
  // ============================================================

  get paginatedRatings(): Rating[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.ratings.slice(startIndex, startIndex + this.pageSize);
  }

  // ============================================================
  // TOTAL PAGES
  // ============================================================

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.ratings.length / this.pageSize));
  }

  // ============================================================
  // PREVIOUS PAGE
  // ============================================================

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ============================================================
  // NEXT PAGE
  // ============================================================

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ============================================================
  // GO TO PAGE
  // ============================================================

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  // ============================================================
  // STAR DISPLAY
  // ============================================================

  getStars(_score: number): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  // ============================================================
  // TRACK RATING
  // ============================================================

  trackByRatingId(_index: number, rating: Rating): string {
    return rating.id;
  }
}
