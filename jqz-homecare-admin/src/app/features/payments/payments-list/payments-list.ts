import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize, Subscription } from 'rxjs';

import { PractitionerSettlement, WeeklySettlement } from '../payments.interface';

import { PaymentsService } from '../payments.service';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './payments-list.html',
  styleUrl: './payments-list.css',
})
export class PaymentsList implements OnInit, OnDestroy {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly paymentsService = inject(PaymentsService);

  private readonly practitionerService = inject(PractitionerService);

  /**
   * Explicitly triggers Angular change detection after
   * asynchronous API operations.
   */
  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // SUBSCRIPTIONS
  // ============================================================

  private pendingSettlementsSubscription: Subscription | null = null;

  // ============================================================
  // DATA
  // ============================================================

  practitioners: Practitioner[] = [];

  weeklySettlement: WeeklySettlement | null = null;

  pendingSettlements: PractitionerSettlement[] = [];

  // ============================================================
  // FILTER VALUES
  // ============================================================

  selectedPractitionerId = '';

  selectedWeekStart = '';

  // ============================================================
  // LOADING STATES
  // ============================================================

  isLoadingSummary = false;

  isLoadingPending = false;

  isGeneratingSettlement = false;

  processingSettlementId: string | null = null;

  // ============================================================
  // MESSAGES
  // ============================================================

  successMessage = '';

  errorMessage = '';

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.setCurrentWeekStart();

    this.loadPractitioners();

    this.loadPendingSettlements();
  }

  ngOnDestroy(): void {
    this.cancelPendingSettlementsRequest();
  }

  // ============================================================
  // SET CURRENT WEEK START
  // ============================================================

  private setCurrentWeekStart(): void {
    const today = new Date();

    const day = today.getDay();

    // Convert Sunday from 0 to 7.
    const adjustedDay = day === 0 ? 7 : day;

    // Monday as the start of the week.
    today.setDate(today.getDate() - adjustedDay + 1);

    this.selectedWeekStart = this.formatDate(today);
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  private formatDate(date: Date): string {
    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============================================================
  // LOAD PRACTITIONERS
  // ============================================================

  loadPractitioners(): void {
    this.practitionerService.getPractitioners().subscribe({
      next: (response: Practitioner[]) => {
        this.practitioners = response ?? [];

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        console.error('Error loading practitioners:', error);

        this.errorMessage = 'Failed to load practitioners. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // HANDLE FILTER CHANGE
  // ============================================================

  onSelectionChange(): void {
    this.weeklySettlement = null;

    this.clearMessages();

    this.cdr.detectChanges();
  }

  // ============================================================
  // LOAD WEEKLY SUMMARY
  // ============================================================

  loadWeeklySummary(): void {
    if (!this.selectedPractitionerId || !this.selectedWeekStart) {
      this.errorMessage = 'Please select both a practitioner and a week start date.';

      this.cdr.detectChanges();

      return;
    }

    this.clearMessages();

    this.isLoadingSummary = true;

    this.weeklySettlement = null;

    this.cdr.detectChanges();

    this.paymentsService
      .getWeeklySummary(this.selectedPractitionerId, this.selectedWeekStart)
      .pipe(
        finalize(() => {
          this.isLoadingSummary = false;

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: WeeklySettlement) => {
          this.weeklySettlement = response;

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error('Error loading weekly settlement:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to load the weekly settlement summary. Please try again.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // GENERATE SETTLEMENT
  // ============================================================

  generateSettlement(): void {
    if (!this.weeklySettlement) {
      return;
    }

    if (this.weeklySettlement.visitCount === 0) {
      this.errorMessage = 'There are no completed visits available for settlement.';

      this.cdr.detectChanges();

      return;
    }

    this.clearMessages();

    this.isGeneratingSettlement = true;

    this.cdr.detectChanges();

    this.paymentsService
      .generateSettlement({
        practitionerId: this.weeklySettlement.practitionerId,
        weekStart: this.weeklySettlement.weekStart,
      })
      .pipe(
        finalize(() => {
          this.isGeneratingSettlement = false;

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: PractitionerSettlement) => {
          this.successMessage = 'Weekly settlement generated successfully.';

          if (this.weeklySettlement) {
            this.weeklySettlement = {
              ...this.weeklySettlement,
              settlementId: response.id,
              status: response.status,
              receivedDate: response.receivedDate,
            };
          }

          this.cdr.detectChanges();

          // Refresh pending settlements after generation.
          this.loadPendingSettlements();
        },

        error: (error: unknown) => {
          console.error('Error generating settlement:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to generate the weekly settlement.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // LOAD PENDING SETTLEMENTS
  // ============================================================

  loadPendingSettlements(): void {
    // Cancel any existing pending request before starting
    // a new request.
    this.cancelPendingSettlementsRequest();

    this.clearMessages();

    // Set the loading state before making the API request.
    this.isLoadingPending = true;

    // Immediately update the loading state in the view.
    this.cdr.detectChanges();

    this.pendingSettlementsSubscription = this.paymentsService
      .getPendingSettlements()
      .pipe(
        finalize(() => {
          this.isLoadingPending = false;

          this.pendingSettlementsSubscription = null;

          // Ensure Angular reevaluates:
          //
          // @if (isLoadingPending)
          // @else if (pendingSettlements.length > 0)
          // @else
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response: PractitionerSettlement[]) => {
          this.pendingSettlements = response ?? [];

          // Update the template after receiving the API response.
          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error('Error loading pending settlements:', error);

          this.pendingSettlements = [];

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to load pending settlements. Please try again.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // CANCEL PENDING SETTLEMENTS REQUEST
  // ============================================================

  private cancelPendingSettlementsRequest(): void {
    if (this.pendingSettlementsSubscription) {
      this.pendingSettlementsSubscription.unsubscribe();

      this.pendingSettlementsSubscription = null;
    }

    this.isLoadingPending = false;
  }

  // ============================================================
  // MARK SETTLEMENT AS RECEIVED
  // ============================================================

  markSettlementReceived(id: string): void {
    this.clearMessages();

    this.processingSettlementId = id;

    this.cdr.detectChanges();

    this.paymentsService
      .markSettlementReceived(id)
      .pipe(
        finalize(() => {
          this.processingSettlementId = null;

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Settlement marked as received successfully.';

          // Remove the settlement from the pending list.
          this.pendingSettlements = this.pendingSettlements.filter(
            (settlement) => settlement.id !== id,
          );

          // Update the currently displayed weekly settlement,
          // if it is the same settlement.
          if (this.weeklySettlement && this.weeklySettlement.settlementId === id) {
            this.weeklySettlement = {
              ...this.weeklySettlement,
              status: 'Received',
              receivedDate: new Date().toISOString(),
            };
          }

          this.cdr.detectChanges();
        },

        error: (error: unknown) => {
          console.error('Error marking settlement as received:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to mark the settlement as received.',
          );

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // CLEAR MESSAGES
  // ============================================================

  private clearMessages(): void {
    this.successMessage = '';

    this.errorMessage = '';
  }

  // ============================================================
  // GET BACKEND ERROR MESSAGE
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

    return fallbackMessage;
  }
}
