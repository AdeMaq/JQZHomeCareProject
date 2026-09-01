import { Component, OnInit } from '@angular/core';
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
  ) {}

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadVisit();
  }

  // ============================================================
  // LOAD VISIT
  // ============================================================

  loadVisit(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.visit = null;

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.isLoading = false;
      this.errorMessage = 'Visit ID was not provided.';
      return;
    }

    this.visitId = id;

    this.visitsService.getById(this.visitId).subscribe({
      next: (visit: Visit) => {
        this.visit = visit;
        this.isLoading = false;
      },

      error: (error) => {
        console.error('Failed to load visit details:', error);

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Unable to load visit details. Please try again.';
      },
    });
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
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
  // collectionStatus is authoritative.
  //
  // Do NOT determine payment status only from
  // amountReceived.
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
  //
  // Pending / InstallmentPending:
  // Payment collection can be available.
  //
  // Received:
  // Payment option should be hidden.
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
  //
  // This is a display calculation only.
  //
  // Payment status itself comes from collectionStatus.
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
  // ============================================================

  getReceivedByLabel(): string {
    if (!this.visit) {
      return 'Not available';
    }

    if (!this.isPaymentReceived()) {
      return 'Not received';
    }

    switch (this.visit.receivedBy) {
      case 'Practitioner':
        return 'Practitioner';

      case 'Company':
        return 'Company';

      default:
        return 'Not specified';
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
