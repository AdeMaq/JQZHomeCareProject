import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CollectionStatus, Visit, VisitStatus } from '../visits.interface';
import { VisitsService } from '../visits.service';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-visits-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visits-list.html',
  styleUrl: './visits-list.css',
})
export class VisitsList implements OnInit {
  private readonly visitsService = inject(VisitsService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DATA
  // ============================================================

  visits: Visit[] = [];

  practitioners: Practitioner[] = [];

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
  // LOAD VISITS + PRACTITIONERS
  // ============================================================

  loadVisits(): void {
    console.log('=================================');
    console.log('VISITS LIST: LOAD STARTED');
    console.log('=================================');

    this.isLoading = true;
    this.errorMessage = '';

    /*
     * We load both APIs together:
     *
     * 1. GET /api/visits
     * 2. GET /api/practitioners
     *
     * The Visits API currently returns practitionerId
     * but practitionerName is null.
     *
     * Therefore we use the Practitioner API to resolve
     * the practitioner name on the frontend.
     */

    forkJoin({
      visits: this.visitsService.getAll(),

      practitioners: this.practitionerService.getPractitioners(),
    }).subscribe({
      // ==========================================================
      // SUCCESS
      // ==========================================================

      next: ({ visits, practitioners }) => {
        console.log('=================================');
        console.log('VISITS LIST: BOTH APIs SUCCESS');
        console.log('=================================');

        console.log('VISITS RESPONSE:', visits);

        console.log('PRACTITIONERS RESPONSE:', practitioners);

        console.log('VISIT COUNT:', visits?.length);

        console.log('PRACTITIONER COUNT:', practitioners?.length);

        // --------------------------------------------------------
        // Store practitioners
        // --------------------------------------------------------

        this.practitioners = Array.isArray(practitioners) ? practitioners : [];

        // --------------------------------------------------------
        // Resolve practitioner names
        // --------------------------------------------------------

        this.visits = this.resolvePractitionerNames(
          Array.isArray(visits) ? visits : [],
          this.practitioners,
        );

        console.log('=================================');
        console.log('VISITS AFTER PRACTITIONER MAPPING');
        console.log('=================================');

        console.log('MAPPED VISITS:', this.visits);

        // --------------------------------------------------------
        // Finish loading
        // --------------------------------------------------------

        this.isLoading = false;

        console.log('IS LOADING AFTER SUCCESS:', this.isLoading);

        // --------------------------------------------------------
        // Refresh Angular view
        // --------------------------------------------------------

        this.cdr.detectChanges();

        console.log('VISITS LIST: VIEW UPDATED');
      },

      // ==========================================================
      // ERROR
      // ==========================================================

      error: (error) => {
        console.error('=================================');

        console.error('VISITS LIST: API ERROR');

        console.error('ERROR:', error);

        console.error('ERROR STATUS:', error?.status);

        console.error('ERROR MESSAGE:', error?.message);

        console.error('ERROR BODY:', error?.error);

        console.error('=================================');

        this.errorMessage =
          error?.error?.message || error?.message || 'Unable to load visits. Please try again.';

        this.visits = [];

        this.practitioners = [];

        this.isLoading = false;

        console.log('IS LOADING AFTER ERROR:', this.isLoading);

        this.cdr.detectChanges();

        console.log('VISITS LIST: ERROR VIEW UPDATED');
      },

      // ==========================================================
      // COMPLETE
      // ==========================================================

      complete: () => {
        console.log('VISITS LIST: OBSERVABLE COMPLETED');
      },
    });
  }

  // ============================================================
  // RESOLVE PRACTITIONER NAMES
  // ============================================================

  private resolvePractitionerNames(visits: Visit[], practitioners: Practitioner[]): Visit[] {
    /*
     * Create a quick lookup map:
     *
     * practitionerId -> practitionerName
     *
     * Example:
     *
     * "652e1080-..." -> "Dr. Ahmed"
     * "25d973f5-..." -> "Dr. Ali"
     */

    const practitionerMap = new Map<string, string>();

    practitioners.forEach((practitioner) => {
      if (practitioner.id && practitioner.name) {
        practitionerMap.set(practitioner.id.toLowerCase(), practitioner.name);
      }
    });

    console.log('=================================');
    console.log('PRACTITIONER LOOKUP MAP');
    console.log('=================================');

    console.log(practitionerMap);

    /*
     * Now process every visit.
     */

    return visits.map((visit) => {
      // ----------------------------------------------------------
      // No practitioner assigned
      // ----------------------------------------------------------

      if (!visit.practitionerId) {
        return {
          ...visit,
          practitionerName: null,
        };
      }

      // ----------------------------------------------------------
      // Find practitioner by ID
      // ----------------------------------------------------------

      const practitionerName = practitionerMap.get(visit.practitionerId.toLowerCase());

      console.log(
        'VISIT:',
        visit.id,
        '| PRACTITIONER ID:',
        visit.practitionerId,
        '| PRACTITIONER NAME:',
        practitionerName,
      );

      // ----------------------------------------------------------
      // Return updated visit
      // ----------------------------------------------------------

      return {
        ...visit,

        /*
         * If the practitioner exists, use the name from
         * the Practitioner API.
         *
         * Otherwise keep the visit as unassigned.
         */
        practitionerName: practitionerName ?? null,
      };
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
