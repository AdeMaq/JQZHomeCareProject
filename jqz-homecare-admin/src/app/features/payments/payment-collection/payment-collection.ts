import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, finalize } from 'rxjs';

import { Visit } from '../../visits/visits.interface';
import { VisitsService } from '../../visits/visits.service';

import {
  PatientPackage,
  PatientPackageService,
} from '../../../core/services/patient-package.service';

// ============================================================
// FILTER TYPES
// ============================================================

type CollectionStatusFilter = 'All' | 'Pending' | 'InstallmentPending' | 'Received';

// ============================================================
// COMPONENT
// ============================================================

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

  private readonly patientPackageService = inject(PatientPackageService);

  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DATA
  // ============================================================

  visits: Visit[] = [];

  /**
   * PatientPackage payment information is package-level.
   *
   * A Visit only contains patientPackageId.
   *
   * Payment information must therefore be resolved through
   * this lookup map instead of being read from Visit.
   */
  private patientPackageMap = new Map<string, PatientPackage>();

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

  selectedCollectionStatus: CollectionStatusFilter = 'All';

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
          this.enrichVisitsWithPatientPackages(visits);
        },

        error: (error) => {
          console.error('Failed to load payment collections:', error);

          this.errorMessage = this.getErrorMessage(error, 'Failed to load payment collections.');

          this.visits = [];

          this.patientPackageMap.clear();
        },
      });
  }

  // ============================================================
  // LOAD PATIENT PACKAGE PAYMENT INFORMATION
  // ============================================================

  /**
   * Loads the PatientPackage associated with every visit.
   *
   * IMPORTANT:
   *
   * Payment information is owned by PatientPackage.
   *
   * Visit only provides patientPackageId.
   */
  private enrichVisitsWithPatientPackages(visits: Visit[]): void {
    // ----------------------------------------------------------
    // NO VISITS
    // ----------------------------------------------------------

    if (!visits.length) {
      this.visits = [];

      this.patientPackageMap.clear();

      return;
    }

    // ----------------------------------------------------------
    // GET UNIQUE PATIENT PACKAGE IDS
    // ----------------------------------------------------------

    const patientPackageIds = [
      ...new Set(visits.map((visit) => visit.patientPackageId).filter((id): id is string => !!id)),
    ];

    // ----------------------------------------------------------
    // NO PATIENT PACKAGE IDS
    // ----------------------------------------------------------

    if (!patientPackageIds.length) {
      this.visits = visits;

      this.patientPackageMap.clear();

      return;
    }

    // ----------------------------------------------------------
    // LOAD PATIENT PACKAGES
    // ----------------------------------------------------------

    const packageRequests = patientPackageIds.map((id) => this.patientPackageService.getById(id));

    forkJoin(packageRequests).subscribe({
      next: (packages) => {
        // ------------------------------------------------------
        // CLEAR PREVIOUS LOOKUP
        // ------------------------------------------------------

        this.patientPackageMap.clear();

        // ------------------------------------------------------
        // CREATE PATIENT PACKAGE LOOKUP MAP
        // ------------------------------------------------------

        for (const patientPackage of packages) {
          this.patientPackageMap.set(patientPackage.id, patientPackage);
        }

        // ------------------------------------------------------
        // KEEP ORIGINAL VISITS
        // ------------------------------------------------------
        //
        // We intentionally do NOT copy payment information
        // onto the Visit object.
        //
        // Payment information is accessed through:
        //
        // Visit.patientPackageId
        //          ↓
        // PatientPackage
        //
        // ------------------------------------------------------

        this.visits = visits;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load patient package payment information:', error);

        // ------------------------------------------------------
        // PRESERVE ORIGINAL VISITS
        // ------------------------------------------------------

        this.visits = visits;

        this.patientPackageMap.clear();

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // GET PATIENT PACKAGE FOR VISIT
  // ============================================================

  /**
   * Resolves the PatientPackage associated with a Visit.
   *
   * Payment information must always be obtained from this
   * package rather than from the Visit.
   */
  getPatientPackage(visit: Visit | null): PatientPackage | null {
    if (!visit?.patientPackageId) {
      return null;
    }

    return this.patientPackageMap.get(visit.patientPackageId) ?? null;
  }

  // ============================================================
  // PAYMENT TYPE
  // ============================================================

  /**
   * Returns the payment type from PatientPackage.
   */
  getPaymentType(visit: Visit): 'FullAdvance' | 'Installment' | null {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return null;
    }

    return this.mapPatientPackagePaymentType(patientPackage.paymentType);
  }

  // ============================================================
  // MAP PATIENT PACKAGE PAYMENT TYPE
  // ============================================================

  private mapPatientPackagePaymentType(value: unknown): 'FullAdvance' | 'Installment' | null {
    // ----------------------------------------------------------
    // NUMERIC BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'number') {
      if (value === 0) {
        return 'FullAdvance';
      }

      if (value === 1) {
        return 'Installment';
      }

      return null;
    }

    // ----------------------------------------------------------
    // STRING BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'fulladvance' || normalized === 'full advance') {
        return 'FullAdvance';
      }

      if (normalized === 'installment') {
        return 'Installment';
      }
    }

    return null;
  }

  // ============================================================
  // COLLECTION STATUS
  // ============================================================

  /**
   * Returns the authoritative collection status from the
   * PatientPackage.
   *
   * IMPORTANT:
   *
   * CollectionStatus no longer belongs to Visit.
   */
  getCollectionStatus(visit: Visit | null): 'Pending' | 'Received' | 'InstallmentPending' | null {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return null;
    }

    return this.mapCollectionStatus(patientPackage.collectionStatus);
  }

  // ============================================================
  // MAP COLLECTION STATUS
  // ============================================================

  private mapCollectionStatus(
    value: unknown,
  ): 'Pending' | 'Received' | 'InstallmentPending' | null {
    // ----------------------------------------------------------
    // NUMERIC BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'number') {
      switch (value) {
        case 0:
          return 'Pending';

        case 1:
          return 'Received';

        case 2:
          return 'InstallmentPending';

        default:
          return null;
      }
    }

    // ----------------------------------------------------------
    // STRING BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'pending') {
        return 'Pending';
      }

      if (normalized === 'received') {
        return 'Received';
      }

      if (normalized === 'installmentpending' || normalized === 'installment pending') {
        return 'InstallmentPending';
      }
    }

    return null;
  }

  // ============================================================
  // RECEIVED BY
  // ============================================================

  /**
   * Returns the authoritative ReceivedBy value from
   * PatientPackage.
   *
   * ReceivedBy is package-level because payment collection
   * belongs to the PatientPackage payment lifecycle.
   */
  getReceivedBy(visit: Visit | null): 'Practitioner' | 'Company' | null {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return null;
    }

    return this.mapReceivedBy(patientPackage.receivedBy);
  }

  // ============================================================
  // MAP RECEIVED BY
  // ============================================================

  private mapReceivedBy(value: unknown): 'Practitioner' | 'Company' | null {
    // ----------------------------------------------------------
    // NUMERIC BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'number') {
      switch (value) {
        case 0:
          return 'Practitioner';

        case 1:
          return 'Company';

        default:
          return null;
      }
    }

    // ----------------------------------------------------------
    // STRING BACKEND ENUM
    // ----------------------------------------------------------

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (normalized === 'practitioner') {
        return 'Practitioner';
      }

      if (normalized === 'company') {
        return 'Company';
      }
    }

    return null;
  }

  // ============================================================
  // PAYMENT AMOUNTS
  // ============================================================

  /**
   * Returns the package total amount.
   *
   * This value comes from PatientPackage.TotalAmount.
   */
  getAmountDue(visit: Visit | null): number {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return 0;
    }

    return Number(patientPackage.totalAmount) || 0;
  }

  /**
   * Returns the package amount already paid.
   *
   * This value comes from PatientPackage.AmountPaid.
   */
  getAmountReceived(visit: Visit | null): number {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return 0;
    }

    return Number(patientPackage.amountPaid) || 0;
  }

  /**
   * Returns the package amount still pending.
   *
   * This value comes from PatientPackage.AmountPending.
   *
   * We intentionally do not calculate:
   *
   * amountDue - amountReceived
   *
   * because the backend already owns this package-level
   * payment state.
   */
  getPendingAmount(visit: Visit | null): number {
    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return 0;
    }

    return Math.max(Number(patientPackage.amountPending) || 0, 0);
  }

  // ============================================================
  // FILTERED VISITS
  // ============================================================

  get filteredVisits(): Visit[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.visits.filter((visit) => {
      // --------------------------------------------------------
      // SEARCH FILTER
      // --------------------------------------------------------

      const matchesSearch =
        !search ||
        (visit.patientName ?? '').toLowerCase().includes(search) ||
        (visit.patientPhone ?? '').toLowerCase().includes(search) ||
        (visit.practitionerName ?? '').toLowerCase().includes(search) ||
        (visit.serviceName ?? '').toLowerCase().includes(search) ||
        (visit.areaName ?? '').toLowerCase().includes(search) ||
        (visit.packageName ?? '').toLowerCase().includes(search);

      // --------------------------------------------------------
      // COLLECTION STATUS FILTER
      // --------------------------------------------------------

      const collectionStatus = this.getCollectionStatus(visit);

      const matchesCollectionStatus =
        this.selectedCollectionStatus === 'All' ||
        collectionStatus === this.selectedCollectionStatus;

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
    return this.visits.filter((visit) => this.getCollectionStatus(visit) === 'Pending').length;
  }

  get installmentVisits(): number {
    return this.visits.filter((visit) => this.getCollectionStatus(visit) === 'InstallmentPending')
      .length;
  }

  get receivedVisits(): number {
    return this.visits.filter((visit) => this.getCollectionStatus(visit) === 'Received').length;
  }

  // ============================================================
  // SUMMARY - AMOUNTS
  // ============================================================

  get totalAmountDue(): number {
    return this.visits.reduce((total, visit) => total + this.getAmountDue(visit), 0);
  }

  get totalAmountReceived(): number {
    return this.visits.reduce((total, visit) => total + this.getAmountReceived(visit), 0);
  }

  get totalAmountPending(): number {
    return this.visits.reduce((total, visit) => total + this.getPendingAmount(visit), 0);
  }

  // ============================================================
  // PAYMENT STATE
  // ============================================================

  /**
   * CollectionStatus is authoritative and comes from
   * PatientPackage.
   */
  getPaymentState(visit: Visit): string {
    switch (this.getCollectionStatus(visit)) {
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
    switch (this.getCollectionStatus(visit)) {
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

  getCollectionStatusLabel(
    status: 'Pending' | 'Received' | 'InstallmentPending' | string | null | undefined,
  ): string {
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

  getCollectionStatusClass(
    status: 'Pending' | 'Received' | 'InstallmentPending' | string | null | undefined,
  ): string {
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
  // RECEIVED BY LABEL
  // ============================================================

  getReceivedByLabel(visit: Visit): string {
    switch (this.getReceivedBy(visit)) {
      case 'Practitioner':
        return 'Practitioner';

      case 'Company':
        return 'Company';

      default:
        return 'Not received';
    }
  }

  // ============================================================
  // RECEIVED BY CLASS
  // ============================================================

  getReceivedByClass(visit: Visit): string {
    switch (this.getReceivedBy(visit)) {
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
   * Determines whether the company can collect payment.
   *
   * Payment state comes from PatientPackage.
   */
  canCollectPayment(visit: Visit): boolean {
    // ----------------------------------------------------------
    // CANCELLED VISIT
    // ----------------------------------------------------------

    if (this.isVisitCancelled(visit)) {
      return false;
    }

    // ----------------------------------------------------------
    // PATIENT PACKAGE
    // ----------------------------------------------------------

    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      return false;
    }

    // ----------------------------------------------------------
    // FULL ADVANCE
    // ----------------------------------------------------------

    if (this.getPaymentType(visit) === 'FullAdvance') {
      return false;
    }

    // ----------------------------------------------------------
    // ALREADY FULLY RECEIVED
    // ----------------------------------------------------------

    if (this.getCollectionStatus(visit) === 'Received') {
      return false;
    }

    // ----------------------------------------------------------
    // REMAINING BALANCE
    // ----------------------------------------------------------

    if (this.getPendingAmount(visit) <= 0) {
      return false;
    }

    return true;
  }

  // ============================================================
  // COLLECTION ACTION LABEL
  // ============================================================

  getCollectionActionLabel(visit: Visit): string {
    // ----------------------------------------------------------
    // CANCELLED
    // ----------------------------------------------------------

    if (this.isVisitCancelled(visit)) {
      return 'Cancelled';
    }

    // ----------------------------------------------------------
    // FULL ADVANCE
    // ----------------------------------------------------------

    if (this.getPaymentType(visit) === 'FullAdvance') {
      return 'Received by Company';
    }

    // ----------------------------------------------------------
    // FULLY RECEIVED
    // ----------------------------------------------------------

    if (this.getCollectionStatus(visit) === 'Received') {
      return 'Paid';
    }

    // ----------------------------------------------------------
    // NO REMAINING BALANCE
    // ----------------------------------------------------------

    if (this.getPendingAmount(visit) <= 0) {
      return 'Recorded';
    }

    // ----------------------------------------------------------
    // INSTALLMENT / PENDING
    // ----------------------------------------------------------

    return 'Collect';
  }

  // ============================================================
  // COLLECTION ACTION DESCRIPTION
  // ============================================================

  getCollectionActionDescription(visit: Visit): string {
    // ----------------------------------------------------------
    // CANCELLED
    // ----------------------------------------------------------

    if (this.isVisitCancelled(visit)) {
      return 'Payment cannot be collected for a cancelled visit.';
    }

    // ----------------------------------------------------------
    // FULL ADVANCE
    // ----------------------------------------------------------

    if (this.getPaymentType(visit) === 'FullAdvance') {
      return 'This visit belongs to a Full Advance package. The package amount was already received by the company.';
    }

    // ----------------------------------------------------------
    // ALREADY RECEIVED
    // ----------------------------------------------------------

    if (this.getCollectionStatus(visit) === 'Received') {
      return 'Payment has already been fully received.';
    }

    // ----------------------------------------------------------
    // NO REMAINING BALANCE
    // ----------------------------------------------------------

    if (this.getPendingAmount(visit) <= 0) {
      return 'No remaining balance is available for company collection.';
    }

    // ----------------------------------------------------------
    // INSTALLMENT / PENDING
    // ----------------------------------------------------------

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

    if (this.isVisitCancelled(visit)) {
      this.errorMessage = 'Payment cannot be collected for a cancelled visit.';

      return;
    }

    // ----------------------------------------------------------
    // PATIENT PACKAGE
    // ----------------------------------------------------------

    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      this.errorMessage = 'Payment information is unavailable for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // FULL ADVANCE
    // ----------------------------------------------------------

    if (this.getPaymentType(visit) === 'FullAdvance') {
      this.errorMessage =
        'This visit belongs to a Full Advance package. The package amount was already received by the company.';

      return;
    }

    // ----------------------------------------------------------
    // ALREADY RECEIVED
    // ----------------------------------------------------------

    if (this.getCollectionStatus(visit) === 'Received') {
      this.errorMessage = 'Payment has already been fully collected for this visit.';

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

  /**
   * Payment collection endpoint is intentionally not called
   * here yet.
   *
   * The old VisitsService.collectPayment() workflow belonged
   * to the removed visit-level payment architecture.
   *
   * The current backend uses PatientPackage /
   * InstallmentPayment for payment collection.
   *
   * This method will be connected to the correct backend
   * payment endpoint after the payment backend contract is
   * verified.
   */
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

    if (this.isVisitCancelled(visit)) {
      this.errorMessage = 'Payment cannot be collected for a cancelled visit.';

      return;
    }

    // ----------------------------------------------------------
    // PATIENT PACKAGE
    // ----------------------------------------------------------

    const patientPackage = this.getPatientPackage(visit);

    if (!patientPackage) {
      this.errorMessage = 'Payment information is unavailable for this visit.';

      return;
    }

    // ----------------------------------------------------------
    // FULL ADVANCE
    // ----------------------------------------------------------

    if (this.getPaymentType(visit) === 'FullAdvance') {
      this.errorMessage =
        'This visit belongs to a Full Advance package. The package amount was already received by the company.';

      return;
    }

    // ----------------------------------------------------------
    // ALREADY RECEIVED
    // ----------------------------------------------------------

    if (this.getCollectionStatus(visit) === 'Received') {
      this.errorMessage = 'Payment has already been fully collected for this visit.';

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
      this.errorMessage = `Collection amount cannot exceed the remaining balance of ${this.formatAmount(
        pendingAmount,
      )}.`;

      return;
    }

    // ----------------------------------------------------------
    // PAYMENT ENDPOINT
    // ----------------------------------------------------------
    //
    // DO NOT call:
    //
    // this.visitsService.collectPayment(...)
    //
    // because that endpoint belonged to the previous
    // visit-level payment architecture.
    //
    // The correct PatientPackage / InstallmentPayment
    // endpoint will be connected after the backend payment
    // contract is verified.
    //
    // ----------------------------------------------------------

    this.errorMessage =
      'The payment collection endpoint is not connected yet. The payment state has been migrated to the PatientPackage model.';
  }

  // ============================================================
  // VISIT STATUS HELPER
  // ============================================================

  /**
   * Keeps Visit status handling isolated from the
   * package-level payment logic.
   *
   * The Visit model may expose the backend enum as either
   * a string or a numeric value.
   */
  private isVisitCancelled(visit: Visit): boolean {
    const status = visit.status as unknown;

    if (typeof status === 'string') {
      return status.trim().toLowerCase() === 'cancelled';
    }

    if (typeof status === 'number') {
      // Standard VisitStatus enum ordering:
      // Scheduled = 0
      // Accepted  = 1
      // Completed = 2
      // Cancelled = 3

      return status === 3;
    }

    return false;
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
