import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VisitsListService } from '../visits-list/visits-list.service';
import { Visit } from '../visits-list/visits-list.interface';
import { VisitStatus } from '../../../shared/enums/visit-status';

@Component({
  selector: 'app-visit-details',

  standalone: true,

  imports: [CommonModule],

  templateUrl: './visit-details.html',

  styleUrl: './visit-details.css',
})
export class VisitDetails implements OnInit {
  // =========================
  // DEPENDENCIES
  // =========================

  private route = inject(ActivatedRoute);

  private router = inject(Router);

  private visitsListService = inject(VisitsListService);

  private platformId = inject(PLATFORM_ID);

  private changeDetectorRef = inject(ChangeDetectorRef);

  // =========================
  // VISIT DATA
  // =========================

  visit: Visit | null = null;

  // =========================
  // UI STATE
  // =========================

  isLoading = false;

  errorMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const visitId = this.route.snapshot.paramMap.get('id');

    if (!visitId) {
      this.errorMessage = 'Visit ID was not found.';

      return;
    }

    this.loadVisit(visitId);
  }

  onEdit(): void {
    if (!this.visit) {
      return;
    }

    this.router.navigate(['/visits', this.visit.id, 'edit']);
  }

  // =========================
  // LOAD VISIT
  // =========================

  loadVisit(id: string): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.visit = null;

    this.visitsListService.getVisitById(id).subscribe({
      next: (response: Visit) => {
        console.log('Visit details received:', response);

        this.visit = response;

        this.isLoading = false;

        // Explicitly notify Angular that the UI state changed
        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error('Error loading visit details:', error);

        this.visit = null;

        this.isLoading = false;

        this.errorMessage = 'Unable to load visit details.';

        // Explicitly update the UI after error
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // =========================
  // NAVIGATION
  // =========================

  onBack(): void {
    this.router.navigate(['/visits']);
  }

  // =========================
  // STATUS
  // =========================

  getStatusText(status: VisitStatus): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'Scheduled';

      case VisitStatus.Accepted:
        return 'Accepted';

      case VisitStatus.Completed:
        return 'Completed';

      case VisitStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: VisitStatus): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'status-scheduled';

      case VisitStatus.Accepted:
        return 'status-accepted';

      case VisitStatus.Completed:
        return 'status-completed';

      case VisitStatus.Cancelled:
        return 'status-cancelled';

      default:
        return 'status-default';
    }
  }

  // =========================
  // DATE FORMATTING
  // =========================

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // =========================
  // CURRENCY FORMATTING
  // =========================

  formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
      return 'Rs. 0';
    }

    return `Rs. ${amount.toLocaleString('en-PK')}`;
  }
}
