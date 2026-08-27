import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { Subject, catchError, finalize, forkJoin, of, takeUntil, timeout } from 'rxjs';

import { DashboardDateRange, DashboardRefusal, DashboardSummary } from './dashboard.models';

import { DashboardService } from './dashboard.service';

/* =====================================================
   DASHBOARD COMPONENT
===================================================== */

@Component({
  selector: 'app-dashboard',

  standalone: true,

  imports: [DecimalPipe],

  templateUrl: './dashboard.html',

  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  /* ===================================================
     DEPENDENCIES
  =================================================== */

  private readonly dashboardService = inject(DashboardService);

  /* ===================================================
     DESTROY SIGNAL
  =================================================== */

  private readonly destroy$ = new Subject<void>();

  /* ===================================================
     REQUEST ID

     Prevents older requests from changing the UI after
     a newer request has started.
  =================================================== */

  private requestId = 0;

  /* ===================================================
     DASHBOARD DATA
  =================================================== */

  summary: DashboardSummary | null = null;

  refusals: DashboardRefusal[] = [];

  /* ===================================================
     DATE RANGE
  =================================================== */

  fromDate = '';

  toDate = '';

  /* ===================================================
     REFUSAL COUNTS
  =================================================== */

  patientRefusals = 0;

  practitionerRefusals = 0;

  /* ===================================================
     UI STATE

     Using Angular signals ensures that the template
     always receives the latest loading state.
  =================================================== */

  readonly isRefreshing = signal(false);

  readonly errorMessage = signal('');

  /* ===================================================
     LIFECYCLE
  =================================================== */

  ngOnInit(): void {
    this.initializeDefaultDateRange();

    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }

  /* ===================================================
     DATE RANGE INITIALIZATION
  =================================================== */

  private initializeDefaultDateRange(): void {
    const today = this.formatDate(new Date());

    this.fromDate = today;

    this.toDate = today;
  }

  /* ===================================================
     LOAD DASHBOARD DATA
  =================================================== */

  loadDashboardData(): void {
    /* ===============================================
       VALIDATE DATE RANGE
    ================================================ */

    if (!this.isDateRangeValid()) {
      this.errorMessage.set('Please select a valid date range.');

      return;
    }

    /* ===============================================
       CREATE REQUEST ID
    ================================================ */

    const currentRequestId = ++this.requestId;

    /* ===============================================
       CAPTURE CURRENT DATE RANGE
    ================================================ */

    const requestDateRange: DashboardDateRange = {
      from: this.fromDate,
      to: this.toDate,
    };

    /* ===============================================
       START LOADING
    ================================================ */

    this.isRefreshing.set(true);

    this.errorMessage.set('');

    console.log('=================================');
    console.log('LOADING DASHBOARD DATA');
    console.log('Request ID:', currentRequestId);
    console.log('Date range:', requestDateRange);
    console.log('=================================');

    /* ===============================================
       SUMMARY REQUEST
    ================================================ */

    const summaryRequest = this.dashboardService.getSummary(requestDateRange).pipe(
      timeout(15000),

      catchError((error: unknown) => {
        console.error('Dashboard summary request failed:', error);

        return of<DashboardSummary | null>(null);
      }),
    );

    /* ===============================================
       REFUSALS REQUEST
    ================================================ */

    const refusalsRequest = this.dashboardService.getRefusals(requestDateRange).pipe(
      timeout(15000),

      catchError((error: unknown) => {
        console.error('Dashboard refusals request failed:', error);

        return of<DashboardRefusal[]>([]);
      }),
    );

    /* ===============================================
       EXECUTE REQUESTS
    ================================================ */

    forkJoin({
      summary: summaryRequest,

      refusals: refusalsRequest,
    })
      .pipe(
        takeUntil(this.destroy$),

        finalize(() => {
          /*
           * Only the latest request can control
           * the loading state.
           */

          if (currentRequestId !== this.requestId) {
            return;
          }

          this.isRefreshing.set(false);

          console.log('=================================');
          console.log('DASHBOARD REQUEST FINISHED');
          console.log('Request ID:', currentRequestId);
          console.log('isRefreshing:', this.isRefreshing());
          console.log('=================================');
        }),
      )
      .subscribe({
        next: ({ summary, refusals }) => {
          /*
           * Ignore old requests.
           */

          if (currentRequestId !== this.requestId) {
            return;
          }

          /* ===========================================
             SUMMARY
          ============================================ */

          if (summary) {
            this.summary = summary;

            console.log('Dashboard summary received:', summary);
          } else {
            this.errorMessage.set('Unable to load dashboard summary.');
          }

          /* ===========================================
             REFUSALS
          ============================================ */

          this.refusals = refusals ?? [];

          this.updateRefusalCounts();

          console.log('Dashboard refusals received:', this.refusals);

          console.log('Patient refusals:', this.patientRefusals);

          console.log('Practitioner refusals:', this.practitionerRefusals);
        },

        error: (error: unknown) => {
          console.error('Failed to load dashboard data:', error);

          if (currentRequestId !== this.requestId) {
            return;
          }

          this.errorMessage.set('Unable to load dashboard data. Please try again.');
        },
      });
  }

  /* ===================================================
     FROM DATE CHANGE
  =================================================== */

  onFromDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.fromDate = input.value;

    this.errorMessage.set('');

    /*
     * Don't make an API request while the range
     * is temporarily invalid.
     */

    if (!this.isDateRangeValid()) {
      return;
    }

    this.loadDashboardData();
  }

  /* ===================================================
     TO DATE CHANGE
  =================================================== */

  onToDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.toDate = input.value;

    this.errorMessage.set('');

    /*
     * Don't make an API request while the range
     * is temporarily invalid.
     */

    if (!this.isDateRangeValid()) {
      return;
    }

    this.loadDashboardData();
  }

  /* ===================================================
     REFUSAL CALCULATIONS
  =================================================== */

  private updateRefusalCounts(): void {
    this.patientRefusals = this.refusals.filter(
      (refusal) => refusal.refusedBy === 'Patient',
    ).length;

    this.practitionerRefusals = this.refusals.filter(
      (refusal) => refusal.refusedBy === 'Practitioner',
    ).length;
  }

  /* ===================================================
     DATE RANGE VALIDATION
  =================================================== */

  private isDateRangeValid(): boolean {
    if (!this.fromDate || !this.toDate) {
      return false;
    }

    return this.fromDate <= this.toDate;
  }

  /* ===================================================
     DATE FORMATTING
  =================================================== */

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
