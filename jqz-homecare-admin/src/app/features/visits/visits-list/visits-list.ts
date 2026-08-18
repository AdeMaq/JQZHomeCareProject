import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CollectionStatus, Visit, VisitStatus } from '../visits.interface';
import { VisitsService } from '../visits.service';

@Component({
  selector: 'app-visits-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visits-list.html',
  styleUrl: './visits-list.css',
})
export class VisitsList implements OnInit {
  private readonly visitsService = inject(VisitsService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DATA
  // ============================================================

  visits: Visit[] = [];

  // ============================================================
  // UI STATE
  // ============================================================

  isLoading = false;
  errorMessage = '';

  // ============================================================
  // FILTERS
  // ============================================================

  searchTerm = '';

  selectedStatus: VisitStatus | 'All' = 'All';

  selectedCollectionStatus: CollectionStatus | 'All' = 'All';

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadVisits();
  }

  // ============================================================
  // LOAD VISITS
  // ============================================================

  loadVisits(): void {
    console.log('=================================');
    console.log('VISITS LIST: LOAD STARTED');
    console.log('=================================');

    this.isLoading = true;
    this.errorMessage = '';

    this.visitsService.getAll().subscribe({
      // ----------------------------------------------------------
      // API SUCCESS
      // ----------------------------------------------------------

      next: (visits) => {
        console.log('=================================');
        console.log('VISITS LIST: API SUCCESS');
        console.log('VISITS RESPONSE:', visits);
        console.log('IS ARRAY:', Array.isArray(visits));
        console.log('VISIT COUNT:', visits?.length);
        console.log('=================================');

        // Update component state
        this.visits = visits ?? [];
        this.isLoading = false;

        console.log('IS LOADING AFTER SUCCESS:', this.isLoading);

        // --------------------------------------------------------
        // IMPORTANT
        // --------------------------------------------------------
        // Explicitly tell Angular to refresh the view after the
        // asynchronous API response.
        // This prevents the UI from remaining stuck on
        // "Loading visits..." even though isLoading is false.
        // --------------------------------------------------------

        this.cdr.detectChanges();

        console.log('VISITS LIST: VIEW UPDATED');
      },

      // ----------------------------------------------------------
      // API ERROR
      // ----------------------------------------------------------

      error: (error) => {
        console.error('=================================');
        console.error('VISITS LIST: API ERROR');
        console.error('ERROR:', error);
        console.error('ERROR STATUS:', error?.status);
        console.error('ERROR MESSAGE:', error?.message);
        console.error('ERROR BODY:', error?.error);
        console.error('=================================');

        this.errorMessage = error?.error?.message || 'Unable to load visits. Please try again.';

        this.isLoading = false;

        console.log('IS LOADING AFTER ERROR:', this.isLoading);

        // Make sure the error state is rendered immediately.
        this.cdr.detectChanges();

        console.log('VISITS LIST: ERROR VIEW UPDATED');
      },

      // ----------------------------------------------------------
      // OBSERVABLE COMPLETED
      // ----------------------------------------------------------

      complete: () => {
        console.log('VISITS LIST: OBSERVABLE COMPLETED');
      },
    });
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
    this.loadVisits();
  }

  // ============================================================
  // FILTERED VISITS
  // ============================================================

  get filteredVisits(): Visit[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.visits.filter((visit) => {
      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      const matchesSearch =
        !search ||
        visit.patientName?.toLowerCase().includes(search) ||
        visit.practitionerName?.toLowerCase().includes(search) ||
        visit.serviceName?.toLowerCase().includes(search) ||
        visit.areaName?.toLowerCase().includes(search) ||
        visit.packageName?.toLowerCase().includes(search);

      // --------------------------------------------------------
      // STATUS
      // --------------------------------------------------------

      const matchesStatus = this.selectedStatus === 'All' || visit.status === this.selectedStatus;

      // --------------------------------------------------------
      // COLLECTION STATUS
      // --------------------------------------------------------

      const matchesCollectionStatus =
        this.selectedCollectionStatus === 'All' ||
        visit.collectionStatus === this.selectedCollectionStatus;

      return matchesSearch && matchesStatus && matchesCollectionStatus;
    });
  }

  // ============================================================
  // CLEAR SEARCH
  // ============================================================

  clearSearch(): void {
    this.searchTerm = '';
  }

  // ============================================================
  // CLEAR ALL FILTERS
  // ============================================================

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'All';
    this.selectedCollectionStatus = 'All';
  }

  // ============================================================
  // VIEW VISIT
  // ============================================================

  viewVisit(id: string): void {
    this.router.navigate(['/visits', id]);
  }

  // ============================================================
  // ADD VISIT
  // ============================================================

  addVisit(): void {
    this.router.navigate(['/visits/add']);
  }

  // ============================================================
  // STATUS CLASS
  // ============================================================

  getStatusClass(status: VisitStatus): string {
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
        return '';
    }
  }

  // ============================================================
  // COLLECTION STATUS CLASS
  // ============================================================

  getCollectionStatusClass(status: CollectionStatus): string {
    switch (status) {
      case 'Received':
        return 'collection-received';

      case 'Pending':
        return 'collection-pending';

      default:
        return '';
    }
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '-';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ============================================================
  // TIME FORMAT
  // ============================================================

  formatTime(time: string | null | undefined): string {
    if (!time) {
      return '-';
    }

    /*
     * Backend TimeSpan values commonly arrive as:
     *
     * 09:00:00
     * 14:30:00
     *
     * We only display HH:mm.
     */

    const parts = time.split(':');

    if (parts.length < 2) {
      return time;
    }

    return `${parts[0]}:${parts[1]}`;
  }

  // ============================================================
  // VISIT SLOT
  // ============================================================

  formatSlot(visit: Visit): string {
    const start = this.formatTime(visit.slotStart);
    const end = this.formatTime(visit.slotEnd);

    if (start === '-' && end === '-') {
      return '-';
    }

    if (start === '-') {
      return end;
    }

    if (end === '-') {
      return start;
    }

    return `${start} - ${end}`;
  }

  // ============================================================
  // AMOUNT FORMAT
  // ============================================================

  formatAmount(amount: number | null | undefined): string {
    const value = Number(amount ?? 0);

    return value.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  }

  // ============================================================
  // PENDING AMOUNT
  // ============================================================

  getPendingAmount(visit: Visit): number {
    const due = Number(visit.amountDue ?? 0);
    const received = Number(visit.amountReceived ?? 0);

    return Math.max(due - received, 0);
  }
}
