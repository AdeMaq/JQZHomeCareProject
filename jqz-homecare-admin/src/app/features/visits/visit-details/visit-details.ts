import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { VisitsService } from '../visits.service';

import { Visit, VisitStatus } from '../visits.interface';

import {
  CollectionStatus,
  PatientPackage,
  ReceivedByType,
  PatientPackageService,
} from '../../../core/services/patient-package.service';

@Component({
  selector: 'app-visit-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css',
})
export class VisitDetails implements OnInit {
  // ============================================================
  // COMPONENT STATE
  // ============================================================

  visit: Visit | null = null;

  /**
   * Payment information is package-level.
   *
   * Visit itself no longer owns:
   *
   * - amountDue
   * - amountReceived
   * - collectionStatus
   * - receivedBy
   *
   * Those values come from PatientPackage.
   */
  patientPackage: PatientPackage | null = null;

  isLoading = true;

  isLoadingPatientPackage = false;

  errorMessage = '';

  private visitId = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly visitsService: VisitsService,
    private readonly patientPackageService: PatientPackageService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('VISIT DETAILS COMPONENT INITIALIZED');
    console.log('=================================');

    this.loadVisit();
  }

  // ============================================================
  // LOAD VISIT
  // ============================================================

  loadVisit(): void {
    console.log('=================================');
    console.log('LOADING VISIT DETAILS');
    console.log('=================================');

    this.isLoading = true;
    this.isLoadingPatientPackage = false;

    this.errorMessage = '';

    this.visit = null;
    this.patientPackage = null;

    const id = this.route.snapshot.paramMap.get('id');

    console.log('ROUTE VISIT ID:', id);

    if (!id) {
      console.error('VISIT ID WAS NOT PROVIDED');

      this.isLoading = false;
      this.errorMessage = 'Visit ID was not provided.';

      this.cdr.detectChanges();

      return;
    }

    this.visitId = id;

    console.log('CALLING VISITS SERVICE');
    console.log('VISIT ID:', this.visitId);

    this.visitsService.getById(this.visitId).subscribe({
      // ========================================================
      // SUCCESS
      // ========================================================

      next: (visit: Visit) => {
        console.log('=================================');
        console.log('VISIT API RESPONSE RECEIVED');
        console.log('=================================');

        console.log('VISIT:', visit);

        this.visit = visit;

        this.isLoading = false;
        this.errorMessage = '';

        console.log('visit assigned:', this.visit);
        console.log('isLoading:', this.isLoading);
        console.log('errorMessage:', this.errorMessage);

        /**
         * Payment information belongs to PatientPackage.
         *
         * Therefore, after loading the visit, load its
         * PatientPackage using patientPackageId.
         */
        if (visit.patientPackageId) {
          this.loadPatientPackage(visit.patientPackageId);
        }

        /**
         * Explicitly trigger Angular change detection.
         */
        this.cdr.detectChanges();

        console.log('CHANGE DETECTION TRIGGERED');
      },

      // ========================================================
      // ERROR
      // ========================================================

      error: (error: unknown) => {
        console.error('=================================');
        console.error('FAILED TO LOAD VISIT DETAILS');
        console.error('=================================');

        console.error('ERROR:', error);

        const apiError = this.getApiError(error);

        console.error('ERROR BODY:', apiError);
        console.error('ERROR MESSAGE:', this.getApiErrorMessage(error));

        this.visit = null;
        this.patientPackage = null;

        this.isLoading = false;
        this.isLoadingPatientPackage = false;

        this.errorMessage = this.getApiErrorMessage(error);

        this.cdr.detectChanges();
      },

      // ========================================================
      // COMPLETE
      // ========================================================

      complete: () => {
        console.log('=================================');
        console.log('VISIT API REQUEST COMPLETED');
        console.log('=================================');

        /**
         * Loading state is intentionally not changed here.
         *
         * Success/error handlers are responsible for that.
         */
      },
    });
  }

  // ============================================================
  // LOAD PATIENT PACKAGE
  // ============================================================

  private loadPatientPackage(patientPackageId: string): void {
    console.log('=================================');
    console.log('LOADING PATIENT PACKAGE');
    console.log('=================================');

    console.log('PATIENT PACKAGE ID:', patientPackageId);

    this.isLoadingPatientPackage = true;

    this.patientPackageService.getById(patientPackageId).subscribe({
      // ========================================================
      // SUCCESS
      // ========================================================

      next: (patientPackage: PatientPackage) => {
        console.log('=================================');
        console.log('PATIENT PACKAGE LOADED');
        console.log('=================================');

        console.log('PATIENT PACKAGE:', patientPackage);

        /**
         * Make sure the package still belongs to the
         * currently displayed visit.
         */
        if (this.visit?.patientPackageId !== patientPackage.id) {
          console.warn('Loaded PatientPackage does not belong to the current visit.');

          this.isLoadingPatientPackage = false;

          this.cdr.detectChanges();

          return;
        }

        this.patientPackage = patientPackage;

        this.isLoadingPatientPackage = false;

        console.log('Package payment information:', {
          totalAmount: patientPackage.totalAmount,
          amountPaid: patientPackage.amountPaid,
          amountPending: patientPackage.amountPending,
          collectionStatus: patientPackage.collectionStatus,
          receivedBy: patientPackage.receivedBy,
          installmentPayments: patientPackage.installmentPayments,
        });

        this.cdr.detectChanges();
      },

      // ========================================================
      // ERROR
      // ========================================================

      error: (error: unknown) => {
        console.error('=================================');
        console.error('FAILED TO LOAD PATIENT PACKAGE');
        console.error('=================================');

        console.error('ERROR:', error);

        this.patientPackage = null;

        this.isLoadingPatientPackage = false;

        /**
         * The visit itself has already loaded successfully.
         *
         * Therefore, do not replace the entire visit page
         * with an error state.
         *
         * The payment section can instead display that
         * package payment information is unavailable.
         */

        this.cdr.detectChanges();
      },

      // ========================================================
      // COMPLETE
      // ========================================================

      complete: () => {
        console.log('PATIENT PACKAGE REQUEST COMPLETED');
      },
    });
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
    console.log('RETRYING VISIT DETAILS LOAD...');

    this.loadVisit();
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  backToVisits(): void {
    this.router.navigate(['/visits']);
  }

  editVisit(): void {
    if (!this.visit) {
      return;
    }

    this.router.navigate(['/visits', this.visit.id, 'edit']);
  }

  // ============================================================
  // DATE FORMATTING
  // ============================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return 'Not scheduled';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'Invalid date';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ============================================================
  // TIME SLOT
  // ============================================================

  formatSlot(visit: Visit): string {
    if (!visit.slotStart && !visit.slotEnd) {
      return 'Not scheduled';
    }

    const start = this.formatTime(visit.slotStart);
    const end = this.formatTime(visit.slotEnd);

    if (start && end) {
      return `${start} - ${end}`;
    }

    return start || end || 'Not scheduled';
  }

  // ============================================================
  // TIME FORMAT
  // ============================================================

  private formatTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }

    const parts = time.split(':');

    if (parts.length < 2) {
      return time;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return time;
    }

    const date = new Date();

    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  // ============================================================
  // VISIT STATUS CLASS
  // ============================================================

  getStatusClass(status: VisitStatus | string): string {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';

      case 'Accepted':
        return 'status-accepted';

      case 'Completed':
        return 'status-completed';

      case 'Cancelled':
        return 'status-cancelled';

      default:
        return 'status-default';
    }
  }

  // ============================================================
  // VISIT STATUS ICON
  // ============================================================

  getStatusIcon(status: VisitStatus | string): string {
    switch (status) {
      case 'Scheduled':
        return 'fa-solid fa-calendar-check';

      case 'Accepted':
        return 'fa-solid fa-circle-check';

      case 'Completed':
        return 'fa-solid fa-check-double';

      case 'Cancelled':
        return 'fa-solid fa-circle-xmark';

      default:
        return 'fa-solid fa-circle-info';
    }
  }

  // ============================================================
  // PACKAGE COLLECTION STATUS
  // ============================================================

  getCollectionStatus(): CollectionStatus | null {
    return this.patientPackage?.collectionStatus ?? null;
  }

  // ============================================================
  // COLLECTION STATUS CLASS
  // ============================================================

  getCollectionStatusClass(status: CollectionStatus | string | null | undefined): string {
    switch (status) {
      case 'Received':
        return 'collection-received';

      case 'Pending':
        return 'collection-pending';

      case 'InstallmentPending':
        return 'collection-installment-pending';

      default:
        return 'collection-unknown';
    }
  }

  // ============================================================
  // COLLECTION STATUS ICON
  // ============================================================

  getCollectionIcon(status: CollectionStatus | string | null | undefined): string {
    switch (status) {
      case 'Received':
        return 'fa-solid fa-circle-check';

      case 'Pending':
        return 'fa-solid fa-clock';

      case 'InstallmentPending':
        return 'fa-solid fa-hourglass-half';

      default:
        return 'fa-solid fa-circle-question';
    }
  }

  // ============================================================
  // COLLECTION STATUS LABEL
  // ============================================================

  getCollectionStatusLabel(status: CollectionStatus | string | null | undefined): string {
    switch (status) {
      case 'Received':
        return 'Received';

      case 'Pending':
        return 'Pending';

      case 'InstallmentPending':
        return 'Installment Pending';

      default:
        return 'Unknown';
    }
  }

  // ============================================================
  // PAYMENT PENDING
  //
  // CollectionStatus is package-level.
  // ============================================================

  isPaymentPending(): boolean {
    const collectionStatus = this.patientPackage?.collectionStatus;

    return collectionStatus === 'Pending' || collectionStatus === 'InstallmentPending';
  }

  // ============================================================
  // PAYMENT RECEIVED
  // ============================================================

  isPaymentReceived(): boolean {
    return this.patientPackage?.collectionStatus === 'Received';
  }

  // ============================================================
  // INSTALLMENT PENDING
  // ============================================================

  isInstallmentPending(): boolean {
    return this.patientPackage?.collectionStatus === 'InstallmentPending';
  }

  // ============================================================
  // MOBILE PAYMENT OPTION
  //
  // CollectionStatus controls whether the mobile payment
  // option should be available.
  // ============================================================

  shouldShowMobilePaymentOption(): boolean {
    /**
     * Pending / InstallmentPending:
     * payment collection can still be relevant.
     *
     * Received:
     * payment option must remain hidden.
     */
    return this.isPaymentPending();
  }

  // ============================================================
  // MOBILE PAYMENT ACTION LABEL
  // ============================================================

  getMobilePaymentStatusLabel(): string {
    if (!this.patientPackage) {
      return 'Payment information unavailable';
    }

    if (this.isPaymentReceived()) {
      return 'Payment option hidden';
    }

    if (this.isInstallmentPending()) {
      return 'Installment collection available';
    }

    return 'Collect payment available';
  }

  // ============================================================
  // MOBILE PAYMENT ACTION DESCRIPTION
  // ============================================================

  getMobilePaymentStatusDescription(): string {
    if (!this.patientPackage) {
      return 'Package payment information could not be loaded.';
    }

    if (this.isPaymentReceived()) {
      return 'Payment has already been collected. No further payment action is required.';
    }

    if (this.isInstallmentPending()) {
      return 'An installment is still pending and can be collected by the practitioner.';
    }

    return 'Payment is pending. The practitioner can collect the payment from the mobile app.';
  }

  // ============================================================
  // PACKAGE TOTAL AMOUNT
  // ============================================================

  getTotalAmount(): number {
    return Number(this.patientPackage?.totalAmount) || 0;
  }

  // ============================================================
  // PACKAGE AMOUNT PAID
  // ============================================================

  getAmountPaid(): number {
    return Number(this.patientPackage?.amountPaid) || 0;
  }

  // ============================================================
  // PACKAGE AMOUNT PENDING
  //
  // AmountPending is supplied by the backend package DTO.
  // ============================================================

  getPendingAmount(): number {
    return Number(this.patientPackage?.amountPending) || 0;
  }

  // ============================================================
  // AMOUNT FORMAT
  // ============================================================

  formatAmount(amount: number | null | undefined): string {
    const value = Number(amount);

    if (Number.isNaN(value)) {
      return '0.00';
    }

    return value.toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ============================================================
  // RECEIVED BY LABEL
  //
  // IMPORTANT:
  // ReceivedBy belongs to PatientPackage.
  //
  // It is intentionally NOT read from Visit.
  // ============================================================

  getReceivedByLabel(): string {
    if (!this.patientPackage) {
      return 'Not available';
    }

    switch (this.patientPackage.receivedBy) {
      case 'Practitioner':
        return 'Practitioner';

      case 'Company':
        return 'Company';

      default:
        return 'Not received';
    }
  }

  // ============================================================
  // RECEIVED BY ICON
  // ============================================================

  getReceivedByIcon(receivedBy: ReceivedByType | null | undefined): string {
    switch (receivedBy) {
      case 'Practitioner':
        return 'fa-solid fa-user-doctor';

      case 'Company':
        return 'fa-solid fa-building';

      default:
        return 'fa-solid fa-user';
    }
  }

  // ============================================================
  // PACKAGE PAYMENT TYPE
  // ============================================================

  getPaymentTypeLabel(): string {
    if (!this.patientPackage) {
      return 'Not available';
    }

    return this.patientPackage.paymentType === 'Installment' ? 'Installment' : 'Full Advance';
  }

  // ============================================================
  // PAYMENT PACKAGE LOADING STATE
  // ============================================================

  isPaymentInformationLoading(): boolean {
    return !!this.visit?.patientPackageId && this.isLoadingPatientPackage;
  }

  // ============================================================
  // PAYMENT INFORMATION AVAILABLE
  // ============================================================

  hasPaymentInformation(): boolean {
    return !!this.patientPackage;
  }

  // ============================================================
  // API ERROR HELPERS
  // ============================================================

  private getApiError(error: unknown): unknown {
    if (typeof error !== 'object' || error === null) {
      return null;
    }

    const response = error as {
      error?: unknown;
    };

    return response.error ?? null;
  }

  private getApiErrorMessage(error: unknown): string {
    if (typeof error !== 'object' || error === null) {
      return 'Unable to load visit details. Please try again.';
    }

    const response = error as {
      status?: number;
      message?: string;
      error?: {
        message?: string;
        title?: string;
        detail?: string;
        errors?: Record<string, string[]>;
      };
    };

    if (response.error?.message) {
      return response.error.message;
    }

    if (response.error?.detail) {
      return response.error.detail;
    }

    if (response.error?.title) {
      return response.error.title;
    }

    if (response.error?.errors) {
      const validationErrors = Object.values(response.error.errors)
        .flat()
        .filter(
          (message): message is string => typeof message === 'string' && message.trim().length > 0,
        );

      if (validationErrors.length > 0) {
        return validationErrors.join(' ');
      }
    }

    if (response.message && response.message.trim().length > 0) {
      return response.message;
    }

    if ((response.status ?? 0) >= 500) {
      return 'The server encountered an error while loading the visit information. Please try again.';
    }

    if ((response.status ?? 0) >= 400) {
      return 'The visit could not be loaded. Please check the information and try again.';
    }

    return 'Unable to load visit details. Please try again.';
  }
}
