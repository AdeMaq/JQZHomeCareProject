import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CreateRatingRequest, RatingService } from '../../../core/services/rating-service';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-add-rating',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-rating.html',
  styleUrl: './add-rating.css',
})
export class AddRating implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly ratingService = inject(RatingService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly router = inject(Router);

  // ============================================================
  // PRACTITIONERS
  // ============================================================

  practitioners: Practitioner[] = [];

  // ============================================================
  // FORM VALUES
  // ============================================================

  selectedPractitionerId = '';

  /*
   * UI uses numeric months.
   *
   * Example:
   *
   * 6 = June
   * 8 = August
   *
   * Before sending to the backend, the value is converted to:
   *
   * 2026-06-01T00:00:00
   */

  selectedMonth = new Date().getMonth() + 1;

  /*
   * Selected rating score.
   *
   * 0 means no rating has been selected.
   */

  selectedScore = 0;

  comments = '';

  // ============================================================
  // YEAR
  // ============================================================

  selectedYear = new Date().getFullYear();

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
  // THERAPIST LOAD STATE
  // ============================================================

  therapistLoadState: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';

  therapistErrorMessage = '';

  // ============================================================
  // GENERAL STATE
  // ============================================================

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    /*
     * Load therapists immediately when the page opens.
     */

    this.loadPractitionersForMonth(this.selectedMonth);
  }

  // ============================================================
  // LOAD PRACTITIONERS
  // ============================================================

  private loadPractitionersForMonth(month: number): void {
    // ----------------------------------------------------------
    // RESET THERAPIST STATE
    // ----------------------------------------------------------

    this.selectedPractitionerId = '';

    this.practitioners = [];

    this.therapistErrorMessage = '';

    this.therapistLoadState = 'loading';

    // ----------------------------------------------------------
    // CLEAR GENERAL ERROR
    // ----------------------------------------------------------

    this.errorMessage = '';

    // ----------------------------------------------------------
    // LOAD PRACTITIONERS
    // ----------------------------------------------------------

    this.practitionerService.getPractitioners().subscribe({
      next: (practitioners) => {
        this.practitioners = Array.isArray(practitioners) ? practitioners : [];

        this.therapistLoadState = 'loaded';

        console.log(`THERAPISTS LOADED FOR RATING MONTH ${month}:`, this.practitioners);
      },

      error: (error) => {
        console.error('Failed to load practitioners:', error);

        this.practitioners = [];

        this.therapistErrorMessage =
          error?.error?.message ?? 'Failed to load therapists. Please try again.';

        this.therapistLoadState = 'error';
      },
    });
  }

  // ============================================================
  // RETRY PRACTITIONER LOAD
  // ============================================================

  retryLoadPractitioners(): void {
    if (this.isSaving) {
      return;
    }

    this.loadPractitionersForMonth(this.selectedMonth);
  }

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  onMonthChange(month: number | string): void {
    const parsedMonth = Number(month);

    if (!Number.isInteger(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
      return;
    }

    // ----------------------------------------------------------
    // UPDATE SELECTED MONTH
    // ----------------------------------------------------------

    this.selectedMonth = parsedMonth;

    // ----------------------------------------------------------
    // CLEAR SELECTED PRACTITIONER
    // ----------------------------------------------------------

    this.selectedPractitionerId = '';

    // ----------------------------------------------------------
    // CLEAR ERROR
    // ----------------------------------------------------------

    this.errorMessage = '';

    // ----------------------------------------------------------
    // RELOAD PRACTITIONERS
    // ----------------------------------------------------------

    this.loadPractitionersForMonth(parsedMonth);
  }

  // ============================================================
  // CHECK FUTURE MONTH
  // ============================================================

  isFutureMonth(month: number): boolean {
    const currentDate = new Date();

    const currentMonth = currentDate.getMonth() + 1;

    const currentYear = currentDate.getFullYear();

    // ----------------------------------------------------------
    // FUTURE YEAR
    // ----------------------------------------------------------

    if (this.selectedYear > currentYear) {
      return true;
    }

    // ----------------------------------------------------------
    // CURRENT YEAR
    // ----------------------------------------------------------

    if (this.selectedYear === currentYear) {
      return month > currentMonth;
    }

    // ----------------------------------------------------------
    // PREVIOUS YEAR
    // ----------------------------------------------------------

    return false;
  }

  // ============================================================
  // SELECT SCORE
  // ============================================================

  selectScore(score: number): void {
    if (score < 1 || score > 5) {
      return;
    }

    this.selectedScore = score;

    this.errorMessage = '';
  }

  // ============================================================
  // CREATE BACKEND MONTH DATE
  // ============================================================

  private createRatingMonthDate(): string {
    /*
     * Backend expects Rating.Month as DateTime.
     *
     * Example:
     *
     * selectedYear  = 2026
     * selectedMonth = 6
     *
     * Result:
     *
     * 2026-06-01T00:00:00
     */

    const year = this.selectedYear;

    const month = String(this.selectedMonth).padStart(2, '0');

    return `${year}-${month}-01T00:00:00`;
  }

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  private validateForm(): boolean {
    this.errorMessage = '';

    // ----------------------------------------------------------
    // PRACTITIONER
    // ----------------------------------------------------------

    if (!this.selectedPractitionerId) {
      this.errorMessage = 'Please select a therapist.';

      return false;
    }

    // ----------------------------------------------------------
    // MONTH
    // ----------------------------------------------------------

    if (
      !Number.isInteger(this.selectedMonth) ||
      this.selectedMonth < 1 ||
      this.selectedMonth > 12
    ) {
      this.errorMessage = 'Please select a valid rating month.';

      return false;
    }

    // ----------------------------------------------------------
    // FUTURE MONTH
    // ----------------------------------------------------------

    if (this.isFutureMonth(this.selectedMonth)) {
      this.errorMessage = 'Future months cannot be selected for ratings.';

      return false;
    }

    // ----------------------------------------------------------
    // SCORE
    // ----------------------------------------------------------

    if (!Number.isInteger(this.selectedScore) || this.selectedScore < 1 || this.selectedScore > 5) {
      this.errorMessage = 'Please select a rating between 1 and 5 stars.';

      return false;
    }

    // ----------------------------------------------------------
    // COMMENTS
    // ----------------------------------------------------------

    if (this.comments && this.comments.trim().length > 500) {
      this.errorMessage = 'Comments cannot exceed 500 characters.';

      return false;
    }

    return true;
  }

  // ============================================================
  // SAVE RATING
  // ============================================================

  saveRating(): void {
    // ----------------------------------------------------------
    // PREVENT DOUBLE SUBMISSION
    // ----------------------------------------------------------

    if (this.isSaving) {
      return;
    }

    // ----------------------------------------------------------
    // RESET MESSAGES
    // ----------------------------------------------------------

    this.errorMessage = '';

    this.successMessage = '';

    // ----------------------------------------------------------
    // VALIDATE FORM
    // ----------------------------------------------------------

    if (!this.validateForm()) {
      return;
    }

    // ----------------------------------------------------------
    // NORMALIZE VALUES
    // ----------------------------------------------------------

    const practitionerId = String(this.selectedPractitionerId);

    const score = Number(this.selectedScore);

    const comments = (this.comments ?? '').trim();

    // ----------------------------------------------------------
    // CREATE BACKEND DATETIME
    // ----------------------------------------------------------

    const monthDate = this.createRatingMonthDate();

    // ----------------------------------------------------------
    // FINAL SCORE VALIDATION
    // ----------------------------------------------------------

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      this.errorMessage = 'Please select a valid rating between 1 and 5.';

      return;
    }

    // ==========================================================
    // CREATE REQUEST
    // ==========================================================

    /*
     * IMPORTANT:
     *
     * Backend endpoint:
     *
     * POST /api/Ratings/{practitionerId}
     *
     * Therefore practitionerId is sent in the URL.
     *
     * Backend expects month as DateTime.
     *
     * Therefore:
     *
     * month: "2026-06-01T00:00:00"
     *
     * NOT:
     *
     * month: 6
     *
     * AND practitionerId is NOT duplicated inside the DTO.
     */

    const request: CreateRatingRequest = {
      month: monthDate,
      score,
      comments,
    };

    // ==========================================================
    // DEBUG
    // ==========================================================

    const postUrl = `http://localhost:5212/api/Ratings/${practitionerId}`;

    console.log('=================================');
    console.log('ADDING RATING');
    console.log('=================================');

    console.log('Practitioner ID:', practitionerId);

    console.log('Selected Month:', this.selectedMonth);

    console.log('Backend Month:', monthDate);

    console.log('Score:', score, typeof score);

    console.log('Comments:', comments);

    console.log('Request:', request);

    console.log('POST URL:', postUrl);

    console.log('=================================');

    // ==========================================================
    // START SAVING
    // ==========================================================

    this.isSaving = true;

    this.ratingService.addRating(practitionerId, request).subscribe({
      // ======================================================
      // SUCCESS
      // ======================================================

      next: () => {
        console.log('=================================');
        console.log('RATING ADDED SUCCESSFULLY');
        console.log('=================================');

        this.isSaving = false;

        this.successMessage = 'Rating added successfully.';

        /*
         * IMPORTANT:
         *
         * Navigate back to the same year/month that was
         * actually added.
         *
         * Example:
         *
         * /ratings?year=2026&month=6
         *
         * This prevents the ratings page from automatically
         * switching back to August and showing an empty list.
         */

        this.router.navigate(['/ratings'], {
          queryParams: {
            year: this.selectedYear,
            month: this.selectedMonth,
          },
        });
      },

      // ======================================================
      // ERROR
      // ======================================================

      error: (error) => {
        console.error('=================================');
        console.error('FAILED TO ADD RATING');
        console.error('=================================');

        console.error('Status:', error?.status);

        console.error('Status Text:', error?.statusText);

        console.error('URL:', error?.url);

        console.error('Error Body:', error?.error);

        console.error('Validation Errors:', error?.error?.errors);

        console.error('=================================');

        this.isSaving = false;

        // ----------------------------------------------------
        // ASP.NET CORE VALIDATION ERRORS
        // ----------------------------------------------------

        if (error?.error?.errors) {
          const validationErrors = error.error.errors;

          const messages: string[] = [];

          for (const key of Object.keys(validationErrors)) {
            const value = validationErrors[key];

            if (Array.isArray(value)) {
              messages.push(...value);
            } else if (value) {
              messages.push(String(value));
            }
          }

          this.errorMessage =
            messages.length > 0
              ? messages.join(' ')
              : 'The rating data is invalid. Please check the form.';
        } else {
          this.errorMessage =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Failed to add rating. Please try again.';
        }
      },
    });
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.router.navigate(['/ratings']);
  }

  // ============================================================
  // STAR DISPLAY
  // ============================================================

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }
}
