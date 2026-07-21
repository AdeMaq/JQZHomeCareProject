import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { VisitsListService } from '../visits-list/visits-list.service';
import { Visit } from '../visits-list/visits-list.interface';

@Component({
  selector: 'app-visit-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visit-details.html',
  styleUrl: './visit-details.css',
})
export class VisitDetails implements OnInit {
  private route = inject(ActivatedRoute);

  private router = inject(Router);

  private visitsListService = inject(VisitsListService);

  private platformId = inject(PLATFORM_ID);

  visit: Visit | null = null;

  isLoading = false;

  errorMessage = '';

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

  loadVisit(id: string): void {
    this.isLoading = true;

    this.visitsListService.getVisitById(id).subscribe({
      next: (response) => {
        this.visit = response;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading visit details:', error);

        this.errorMessage = 'Unable to load visit details.';

        this.isLoading = false;
      },
    });
  }

  onBack(): void {
    this.router.navigate(['/visits']);
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Scheduled';

      case 1:
        return 'Completed';

      case 2:
        return 'Cancelled';

      case 3:
        return 'Pending';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-scheduled';

      case 1:
        return 'status-completed';

      case 2:
        return 'status-cancelled';

      case 3:
        return 'status-pending';

      default:
        return 'status-default';
    }
  }
}
