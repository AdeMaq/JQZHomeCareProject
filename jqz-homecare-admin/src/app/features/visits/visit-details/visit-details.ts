import { ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { VisitsService } from '../visits.service';

import { CollectionStatus, ReceivedByType, Visit, VisitStatus } from '../visits.interface';

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

  isLoading = true;

  errorMessage = '';

  private visitId = '';

  // ============================================================
  // CONSTRUCTOR
  // ============================================================

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly visitsService: VisitsService,
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
    this.errorMessage = '';
    this.visit = null;

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

        /*
         * Explicitly trigger Angular change detection.
         *
         * The API request is successful (HTTP 200), so the UI
         * must now move from the loading state to the details
         * state.
         */
        this.cdr.detectChanges();

        console.log('CHANGE DETECTION TRIGGERED');
      },

      // ========================================================
      // ERROR
      // ========================================================

      error: (error) => {
        console.error('=================================');
        console.error('FAILED TO LOAD VISIT DETAILS');
        console.error('=================================');

        console.error('ERROR:', error);
        console.error('ERROR BODY:', error?.error);
        console.error('ERROR MESSAGE:', error?.message);

        this.visit = null;
        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load visit details. Please try again.';

        this.cdr.detectChanges();
      },

      // ========================================================
      // COMPLETE
      // ========================================================

      complete: () => {
        console.log('=================================');
        console.log('VISIT API REQUEST COMPLETED');
        console.log('=================================');

        /*
         * This is intentionally NOT responsible for changing
         * isLoading.
         *
         * The success/error handlers handle that explicitly.
         */
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
  // CollectionStatus is authoritative.
  // ============================================================

  isPaymentPending(): boolean {
    if (!this.visit) {
      return false;
    }

    return (
      this.visit.collectionStatus === 'Pending' ||
      this.visit.collectionStatus === 'InstallmentPending'
    );
  }

  // ============================================================
  // PAYMENT RECEIVED
  // ============================================================

  isPaymentReceived(): boolean {
    if (!this.visit) {
      return false;
    }

    return this.visit.collectionStatus === 'Received';
  }

  // ============================================================
  // INSTALLMENT PENDING
  // ============================================================

  isInstallmentPending(): boolean {
    if (!this.visit) {
      return false;
    }

    return this.visit.collectionStatus === 'InstallmentPending';
  }

  // ============================================================
  // MOBILE PAYMENT OPTION
  // ============================================================

  shouldShowMobilePaymentOption(): boolean {
    return this.isPaymentPending();
  }

  // ============================================================
  // MOBILE PAYMENT ACTION LABEL
  // ============================================================

  getMobilePaymentStatusLabel(): string {
    if (!this.visit) {
      return 'Unknown';
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
    if (!this.visit) {
      return '';
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
  // PENDING AMOUNT
  // ============================================================

  getPendingAmount(): number {
    if (!this.visit) {
      return 0;
    }

    const amountDue = Number(this.visit.amountDue) || 0;
    const amountReceived = Number(this.visit.amountReceived) || 0;

    return Math.max(amountDue - amountReceived, 0);
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
  // Important:
  // ReceivedBy is independent from CollectionStatus.
  //
  // Example:
  // CollectionStatus = InstallmentPending
  // ReceivedBy       = Company
  //
  // We should still display Company.
  // ============================================================

  getReceivedByLabel(): string {
    if (!this.visit) {
      return 'Not available';
    }

    switch (this.visit.receivedBy) {
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
}
