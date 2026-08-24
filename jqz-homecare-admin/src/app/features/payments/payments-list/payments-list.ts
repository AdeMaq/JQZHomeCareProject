import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PractitionerSettlement, WeeklySettlement } from '../payments.interface';

import { PaymentsService } from '../payments.service';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './payments-list.html',
  styleUrl: './payments-list.css',
})
export class PaymentsList implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly paymentsService = inject(PaymentsService);

  private readonly practitionerService = inject(PractitionerService);

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

  // ============================================================
  // SET CURRENT WEEK START
  // ============================================================

  private setCurrentWeekStart(): void {
    const today = new Date();

    const day = today.getDay();

    // Convert Sunday from 0 to 7
    const adjustedDay = day === 0 ? 7 : day;

    // Monday as week start
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
        this.practitioners = response;
      },

      error: (error: unknown) => {
        console.error('Error loading practitioners:', error);

        this.errorMessage = 'Failed to load practitioners. Please try again.';
      },
    });
  }

  // ============================================================
  // HANDLE FILTER CHANGE
  // ============================================================

  onSelectionChange(): void {
    this.weeklySettlement = null;

    this.clearMessages();
  }

  // ============================================================
  // LOAD WEEKLY SUMMARY
  // ============================================================

  loadWeeklySummary(): void {
    if (!this.selectedPractitionerId || !this.selectedWeekStart) {
      this.errorMessage = 'Please select both a practitioner and a week start date.';

      return;
    }

    this.clearMessages();

    this.isLoadingSummary = true;

    this.weeklySettlement = null;

    this.paymentsService
      .getWeeklySummary(this.selectedPractitionerId, this.selectedWeekStart)
      .subscribe({
        next: (response: WeeklySettlement) => {
          this.weeklySettlement = response;

          this.isLoadingSummary = false;
        },

        error: (error: unknown) => {
          console.error('Error loading weekly settlement:', error);

          this.errorMessage = 'Failed to load the weekly settlement summary. Please try again.';

          this.isLoadingSummary = false;
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

      return;
    }

    this.clearMessages();

    this.isGeneratingSettlement = true;

    this.paymentsService
      .generateSettlement({
        practitionerId: this.weeklySettlement.practitionerId,
        weekStart: this.weeklySettlement.weekStart,
      })
      .subscribe({
        next: (response: PractitionerSettlement) => {
          this.successMessage = 'Weekly settlement generated successfully.';

          this.isGeneratingSettlement = false;

          // Update the currently displayed weekly settlement
          if (this.weeklySettlement) {
            this.weeklySettlement = {
              ...this.weeklySettlement,
              settlementId: response.id,
              status: response.status,
              receivedDate: response.receivedDate,
            };
          }

          // Refresh pending settlements
          this.loadPendingSettlements();
        },

        error: (error: unknown) => {
          console.error('Error generating settlement:', error);

          this.errorMessage = this.getErrorMessage(
            error,
            'Failed to generate the weekly settlement.',
          );

          this.isGeneratingSettlement = false;
        },
      });
  }

  // ============================================================
  // LOAD PENDING SETTLEMENTS
  // ============================================================

  loadPendingSettlements(): void {
    this.isLoadingPending = true;

    this.paymentsService.getPendingSettlements().subscribe({
      next: (response: PractitionerSettlement[]) => {
        this.pendingSettlements = response;

        this.isLoadingPending = false;
      },

      error: (error: unknown) => {
        console.error('Error loading pending settlements:', error);

        this.errorMessage = 'Failed to load pending settlements. Please try again.';

        this.isLoadingPending = false;
      },
    });
  }

  // ============================================================
  // MARK SETTLEMENT AS RECEIVED
  // ============================================================

  markSettlementReceived(id: string): void {
    this.clearMessages();

    this.processingSettlementId = id;

    this.paymentsService.markSettlementReceived(id).subscribe({
      next: () => {
        this.successMessage = 'Settlement marked as received successfully.';

        this.processingSettlementId = null;

        // Remove the settlement from pending list
        this.pendingSettlements = this.pendingSettlements.filter(
          (settlement) => settlement.id !== id,
        );

        // If currently viewing this settlement,
        // update its status as well.
        if (this.weeklySettlement && this.weeklySettlement.settlementId === id) {
          this.weeklySettlement = {
            ...this.weeklySettlement,
            status: 'Received',
            receivedDate: new Date().toISOString(),
          };
        }
      },

      error: (error: unknown) => {
        console.error('Error marking settlement as received:', error);

        this.errorMessage = this.getErrorMessage(
          error,
          'Failed to mark the settlement as received.',
        );

        this.processingSettlementId = null;
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
