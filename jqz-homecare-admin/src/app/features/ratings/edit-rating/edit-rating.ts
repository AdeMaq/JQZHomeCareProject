import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { Rating, RatingService, UpdateRatingRequest } from '../../../core/services/rating-service';

import { PractitionerService } from '../../../core/services/practitioner';

// ============================================================
// PRACTITIONER VIEW MODEL
// ============================================================

interface Practitioner {
  id: string;
  name: string;
  serviceName: string;
}

// ============================================================
// LOAD STATE
// ============================================================

type LoadState = 'loading' | 'loaded' | 'error';

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-edit-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-rating.html',
  styleUrl: './edit-rating.css',
})
export class EditRating implements OnInit {
  // ==========================================================
  // DEPENDENCIES
  // ==========================================================

  private readonly ratingService = inject(RatingService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // ==========================================================
  // RATING ID
  // ==========================================================

  ratingId = '';

  // ==========================================================
  // RATING
  // ==========================================================

  rating: Rating | null = null;

  // ==========================================================
  // PRACTITIONER
  // ==========================================================

  practitioner: Practitioner | null = null;

  // ==========================================================
  // FORM
  // ==========================================================

  score = 0;

  comments = '';

  // ==========================================================
  // UI STATE
  // ==========================================================

  loadState: LoadState = 'loading';

  isSubmitting = false;

  errorMessage = '';

  submitError = '';

  // ==========================================================
  // VALIDATION
  // ==========================================================

  scoreError = '';

  commentsError = '';

  // ==========================================================
  // LIFECYCLE
  // ==========================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('EDIT RATING INITIALIZED');
    console.log('=================================');

    this.ratingId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('RATING ID:', this.ratingId);

    if (!this.ratingId) {
      this.loadState = 'error';

      this.errorMessage = 'Rating ID was not provided.';

      this.cdr.markForCheck();

      return;
    }

    this.loadRating();
  }

  // ==========================================================
  // LOAD RATING
  // ==========================================================

  private loadRating(): void {
    console.log('=================================');
    console.log('LOADING RATING');
    console.log('=================================');

    this.loadState = 'loading';

    this.errorMessage = '';

    this.ratingService.getRatingById(this.ratingId).subscribe({
      next: (response: Rating) => {
        console.log('RATING RESPONSE:', response);

        if (!response) {
          this.handleLoadError('Rating could not be found.');

          return;
        }

        this.rating = response;

        // --------------------------------------------------
        // Populate form
        // --------------------------------------------------

        this.score = response.score;

        this.comments = response.comments ?? '';

        // --------------------------------------------------
        // Load practitioner
        // --------------------------------------------------

        this.loadPractitioner(response.practitionerId);

        // --------------------------------------------------
        // Rating loaded
        // --------------------------------------------------

        this.loadState = 'loaded';

        this.errorMessage = '';

        console.log('RATING LOADED SUCCESSFULLY');

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('FAILED TO LOAD RATING:', error);

        this.handleLoadError('Unable to load this rating. Please try again.');
      },
    });
  }

  // ==========================================================
  // LOAD PRACTITIONER
  // ==========================================================

