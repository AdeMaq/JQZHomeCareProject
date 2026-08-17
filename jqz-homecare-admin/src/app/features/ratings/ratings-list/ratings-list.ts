import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Rating, RatingService } from '../../../core/services/rating-service';

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
// MONTH MODEL
// ============================================================

interface MonthOption {
  value: number;
  label: string;
}

// ============================================================
// LOAD STATE
// ============================================================

type LoadState = 'loading' | 'loaded' | 'error';

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-ratings-list',
  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './ratings-list.html',
  styleUrl: './ratings-list.css',
})
export class RatingsList implements OnInit {
  // ==========================================================
  // DEPENDENCIES
  // ==========================================================

  private readonly ratingService = inject(RatingService);
  private readonly practitionerService = inject(PractitionerService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly cdr = inject(ChangeDetectorRef);

  // ==========================================================
  // DATA
  // ==========================================================

  ratings: Rating[] = [];

  practitioners: Practitioner[] = [];

  therapistOfTheMonth: Rating | null = null;

  // ==========================================================
  // DATE FILTERS
  // ==========================================================

  selectedYear = new Date().getFullYear();

  selectedMonth = new Date().getMonth() + 1;

  years: number[] = [];

  months: MonthOption[] = [
    {
      value: 1,
      label: 'January',
    },
    {
      value: 2,
      label: 'February',
    },
    {
      value: 3,
      label: 'March',
    },
    {
      value: 4,
      label: 'April',
    },
    {
      value: 5,
      label: 'May',
    },
    {
      value: 6,
      label: 'June',
    },
    {
      value: 7,
      label: 'July',
    },
    {
      value: 8,
      label: 'August',
    },
    {
      value: 9,
      label: 'September',
    },
    {
      value: 10,
      label: 'October',
    },
    {
      value: 11,
      label: 'November',
    },
    {
      value: 12,
      label: 'December',
    },
  ];

  // ==========================================================
  // UI STATE
  // ==========================================================

  loadState: LoadState = 'loading';

  errorMessage = '';

  // ==========================================================
  // PAGINATION
  // ==========================================================

  currentPage = 1;

  pageSize = 10;

  // ==========================================================
  // LIFECYCLE
  // ==========================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('RATINGS LIST INITIALIZED');
    console.log('=================================');

    this.initializeYears();

    this.readQueryParameters();

    this.loadPractitioners();

    this.loadRatings();
  }

  // ==========================================================
  // INITIALIZE YEARS
  // ==========================================================

  private initializeYears(): void {
    const currentYear = new Date().getFullYear();

    this.years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  }

  // ==========================================================
  // READ QUERY PARAMETERS
  // ==========================================================

  private readQueryParameters(): void {
    const queryParams = this.route.snapshot.queryParams;

    const queryYear = Number(queryParams['year']);
    const queryMonth = Number(queryParams['month']);

    if (Number.isInteger(queryYear) && this.years.includes(queryYear)) {
      this.selectedYear = queryYear;
    }

    if (Number.isInteger(queryMonth) && queryMonth >= 1 && queryMonth <= 12) {
      this.selectedMonth = queryMonth;
    }

    console.log('INITIAL SELECTED YEAR:', this.selectedYear);
    console.log('INITIAL SELECTED MONTH:', this.selectedMonth);
  }

  // ==========================================================
  // LOAD PRACTITIONERS
  // ==========================================================

