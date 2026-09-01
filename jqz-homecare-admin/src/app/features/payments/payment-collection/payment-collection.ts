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

  selectedCollectionStatus: CollectionStatus | 'All' = 'All';

  // ============================================================
  // COLLECTION FORM
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

    this.cdr.detectChanges();

    this.visitsService
      .getAll()
      .pipe(
        finalize(() => {
          this.isLoading = false;

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (visits: Visit[]) => {
          this.visits = Array.isArray(visits) ? visits : [];

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error('Error loading payment collections:', error);

          this.visits = [];

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to load payment collection information. Please try again.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // FILTERED VISITS
  // ============================================================

  get filteredVisits(): Visit[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.visits.filter((visit) => {
      const matchesSearch =
        !search ||
        visit.patientName?.toLowerCase().includes(search) ||
        visit.practitionerName?.toLowerCase().includes(search) ||
        visit.serviceName?.toLowerCase().includes(search) ||
        visit.areaName?.toLowerCase().includes(search);

      const matchesCollection =
        this.selectedCollectionStatus === 'All' ||
        visit.collectionStatus === this.selectedCollectionStatus;

      return matchesSearch && matchesCollection;
    });
  }

  // ============================================================
  // SUMMARY COUNTS
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
  // SUMMARY AMOUNTS
  // ============================================================

  get totalAmountDue(): number {
    return this.visits.reduce((total, visit) => total + Number(visit.amountDue ?? 0), 0);
  }

  get totalAmountReceived(): number {
    return this.visits.reduce((total, visit) => total + Number(visit.amountReceived ?? 0), 0);
  }

  get totalAmountPending(): number {
    return this.visits.reduce((total, visit) => total + this.getPendingAmount(visit), 0);
  }

  // ============================================================
  // PENDING AMOUNT
  // ============================================================

  getPendingAmount(visit: Visit): number {
    const amountDue = Number(visit.amountDue ?? 0);

    const amountReceived = Number(visit.amountReceived ?? 0);

    return Math.max(amountDue - amountReceived, 0);
  }

  // ============================================================
  // PAYMENT STATE
  // ============================================================

  getPaymentState(visit: Visit): string {
    const amountDue = Number(visit.amountDue ?? 0);

    const amountReceived = Number(visit.amountReceived ?? 0);

    if (amountReceived <= 0) {
      return 'Payment Pending';
    }

    if (amountReceived < amountDue) {
      return 'Payment Partially Received';
    }

    return 'Payment Received';
  }

  // ============================================================
  // PAYMENT STATE CLASS
  // ============================================================

  getPaymentStateClass(visit: Visit): string {
    const amountDue = Number(visit.amountDue ?? 0);

    const amountReceived = Number(visit.amountReceived ?? 0);

    if (amountReceived <= 0) {
      return 'payment-pending';
    }

    if (amountReceived < amountDue) {
      return 'payment-partial';
    }

    return 'payment-received';
  }

  // ============================================================
  // RECEIVED BY
  // ============================================================

  getReceivedBy(visit: Visit): string {
    if (!visit.receivedBy) {
      return 'Not received';
    }

    return visit.receivedBy;
  }

  // ============================================================
  // COLLECTION STATUS LABEL
  // ============================================================

  getCollectionStatusLabel(status: CollectionStatus): string {
    switch (status) {
      case 'Received':
        return 'Received';

      case 'InstallmentPending':
        return 'Installment Pending';

      case 'Pending':
      default:
        return 'Pending';
    }
  }

  // ============================================================
  // COLLECTION STATUS CLASS
  // ============================================================

  getCollectionStatusClass(status: CollectionStatus): string {
    switch (status) {
      case 'Received':
        return 'collection-received';

      case 'InstallmentPending':
        return 'collection-installment';

      case 'Pending':
      default:
        return 'collection-pending';
    }
  }

  // ============================================================
  // RECEIVED BY CLASS
  // ============================================================

  getReceivedByClass(visit: Visit): string {
    if (!visit.receivedBy) {
      return 'received-by-none';
    }

    if (visit.receivedBy === 'Practitioner') {
      return 'received-by-practitioner';
    }

    return 'received-by-company';
  }

  // ============================================================
  // FORMAT AMOUNT
  // ============================================================

  formatAmount(amount: number | null | undefined): string {
    return Number(amount ?? 0).toLocaleString('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ============================================================
  // OPEN COLLECTION
  // ============================================================

  openCollection(visit: Visit): void {
    const pendingAmount = this.getPendingAmount(visit);

    if (pendingAmount <= 0 || visit.collectionStatus === 'Received') {
      return;
    }

    this.selectedVisit = visit;

    this.collectionAmount = pendingAmount;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();
  }

  // ============================================================
  // CLOSE COLLECTION
  // ============================================================

  closeCollection(): void {
    if (this.isCollecting) {
      return;
    }

    this.selectedVisit = null;

    this.collectionAmount = 0;

    this.errorMessage = '';

    this.cdr.detectChanges();
  }

  // ============================================================
  // SET FULL PENDING AMOUNT
  // ============================================================

  setFullPendingAmount(): void {
    if (!this.selectedVisit) {
      return;
    }

    this.collectionAmount = this.getPendingAmount(this.selectedVisit);

    this.cdr.detectChanges();
  }

  // ============================================================
  // COLLECT PAYMENT
  // ============================================================

  collectPayment(): void {
    if (!this.selectedVisit) {
      return;
    }

    const pendingAmount = this.getPendingAmount(this.selectedVisit);

    const amount = Number(this.collectionAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      this.errorMessage = 'Please enter a valid payment amount.';

      this.cdr.detectChanges();

      return;
    }

    if (amount > pendingAmount) {
      this.errorMessage = `The collection amount cannot exceed the pending amount of PKR ${this.formatAmount(
        pendingAmount,
      )}.`;

      this.cdr.detectChanges();

      return;
    }

    const visitId = this.selectedVisit.id;

    this.isCollecting = true;

    this.collectingVisitId = visitId;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();

    this.visitsService
      .collectPayment(visitId, {
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
        next: () => {
          this.successMessage = 'Payment collected successfully.';

          this.selectedVisit = null;

          this.collectionAmount = 0;

          // Reload the visits so the UI reflects the
          // authoritative values returned by the backend.
          this.loadPaymentCollections();
        },

        error: (error: unknown) => {
          console.error('Error collecting payment:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to collect the payment. Please try again.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  clearFilters(): void {
    this.searchTerm = '';

    this.selectedCollectionStatus = 'All';

    this.cdr.detectChanges();
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
    this.loadPaymentCollections();
  }

  // ============================================================
  // BACKEND ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const httpError = error as {
        error?: {
          message?: string;
          title?: string;
        };
      };

      if (httpError.error?.message) {
        return httpError.error.message;
      }

      if (httpError.error?.title) {
        return httpError.error.title;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallbackMessage;
  }
}