  private loadPractitioner(practitionerId: string): void {
    console.log('LOADING PRACTITIONER:', practitionerId);

    this.practitionerService.getPractitioners().subscribe({
      next: (response: any[]) => {
        const practitioners = (response ?? []).map((practitioner: any): Practitioner => ({
          id: practitioner.id,

          name: practitioner.name ?? 'Unknown Practitioner',

          serviceName: practitioner.serviceName ?? 'N/A',
        }));

        this.practitioner = practitioners.find((item) => item.id === practitionerId) ?? null;

        console.log('EDIT RATING PRACTITIONER:', this.practitioner);

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('FAILED TO LOAD PRACTITIONER:', error);

        this.practitioner = null;

        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================
  // SELECT SCORE
  // ==========================================================

  selectScore(score: number): void {
    if (this.isSubmitting || this.loadState !== 'loaded') {
      return;
    }

    if (!Number.isInteger(score) || score < 1 || score > 5) {
      return;
    }

    this.score = score;

    this.scoreError = '';

    this.submitError = '';

    this.cdr.markForCheck();
  }

  // ==========================================================
  // GET STARS
  // ==========================================================

  getStars(): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  private validateForm(): boolean {
    this.scoreError = '';

    this.commentsError = '';

    let isValid = true;

    // --------------------------------------------------------
    // SCORE
    // --------------------------------------------------------

    if (!this.score) {
      this.scoreError = 'Please select a rating.';

      isValid = false;
    } else if (this.score < 1 || this.score > 5) {
      this.scoreError = 'Rating must be between 1 and 5 stars.';

      isValid = false;
    }

    // --------------------------------------------------------
    // COMMENTS
    // --------------------------------------------------------

    const trimmedComments = this.comments.trim();

    if (!trimmedComments) {
      this.commentsError = 'Please enter comments.';

      isValid = false;
    }

    return isValid;
  }

  // ==========================================================
  // UPDATE RATING
  // ==========================================================

  updateRating(): void {
    console.log('=================================');
    console.log('UPDATE RATING');
    console.log('=================================');

    if (this.isSubmitting || this.loadState !== 'loaded') {
      return;
    }

    this.submitError = '';

    // --------------------------------------------------------
    // Validate
    // --------------------------------------------------------

    if (!this.validateForm()) {
      this.cdr.markForCheck();

      return;
    }

    // --------------------------------------------------------
    // Make sure rating exists
    // --------------------------------------------------------

    if (!this.rating) {
      this.submitError = 'Rating information is unavailable.';

      this.cdr.markForCheck();

      return;
    }

    // --------------------------------------------------------
    // Request body
    // --------------------------------------------------------

    const request: UpdateRatingRequest = {
      score: this.score,
      comments: this.comments.trim(),
    };

    console.log('UPDATE REQUEST:', request);

    // --------------------------------------------------------
    // Submit
    // --------------------------------------------------------

    this.isSubmitting = true;

    this.ratingService.updateRating(this.rating.id, request).subscribe({
      next: (response: Rating) => {
        console.log('RATING UPDATED SUCCESSFULLY:', response);

        this.isSubmitting = false;

        // --------------------------------------------------
        // Return to ratings list
        // --------------------------------------------------

        this.router.navigate(['/ratings'], {
          queryParams: {
            year: this.getRatingYear(),
            month: this.getRatingMonth(),
          },
        });
      },

      error: (error) => {
        console.error('FAILED TO UPDATE RATING:', error);

        this.isSubmitting = false;

        this.submitError =
          error?.error?.message ?? 'Unable to update the rating. Please try again.';

        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================
  // GET RATING YEAR
  // ==========================================================

  private getRatingYear(): number {
    if (!this.rating?.month) {
      return new Date().getFullYear();
    }

    const date = new Date(this.rating.month);

    if (Number.isNaN(date.getTime())) {
      return new Date().getFullYear();
    }

    return date.getFullYear();
  }

  // ==========================================================
  // GET RATING MONTH
  // ==========================================================

  private getRatingMonth(): number {
    if (!this.rating?.month) {
      return new Date().getMonth() + 1;
    }

    const date = new Date(this.rating.month);

    if (Number.isNaN(date.getTime())) {
      return new Date().getMonth() + 1;
    }

    return date.getMonth() + 1;
  }

  // ==========================================================
  // GET MONTH LABEL
  // ==========================================================

  getMonthLabel(): string {
    if (!this.rating?.month) {
      return '';
    }

    const date = new Date(this.rating.month);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString('en-US', {
      month: 'long',
    });
  }

  // ==========================================================
  // CANCEL
  // ==========================================================

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.router.navigate(['/ratings'], {
      queryParams: {
        year: this.getRatingYear(),
        month: this.getRatingMonth(),
      },
    });
  }

  // ==========================================================
  // RETRY
  // ==========================================================

  retry(): void {
    if (this.isSubmitting) {
      return;
    }

    this.loadRating();
  }

  // ==========================================================
  // LOAD ERROR
  // ==========================================================

  private handleLoadError(message: string): void {
    this.rating = null;

    this.practitioner = null;

    this.loadState = 'error';

    this.errorMessage = message;

    this.cdr.markForCheck();
  }
}
