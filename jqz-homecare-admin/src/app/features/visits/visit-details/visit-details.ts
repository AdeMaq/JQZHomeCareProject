import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';

import { Visit } from '../visits.interface';
import { VisitsService } from '../visits.service';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-visit-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css',
})
export class VisitDetails implements OnInit {
  private readonly visitsService = inject(VisitsService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DATA
  // ============================================================

  visit: Visit | null = null;

  // ============================================================
  // UI STATE
  // ============================================================

  isLoading = false;

  errorMessage = '';

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadVisit();
  }

  // ============================================================
  // LOAD VISIT + PRACTITIONERS
  // ============================================================

  loadVisit(): void {
    console.log('=================================');
    console.log('VISIT DETAILS: LOAD STARTED');
    console.log('=================================');

    this.isLoading = true;

    this.errorMessage = '';

    this.visit = null;

    const visitId = this.route.snapshot.paramMap.get('id');

    console.log('VISIT ID:', visitId);

    if (!visitId) {
      this.errorMessage = 'Visit ID is missing or invalid.';

      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }

    forkJoin({
      visit: this.visitsService.getById(visitId),

      practitioners: this.practitionerService.getPractitioners().pipe(
        catchError((error) => {
          console.error('Unable to load practitioners for visit details:', error);

          return of([]);
        }),
      ),
    }).subscribe({
      // ==========================================================
      // SUCCESS
      // ==========================================================

      next: ({ visit, practitioners }) => {
        console.log('=================================');
        console.log('VISIT DETAILS: API REQUESTS SUCCESS');
        console.log('=================================');

        console.log('VISIT RESPONSE:', visit);

        console.log('PRACTITIONERS RESPONSE:', practitioners);

        const practitionerList = Array.isArray(practitioners) ? practitioners : [];

        this.visit = this.resolvePractitionerName(visit, practitionerList);

        console.log('=================================');
        console.log('VISIT AFTER PRACTITIONER MAPPING');
        console.log('=================================');

        console.log('MAPPED VISIT:', this.visit);

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('VISIT DETAILS: VIEW UPDATED');
      },

      // ==========================================================
      // ERROR
      // ==========================================================

      error: (error) => {
        console.error('=================================');
        console.error('VISIT DETAILS: API ERROR');
        console.error('ERROR:', error);
        console.error('ERROR STATUS:', error?.status);
        console.error('ERROR MESSAGE:', error?.message);
        console.error('ERROR BODY:', error?.error);
        console.error('=================================');

        if (error?.status === 404) {
          this.errorMessage = 'The requested visit could not be found.';
        } else {
          this.errorMessage =
            error?.error?.message ||
            error?.message ||
            'Unable to load visit details. Please try again.';
        }

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      // ==========================================================
      // COMPLETE
      // ==========================================================

      complete: () => {
        console.log('VISIT DETAILS: OBSERVABLE COMPLETED');
      },
    });
  }

  // ============================================================
  // RESOLVE PRACTITIONER NAME
  // ============================================================

  private resolvePractitionerName(visit: Visit, practitioners: Practitioner[]): Visit {
    if (!visit.practitionerId) {
      return {
        ...visit,
        practitionerName: visit.practitionerName ?? null,
      };
    }

    const practitioner = practitioners.find(
      (item) => item.id?.toLowerCase() === visit.practitionerId?.toLowerCase(),
    );

    console.log('=================================');
    console.log('PRACTITIONER RESOLUTION');
    console.log('=================================');

    console.log('VISIT ID:', visit.id);

    console.log('PRACTITIONER ID:', visit.practitionerId);

    console.log('RESOLVED PRACTITIONER NAME:', practitioner?.name);

    return {
      ...visit,
      practitionerName: practitioner?.name ?? visit.practitionerName ?? null,
    };
  }

  // ============================================================
  // BACK TO VISITS
  // ============================================================

  backToVisits(): void {
    this.router.navigate(['/visits']);
  }

  // ============================================================
  // EDIT VISIT
  // ============================================================

  editVisit(): void {
    if (!this.visit?.id) {
      return;
    }

    this.router.navigate(['/visits', this.visit.id, 'edit']);
  }

  // ============================================================
  // RETRY
  // ============================================================

  retry(): void {
    this.loadVisit();
  }

  // ============================================================
  // STATUS CLASS
  // ============================================================

  getStatusClass(status: Visit['status']): string {
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
  // STATUS ICON
  // ============================================================

  getStatusIcon(status: Visit['status']): string {
    switch (status) {
      case 'Scheduled':
        return 'fa-regular fa-calendar';

      case 'Accepted':
        return 'fa-solid fa-check';

      case 'Completed':
        return 'fa-solid fa-circle-check';

      case 'Cancelled':
        return 'fa-solid fa-xmark';

      default:
        return 'fa-solid fa-circle-info';
    }
  }

  // ============================================================
  // COLLECTION STATUS CLASS
  // ============================================================

  getCollectionStatusClass(status: Visit['collectionStatus']): string {
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
  // COLLECTION ICON
  // ============================================================

  getCollectionIcon(status: Visit['collectionStatus']): string {
    switch (status) {
      case 'Received':
        return 'fa-solid fa-circle-check';

      case 'Pending':
        return 'fa-solid fa-clock';

      default:
        return 'fa-solid fa-circle-info';
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

  getPendingAmount(): number {
    if (!this.visit) {
      return 0;
    }

    const due = Number(this.visit.amountDue ?? 0);

    const received = Number(this.visit.amountReceived ?? 0);

    return Math.max(due - received, 0);
  }

  // ============================================================
  // RECEIVED BY LABEL
  // ============================================================

  getReceivedByLabel(): string {
    if (!this.visit?.receivedBy) {
      return '-';
    }

    return this.visit.receivedBy;
  }
}