  private loadPractitioners(): void {
    console.log('=================================');
    console.log('LOADING PRACTITIONERS');
    console.log('=================================');

    this.practitionerService.getPractitioners().subscribe({
      next: (response: any[]) => {
        console.log('PRACTITIONERS RESPONSE:', response);

        this.practitioners = (response ?? []).map((practitioner: any): Practitioner => ({
          id: practitioner.id,
          name: practitioner.name ?? 'Unknown Practitioner',
          serviceName: practitioner.serviceName ?? 'N/A',
        }));

        console.log('PRACTITIONERS COUNT:', this.practitioners.length);

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('FAILED TO LOAD PRACTITIONERS:', error);

        /*
         * Do not put the ratings page into an error state here.
         *
         * Ratings can still be loaded successfully even if
         * practitioner information fails.
         */
        this.practitioners = [];

        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================
  // LOAD MONTHLY RATINGS
  // ==========================================================

  loadRatings(): void {
    console.log('=================================');
    console.log('LOADING MONTHLY RATINGS');
    console.log('=================================');

    console.log('Year:', this.selectedYear);
    console.log('Month:', this.selectedMonth);

    // ----------------------------------------------------------
    // IMPORTANT:
    // Always switch to loading before making the request.
    // ----------------------------------------------------------

    this.loadState = 'loading';

    this.errorMessage = '';

    // ----------------------------------------------------------
    // Clear old data immediately.
    // ----------------------------------------------------------

    this.ratings = [];

    this.therapistOfTheMonth = null;

    this.currentPage = 1;

    this.cdr.markForCheck();

    // ----------------------------------------------------------
    // API REQUEST
    // ----------------------------------------------------------

    this.ratingService.getMonthlyRatings(this.selectedYear, this.selectedMonth).subscribe({
      next: (response: Rating[]) => {
        console.log('MONTHLY RATINGS RESPONSE:', response);

        // ----------------------------------------------------
        // IMPORTANT:
        // Replace the array with a NEW array reference.
        // ----------------------------------------------------

        this.ratings = [...(response ?? [])];

        // ----------------------------------------------------
        // Calculate therapist of the month.
        // ----------------------------------------------------

        this.calculateTherapistOfTheMonth();

        // ----------------------------------------------------
        // Reset pagination.
        // ----------------------------------------------------

        this.currentPage = 1;

        // ----------------------------------------------------
        // MOST IMPORTANT LINE:
        // API successfully returned -> UI is loaded.
        // ----------------------------------------------------

        this.loadState = 'loaded';

        this.errorMessage = '';

        console.log('RATINGS LOAD STATE:', this.loadState);

        console.log('RATINGS COUNT:', this.ratings.length);

        console.log('THERAPIST OF THE MONTH:', this.therapistOfTheMonth);

        // ----------------------------------------------------
        // Make sure the view updates immediately.
        // ----------------------------------------------------

        this.cdr.markForCheck();
      },

      error: (error) => {
        console.error('FAILED TO LOAD MONTHLY RATINGS:', error);

        // ----------------------------------------------------
        // Clear data.
        // ----------------------------------------------------

        this.ratings = [];

        this.therapistOfTheMonth = null;

        // ----------------------------------------------------
        // IMPORTANT:
        // Never leave the UI in loading state after an error.
        // ----------------------------------------------------

        this.loadState = 'error';

        this.errorMessage = 'Unable to load ratings for the selected month. Please try again.';

        console.log('RATINGS LOAD STATE:', this.loadState);

        this.cdr.markForCheck();
      },
    });
  }

  // ==========================================================
  // YEAR CHANGE
  // ==========================================================

  onYearChange(year: number): void {
    const numericYear = Number(year);

    if (!Number.isInteger(numericYear)) {
      return;
    }

    this.selectedYear = numericYear;

    this.currentPage = 1;

    this.updateUrl();

    this.loadRatings();
  }

  // ==========================================================
  // MONTH CHANGE
  // ==========================================================

  onMonthChange(month: number): void {
    const numericMonth = Number(month);

    console.log('=================================');
    console.log('MONTH CHANGED');
    console.log('=================================');
    console.log('New month:', numericMonth);

    if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
      return;
    }

    // ----------------------------------------------------------
    // Update selected month first.
    // ----------------------------------------------------------

    this.selectedMonth = numericMonth;

    // ----------------------------------------------------------
    // Reset pagination.
    // ----------------------------------------------------------

    this.currentPage = 1;

    // ----------------------------------------------------------
    // Update browser URL.
    // ----------------------------------------------------------

    this.updateUrl();

    // ----------------------------------------------------------
    // Load the selected month.
    // ----------------------------------------------------------

    this.loadRatings();
  }

  // ==========================================================
  // UPDATE URL
  // ==========================================================

  private updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,

      queryParams: {
        year: this.selectedYear,
        month: this.selectedMonth,
      },

      queryParamsHandling: 'merge',

      replaceUrl: true,
    });
  }

  // ==========================================================
  // CALCULATE THERAPIST OF THE MONTH
  // ==========================================================

  private calculateTherapistOfTheMonth(): void {
    if (this.ratings.length === 0) {
      this.therapistOfTheMonth = null;
      return;
    }

    this.therapistOfTheMonth = this.ratings.reduce((highest, current) => {
      if (current.score > highest.score) {
        return current;
      }

      return highest;
    });
  }

  // ==========================================================
  // GET PRACTITIONER NAME
  // ==========================================================

  getPractitionerName(practitionerId: string): string {
    const practitioner = this.practitioners.find((item) => item.id === practitionerId);

    return practitioner?.name ?? 'Unknown Practitioner';
  }

  // ==========================================================
  // GET PRACTITIONER SERVICE
  // ==========================================================

  getPractitionerService(practitionerId: string): string {
    const practitioner = this.practitioners.find((item) => item.id === practitionerId);

    return practitioner?.serviceName ?? 'N/A';
  }

  // ==========================================================
  // GET SELECTED MONTH LABEL
  // ==========================================================

  getSelectedMonthLabel(): string {
    const month = this.months.find((item) => item.value === this.selectedMonth);

    return month?.label ?? '';
  }

  // ==========================================================
  // GET STARS
  // ==========================================================

  getStars(score: number): number[] {
    return [1, 2, 3, 4, 5];
  }

  // ==========================================================
  // ADD RATING
  // ==========================================================

  addRating(): void {
    this.router.navigate(['/ratings/add']);
  }

  // ==========================================================
  // EDIT RATING
  // ==========================================================

  editRating(ratingId: string): void {
    this.router.navigate(['/ratings', ratingId, 'edit']);
  }
  // ==========================================================
  // PAGINATED RATINGS
  // ==========================================================

  get paginatedRatings(): Rating[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    const endIndex = startIndex + this.pageSize;

    return this.ratings.slice(startIndex, endIndex);
  }

  // ==========================================================
  // TOTAL PAGES
  // ==========================================================

  get totalPages(): number {
    if (this.ratings.length === 0) {
      return 0;
    }

    return Math.ceil(this.ratings.length / this.pageSize);
  }

  // ==========================================================
  // GO TO PAGE
  // ==========================================================

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  // ==========================================================
  // PREVIOUS PAGE
  // ==========================================================

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // ==========================================================
  // NEXT PAGE
  // ==========================================================

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // ==========================================================
  // TRACK RATING
  // ==========================================================

  trackByRatingId(index: number, rating: Rating): string {
    return rating.id;
  }
}
