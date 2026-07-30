import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { Area, CityAreaService } from '../../../core/services/city-area';

@Component({
  selector: 'app-areas-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './areas-list.html',
  styleUrl: './areas-list.css',
})
export class AreasList implements OnInit {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly router = inject(Router);

  areas: Area[] = [];

  /*
   * The page starts in loading state because
   * the API request has not completed yet.
   */
  isLoading = true;

  errorMessage = '';

  ngOnInit(): void {
    this.loadAreas();
  }

  // =========================
  // LOAD AREAS
  // =========================

  loadAreas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.cityAreaService.getAreas().subscribe({
      next: (response: Area[]) => {
        this.areas = Array.isArray(response) ? response : [];

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Unable to load areas:', error);

        this.areas = [];

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load areas. Please try again.';

        this.isLoading = false;
      },
    });
  }

  // =========================
  // ADD AREA
  // =========================

  addArea(): void {
    this.router.navigate(['/areas/add']);
  }

  // =========================
  // EDIT AREA
  // =========================

  editArea(id: string): void {
    this.router.navigate(['/areas', id, 'edit']);
  }

  // =========================
  // DELETE AREA
  // =========================

  deleteArea(id: string): void {
    const area = this.areas.find((x) => x.id === id);

    if (!area) {
      console.error('Area not found:', id);
      return;
    }

    const confirmed = confirm(`Are you sure you want to delete ${area.name}?`);

    if (!confirmed) {
      return;
    }

    this.cityAreaService.deleteArea(id).subscribe({
      next: () => {
        /*
         * Remove the deleted area locally.
         *
         * We intentionally do not call loadAreas()
         * because there is no reason to reload the entire
         * page/table after a successful delete.
         */
        this.areas = this.areas.filter((currentArea) => currentArea.id !== id);
      },

      error: (error) => {
        console.error('Unable to delete area:', error);

        const message =
          error?.error?.message ?? error?.message ?? 'Unable to delete area. Please try again.';

        alert(message);
      },
    });
  }
}
