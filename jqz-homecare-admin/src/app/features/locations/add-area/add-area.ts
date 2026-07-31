import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { City, CityAreaService, CreateAreaRequest } from '../../../core/services/city-area';

@Component({
  selector: 'app-add-area',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-area.html',
  styleUrl: './add-area.css',
})
export class AddArea implements OnInit {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly router = inject(Router);

  // =========================
  // FORM DATA
  // =========================

  areaName = '';

  selectedCityId = '';

  // =========================
  // CITIES
  // =========================

  cities: City[] = [];

  isLoadingCities = true;

  // =========================
  // SUBMISSION
  // =========================

  isSubmitting = false;

  // =========================
  // ERROR
  // =========================

  errorMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.loadCities();
  }

  // =========================
  // LOAD CITIES
  // =========================

  loadCities(): void {
    this.isLoadingCities = true;
    this.errorMessage = '';

    this.cityAreaService.getCities().subscribe({
      next: (response: City[]) => {
        this.cities = Array.isArray(response) ? response : [];

        this.isLoadingCities = false;
      },

      error: (error) => {
        console.error('Unable to load cities:', error);

        this.cities = [];

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load cities. Please try again.';

        this.isLoadingCities = false;
      },
    });
  }

  // =========================
  // SUBMIT
  // =========================

  submit(): void {
    this.areaName = this.areaName.trim();

    this.errorMessage = '';

    // =========================
    // VALIDATION
    // =========================

    if (!this.areaName) {
      this.errorMessage = 'Area name is required.';
      return;
    }

    if (!this.selectedCityId) {
      this.errorMessage = 'Please select a city.';
      return;
    }

    // =========================
    // SUBMITTING
    // =========================

    this.isSubmitting = true;

    const request: CreateAreaRequest = {
      name: this.areaName,
      cityId: this.selectedCityId,
    };

    console.log('Creating area:', request);

    this.cityAreaService.createArea(request).subscribe({
      next: (createdArea) => {
        console.log('Area created successfully:', createdArea);

        this.isSubmitting = false;

        /*
         * Navigate back to Areas list.
         *
         * The Areas List page will call GET /api/areas
         * again and therefore display the newly-created area.
         */
        this.router.navigate(['/areas']);
      },

      error: (error) => {
        console.error('Unable to create area:', error);

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to create area. Please try again.';

        this.isSubmitting = false;
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    this.router.navigate(['/areas']);
  }
}
