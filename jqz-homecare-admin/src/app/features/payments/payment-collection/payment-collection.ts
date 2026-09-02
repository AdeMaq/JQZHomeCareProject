import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { CollectionStatus, Visit } from '../../visits/visits.interface';
import { VisitsService } from '../../visits/visits.service';

@Component({
  selector: 'app-payment-collection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-collection.html',
  styleUrl: './payment-collection.css',
})
export class PaymentCollection implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly visitsService = inject(VisitsService);
  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DATA
  // ============================================================

  visits: Visit[] = [];

  // ============================================================
  // UI STATE
  // ============================================================

  isLoading = false;

  isCollecting = false;

  collectingVisitId: string | null = null;

  // ============================================================
  // MESSAGES
  // ============================================================

  successMessage = '';

  errorMessage = '';

  // ============================================================
  // FILTERS
  // ============================================================

  searchTerm = '';

  selectedCollectionStatus: 'All' | CollectionStatus = 'All';

  // ============================================================
  // COLLECTION MODAL
  // ============================================================

  collectionAmount = 0;

  selectedVisit: Visit | null = null;

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadPaymentCollections();
  }

  // ============================================================
  // LOAD PAYMENT COLLECTIONS
  // ============================================================

  loadPaymentCollections(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.visitsService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (visits) => {
          this.visits = visits;
        },

        error: (error) => {
          console.error('Failed to load payment collections:', error);

          this.errorMessage = this.getErrorMessage(error, 'Failed to load payment collections.');

          this.visits = [];
        },
      });
  }

  // ============================================================
  // FILTERED VISITS
  // ============================================================

  get filteredVisits(): Visit[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.visits.filter((visit) => {
      // ----------------------------------------------------------
      // SEARCH FILTER
      // ----------------------------------------------------------

      const matchesSearch =
        !search ||
        (visit.patientName ?? '').toLowerCase().includes(search) ||
        (visit.practitionerName ?? '').toLowerCase().includes(search) ||
        (visit.serviceName ?? '').toLowerCase().includes(search) ||
        (visit.areaName ?? '').toLowerCase().includes(search) ||
        (visit.packageName ?? '').toLowerCase().includes(search);

      // ----------------------------------------------------------
      // COLLECTION STATUS FILTER
      // ----------------------------------------------------------

      const matchesCollectionStatus =
        this.selectedCollectionStatus === 'All' ||
        visit.collectionStatus === this.selectedCollectionStatus;

      return matchesSearch && matchesCollectionStatus;
    });
  }

  // ============================================================
  // SUMMARY - COUNTS
  // ============================================================

  get totalVisits(): number {
    return this.visits.length;
  }

  get pendingVisits(): number {
    return this.visits.filter((visit) => visit.collectionStatus === 'Pending').length;
  }

  get installmentVisits(): number {
    return this.visits.filter((visit) => visit.collectionStatus === 'InstallmentPending').length;
  }

  get receivedVisits(): number {
    return this.visits.filter((visit) => visit.collectionStatus === 'Received').length;
  }

  // ============================================================
  // SUMMARY - AMOUNTS
  // ============================================================

  get totalAmountDue(): number {
    return this.visits.reduce((total, visit) => total + (Number(visit.amountDue) || 0), 0);
  }

  get totalAmountReceived(): number {
    return this.visits.reduce((total, visit) => total + (Number(visit.amountReceived) || 0), 0);
  }

  get totalAmountPending(): number {
    return this.visits.reduce((total, visit) => total + this.getPendingAmount(visit), 0);
  }

  // ============================================================
  // PAYMENT AMOUNTS
  // ============================================================

  /**
   * Display-only calculation.
   *
   * CollectionStatus remains the authoritative
   * payment state from the backend.
   */
  getPendingAmount(visit: Visit): number {
    const amountDue = Number(visit.amountDue) || 0;

    const amountReceived = Number(visit.amountReceived) || 0;

    return Math.max(amountDue - amountReceived, 0);
  }

  // ============================================================
  // PAYMENT STATE
  // ============================================================

  /**
   * CollectionStatus is authoritative.
   *
   * Do NOT derive the payment state from
   * amountDue / amountReceived.
   */
  getPaymentState(visit: Visit): string {
    switch (visit.collectionStatus) {
      case 'Received':
        return 'Payment Received';

      case 'InstallmentPending':
        return 'Payment Partially Received';

      case 'Pending':
        return 'Payment Pending';

      default:
        return 'Payment Status Unknown';
    }
  }

  // ============================================================
  // PAYMENT STATE CLASS
  // ============================================================

  getPaymentStateClass(visit: Visit): string {
    switch (visit.collectionStatus) {
      case 'Received':
        return 'payment-received';

      case 'InstallmentPending':
        return 'payment-partial';

      case 'Pending':
        return 'payment-pending';

      default:
        return 'payment-unknown';
    }
  }

  // ============================================================
  // COLLECTION STATUS LABEL
  // ============================================================

  getCollectionStatusLabel(status: CollectionStatus | string | null | undefined): string {
    switch (status) {
      case 'Received':
        return 'Received';

      case 'InstallmentPending':
        return 'Installment Pending';

      case 'Pending':
        return 'Pending';

      default:
        return 'Unknown';
    }
  }

  // ============================================================
  // COLLECTION STATUS CLASS
  // ============================================================

  getCollectionStatusClass(status: CollectionStatus | string | null | undefined): string {
    switch (status) {
      case 'Received':
        return 'collection-received';

      case 'InstallmentPending':
        return 'collection-installment';

      case 'Pending':
        return 'collection-pending';

      default:
        return 'collection-unknown';
    }
  }

  // ============================================================
  // RECEIVED BY
  // ============================================================

  getReceivedBy(visit: Visit): string {
    switch (visit.receivedBy) {
      case 'Practitioner':
        return 'Practitioner';

      case 'Company':
        return 'Company';

      default:
        return 'Not received';
    }
  }

  getReceivedByClass(visit: Visit): string {
    switch (visit.receivedBy) {
      case 'Practitioner':
        return 'received-by-practitioner';

      case 'Company':
        return 'received-by-company';

      default:
        return 'received-by-none';
    }
  }

  // ============================================================
  // PAYMENT COLLECTION PERMISSION
  // ============================================================

  /**
   * Determines whether the admin/company can collect
   * payment through this screen.
   *
   * Backend rules:
   *
   * - Cancelled visits cannot be collected.
   * - Received visits cannot be collected again.
   * - Practitioner-collected payments cannot also be
   *   collected by the company.
   * - There must be a remaining amount to collect.
   */
  canCollectPayment(visit: Visit): boolean {
    if (visit.status === 'Cancelled') {
      return false;
    }

    if (visit.collectionStatus === 'Received') {
      return false;
    }

    if (visit.receivedBy === 'Practitioner') {
      return false;
    }

    if (this.getPendingAmount(visit) <= 0) {
      return false;
    }

    return true;
  }

  // ============================================================
  // COLLECTION ACTION LABEL
  // ============================================================

  getCollectionActionLabel(visit: Visit): string {
    if (visit.status === 'Cancelled') {
      return 'Cancelled';
    }

    if (visit.collectionStatus === 'Received') {
      return 'Paid';
    }

    if (visit.receivedBy === 'Practitioner') {
      return 'Practitioner';
    }

    if (this.getPendingAmount(visit) <= 0) {
      return 'Recorded';
    }

    return 'Collect';
  }

  // ============================================================
  // COLLECTION ACTION DESCRIPTION
  // ============================================================

  getCollectionActionDescription(visit: Visit): string {
    if (visit.status === 'Cancelled') {
      return 'Payment cannot be collected for a cancelled visit.';
    }

    if (visit.collectionStatus === 'Received') {
      return 'Payment has already been fully received.';
    }

    if (visit.receivedBy === 'Practitioner') {
      return 'Payment is being collected by the practitioner.';
    }

    if (this.getPendingAmount(visit) <= 0) {
      return 'No remaining balance is available for company collection.';
    }

    return 'Collect payment';
  }

  // ============================================================
  // OPEN COLLECTION MODAL
  // ============================================================

  openCollection(visit: Visit): void {
    this.errorMessage = '';

    this.successMessage = '';

    // ----------------------------------------------------------
    // CANCELLED VISIT
    // ----------------------------------------------------------

    if (visit.status === 'Cancelled') {
      this.errorMessage = 'Payment cannot be collected for a cancelled visit.';

      return;
    }

    // ----------------------------------------------------------
    // ALREADY RECEIVED
    // ----------------------------------------------------------

    if (visit.collectionStatus === 'Received') {
      this.errorMessage = 'Payment has already been fully collected for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // PRACTITIONER COLLECTION
    // ----------------------------------------------------------

    if (visit.receivedBy === 'Practitioner') {
      this.errorMessage = 'Payment is already being collected by the practitioner for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // REMAINING BALANCE
    // ----------------------------------------------------------

    const pendingAmount = this.getPendingAmount(visit);

    if (pendingAmount <= 0) {
      this.errorMessage = 'There is no remaining balance to collect for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // OPEN MODAL
    // ----------------------------------------------------------

    this.selectedVisit = visit;

    this.collectionAmount = pendingAmount;
  }

  // ============================================================
  // CLOSE COLLECTION MODAL
  // ============================================================

  closeCollection(): void {
    if (this.isCollecting) {
      return;
    }

    this.selectedVisit = null;

    this.collectionAmount = 0;

    this.errorMessage = '';
  }

  // ============================================================
  // SET FULL PENDING AMOUNT
  // ============================================================

  setFullPendingAmount(): void {
    if (!this.selectedVisit) {
      return;
    }

    this.collectionAmount = this.getPendingAmount(this.selectedVisit);
  }

  // ============================================================
  // COLLECT PAYMENT
  // ============================================================

  collectPayment(): void {
    this.errorMessage = '';

    this.successMessage = '';

    // ----------------------------------------------------------
    // SELECTED VISIT
    // ----------------------------------------------------------

    if (!this.selectedVisit) {
      this.errorMessage = 'Please select a visit first.';

      return;
    }

    const visit = this.selectedVisit;

    // ----------------------------------------------------------
    // CANCELLED VISIT
    // ----------------------------------------------------------

    if (visit.status === 'Cancelled') {
      this.errorMessage = 'Payment cannot be collected for a cancelled visit.';

      return;
    }

    // ----------------------------------------------------------
    // ALREADY RECEIVED
    // ----------------------------------------------------------

    if (visit.collectionStatus === 'Received') {
      this.errorMessage = 'Payment has already been fully collected for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // PRACTITIONER COLLECTION
    // ----------------------------------------------------------

    if (visit.receivedBy === 'Practitioner') {
      this.errorMessage =
        'Payment is already being collected by the practitioner for this visit; it cannot also be collected by the company.';

      return;
    }

    // ----------------------------------------------------------
    // AMOUNT
    // ----------------------------------------------------------

    const amount = Number(this.collectionAmount);

    const pendingAmount = this.getPendingAmount(visit);

    // ----------------------------------------------------------
    // POSITIVE AMOUNT
    // ----------------------------------------------------------

    if (!Number.isFinite(amount) || amount <= 0) {
      this.errorMessage = 'Collection amount must be greater than zero.';

      return;
    }

    // ----------------------------------------------------------
    // MAXIMUM AMOUNT
    // ----------------------------------------------------------

    if (amount > pendingAmount) {
      this.errorMessage = `Collection amount cannot exceed the remaining balance of ${this.formatAmount(pendingAmount)}.`;

      return;
    }

    // ----------------------------------------------------------
    // START COLLECTION
    // ----------------------------------------------------------

    this.isCollecting = true;

    this.collectingVisitId = visit.id;

    this.visitsService
      .collectPayment(visit.id, {
        amount,
      })
      .pipe(
        finalize(() => {
          this.isCollecting = false;
          this.collectingVisitId = null;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // --------------------------------------------------------
        // SUCCESS
        // --------------------------------------------------------

        next: () => {
          this.successMessage = 'Payment collected successfully.';

          this.selectedVisit = null;

          this.collectionAmount = 0;

          this.loadPaymentCollections();
        },

        // --------------------------------------------------------
        // ERROR
        // --------------------------------------------------------

        error: (error) => {
          console.error('Failed to collect payment:', error);

          this.errorMessage = this.getErrorMessage(error, 'Failed to collect payment.');
        },
      });
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedCollectionStatus = 'All';
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
    this.successMessage = '';

    this.errorMessage = '';

    this.loadPaymentCollections();
  }

  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  formatAmount(amount: number | null | undefined): string {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(amount) || 0);
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error === 'string' && error.trim()) {
      return error;
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    if (error?.error?.title) {
      return error.error.title;
    }

    if (error?.message) {
      return error.message;
    }

    if (Array.isArray(error?.error?.errors)) {
      return error.error.errors.join(', ');
    }

    return fallback;
  }
}
