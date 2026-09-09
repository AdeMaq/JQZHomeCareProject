import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import { Subject, catchError, finalize, forkJoin, of, takeUntil, timeout } from 'rxjs';

import {
  DashboardDateRange,
  DashboardPaymentSummary,
  DashboardRefusal,
  DashboardSummary,
} from './dashboard.models';

import { DashboardService } from './dashboard.service';

import { VisitsService } from '../../visits/visits.service';

import { Visit } from '../../visits/visits.interface';

import {
  PatientPackage,
  PatientPackageService,
} from '../../../core/services/patient-package.service';

/* =====================================================
   DASHBOARD DATE FILTER TYPE
===================================================== */

type DashboardDateFilter = 'today' | 'week' | 'month' | 'custom';

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

  private readonly visitsService = inject(VisitsService);

  private readonly patientPackageService = inject(PatientPackageService);

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

  visits: Visit[] = [];

  /**
   * PatientPackage lookup used for package-level payment
   * information.
   *
   * Visit does NOT contain:
   *
   * - amountDue
   * - amountReceived
   * - collectionStatus
   * - receivedBy
   *
   * Payment information belongs to PatientPackage.
   */
  private patientPackageMap = new Map<string, PatientPackage>();

  /* ===================================================
     FRONTEND PAYMENT CALCULATIONS
  =================================================== */

  paymentSummary: DashboardPaymentSummary = {
    totalAmountDue: 0,

    totalAmountReceived: 0,

    totalOutstandingAmount: 0,
  };

  /* ===================================================
     DATE RANGE
  =================================================== */

  fromDate = '';

  toDate = '';

  /* ===================================================
     ACTIVE DATE FILTER
  =================================================== */

  selectedDateFilter = signal<DashboardDateFilter>('today');

  /* ===================================================
     REFUSAL COUNTS
  =================================================== */

  patientRefusals = 0;

  practitionerRefusals = 0;

  /* ===================================================
     UI STATE
  =================================================== */

  readonly isRefreshing = signal(false);

  readonly errorMessage = signal('');

  /* ===================================================
     LIFECYCLE
  =================================================== */

  ngOnInit(): void {
    this.applyTodayFilter();
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
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
       CAPTURE DATE RANGE
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
       VISITS REQUEST

       Used to identify the PatientPackages whose
       visits fall inside the selected date range.

       Payment information itself is loaded separately
       from PatientPackage.
    ================================================ */

    const visitsRequest = this.visitsService.getAll().pipe(
      timeout(15000),

      catchError((error: unknown) => {
        console.error('Visits request failed:', error);

        return of<Visit[]>([]);
      }),
    );

    /* ===============================================
       EXECUTE ALL REQUESTS
    ================================================ */

    forkJoin({
      summary: summaryRequest,

      refusals: refusalsRequest,

      visits: visitsRequest,
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
        next: ({ summary, refusals, visits }) => {
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

          /* ===========================================
             VISITS
          ============================================ */

          this.visits = visits ?? [];

          /*
           * Payment information is package-level.
           *
           * We must first load the PatientPackages
           * associated with these visits.
           */
          this.loadPatientPackagesForDashboard(this.visits, currentRequestId);

          console.log('All visits received:', this.visits);
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
     LOAD PATIENT PACKAGES FOR DASHBOARD

     Payment state is owned by PatientPackage.

     Each package is loaded only once, even when
     multiple visits belong to the same package.
  =================================================== */

  private loadPatientPackagesForDashboard(visits: Visit[], currentRequestId: number): void {
    /* ===============================================
       CLEAR OLD PACKAGE DATA
    ================================================ */

    this.patientPackageMap.clear();

    /* ===============================================
       GET UNIQUE PACKAGE IDS
    ================================================ */

    const patientPackageIds = [
      ...new Set(visits.map((visit) => visit.patientPackageId).filter((id): id is string => !!id)),
    ];

    /* ===============================================
       NO PACKAGE IDS
    ================================================ */

    if (!patientPackageIds.length) {
      this.updatePaymentSummary();

      return;
    }

    /* ===============================================
       CREATE PACKAGE REQUESTS
    ================================================ */

    const packageRequests = patientPackageIds.map((id) => this.patientPackageService.getById(id));

    /* ===============================================
       LOAD PACKAGES
    ================================================ */

    forkJoin(packageRequests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (packages) => {
          /*
           * Ignore stale package response.
           */

          if (currentRequestId !== this.requestId) {
            return;
          }

          /* =========================================
             BUILD PACKAGE LOOKUP
          ========================================== */

          for (const patientPackage of packages) {
            this.patientPackageMap.set(patientPackage.id, patientPackage);
          }

          /* =========================================
             CALCULATE PAYMENT SUMMARY
          ========================================== */

          this.updatePaymentSummary();

          console.log('Dashboard patient packages received:', packages);

          console.log('Dashboard payment summary:', this.paymentSummary);
        },

        error: (error: unknown) => {
          console.error('Failed to load dashboard patient packages:', error);

          if (currentRequestId !== this.requestId) {
            return;
          }

          /*
           * Keep the dashboard usable even when
           * package payment information fails.
           */
          this.patientPackageMap.clear();

          this.updatePaymentSummary();

          console.error(
            'Dashboard payment summary could not be populated from PatientPackage data.',
          );
        },
      });
  }

  /* ===================================================
     TODAY FILTER
  =================================================== */

  applyTodayFilter(): void {
    const today = new Date();

    const formattedToday = this.formatDate(today);

    this.fromDate = formattedToday;

    this.toDate = formattedToday;

    this.selectedDateFilter.set('today');

    this.loadDashboardData();
  }

  /* ===================================================
     THIS WEEK FILTER

     Week starts Monday and ends Sunday.
  =================================================== */

  applyWeekFilter(): void {
    const today = new Date();

    const currentDay = today.getDay();

    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;

    const startOfWeek = new Date(today);

    startOfWeek.setDate(today.getDate() - daysSinceMonday);

    const endOfWeek = new Date(startOfWeek);

    endOfWeek.setDate(startOfWeek.getDate() + 6);

    this.fromDate = this.formatDate(startOfWeek);

    this.toDate = this.formatDate(endOfWeek);

    this.selectedDateFilter.set('week');

    this.loadDashboardData();
  }

  /* ===================================================
     THIS MONTH FILTER
  =================================================== */

  applyMonthFilter(): void {
    const today = new Date();

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.fromDate = this.formatDate(startOfMonth);

    this.toDate = this.formatDate(endOfMonth);

    this.selectedDateFilter.set('month');

    this.loadDashboardData();
  }

  /* ===================================================
     CUSTOM DATE FILTER
  =================================================== */

  applyCustomDateFilter(): void {
    this.selectedDateFilter.set('custom');

    this.errorMessage.set('');

    if (!this.isDateRangeValid()) {
      return;
    }

    this.loadDashboardData();
  }

  /* ===================================================
     FROM DATE CHANGE
  =================================================== */

  onFromDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.fromDate = input.value;

    this.selectedDateFilter.set('custom');

    this.errorMessage.set('');

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

    this.selectedDateFilter.set('custom');

    this.errorMessage.set('');

    if (!this.isDateRangeValid()) {
      return;
    }

    this.loadDashboardData();
  }

  /* ===================================================
     UPDATE PAYMENT SUMMARY

     Payment information is package-level.

     Rules:

     1. Only non-cancelled visits inside the selected
        date range are considered.

     2. A PatientPackage is counted only ONCE even if
        multiple visits from that package are inside
        the selected date range.

     3. Amount Due comes from PatientPackage.totalAmount.

     4. Amount Received comes from
        PatientPackage.amountPaid.

     5. Outstanding Amount comes from
        PatientPackage.amountPending.

     We intentionally do NOT read payment information
     from Visit.
  =================================================== */

  private updatePaymentSummary(): void {
    const visitsInRange = this.visits.filter(
      (visit: Visit) => this.isVisitInSelectedDateRange(visit) && visit.status !== 'Cancelled',
    );

    /* ===============================================
       GET UNIQUE PACKAGE IDS
    ================================================ */

    const packageIds = [
      ...new Set(
        visitsInRange.map((visit) => visit.patientPackageId).filter((id): id is string => !!id),
      ),
    ];

    /* ===============================================
       CALCULATE PACKAGE-LEVEL TOTALS
    ================================================ */

    let totalAmountDue = 0;

    let totalAmountReceived = 0;

    let totalOutstandingAmount = 0;

    for (const packageId of packageIds) {
      const patientPackage = this.patientPackageMap.get(packageId);

      /*
       * Package information may not have loaded yet.
       */
      if (!patientPackage) {
        continue;
      }

      const amountDue = Number(patientPackage.totalAmount) || 0;

      const amountReceived = Number(patientPackage.amountPaid) || 0;

      const amountPending = Math.max(Number(patientPackage.amountPending) || 0, 0);

      totalAmountDue += amountDue;

      totalAmountReceived += amountReceived;

      totalOutstandingAmount += amountPending;
    }

    /* ===============================================
       UPDATE DASHBOARD PAYMENT SUMMARY
    ================================================ */

    this.paymentSummary = {
      totalAmountDue,

      totalAmountReceived,

      totalOutstandingAmount,
    };
  }

  /* ===================================================
     CHECK IF VISIT IS IN SELECTED DATE RANGE
  =================================================== */

  private isVisitInSelectedDateRange(visit: Visit): boolean {
    if (!visit.scheduledDate) {
      return false;
    }

    /*
     * Backend may return:
     *
     * 2026-08-27
     *
     * or:
     *
     * 2026-08-27T00:00:00
     *
     * We only need YYYY-MM-DD.
     */

    const visitDate = visit.scheduledDate.slice(0, 10);

    return visitDate >= this.fromDate && visitDate <= this.toDate;
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
