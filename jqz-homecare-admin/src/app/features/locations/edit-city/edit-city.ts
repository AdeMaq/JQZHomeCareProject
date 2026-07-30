import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CityAreaService, UpdateCityRequest } from '../../../core/services/city-area';

@Component({
  selector: 'app-edit-city',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-city.html',
  styleUrl: './edit-city.css',
})
export class EditCity implements OnInit {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  cityId = '';
  cityName = '';

  isLoading = true;
  isSubmitting = false;

  errorMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    console.log('=================================');
    console.log('=== EDIT CITY INITIALIZED ===');

    this.cityId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('CITY ID FROM ROUTE:', this.cityId);

    if (!this.cityId) {
      console.error('CITY ID IS MISSING');

      this.errorMessage = 'City ID is missing.';
      this.isLoading = false;

      return;
    }

    /*
     * FIRST:
     * Try to get the city from the cache.
     *
     * This is instant when the user comes from
     * the Cities list page.
     */
    const cachedCity = this.cityAreaService.getCachedCityById(this.cityId);

    if (cachedCity) {
      console.log('=================================');
      console.log('=== CITY FOUND IN CACHE ===');
      console.log('CACHED CITY:', cachedCity);

      this.cityName = cachedCity.name;

      this.isLoading = false;

      console.log('CITY NAME:', this.cityName);
      console.log('IS LOADING:', this.isLoading);
      console.log('=================================');

      return;
    }

    /*
     * SECOND:
     * If the city isn't cached, load it from the API.
     *
     * This handles direct URL access and browser refresh.
     */
    console.log('CITY NOT FOUND IN CACHE');
    console.log('FALLING BACK TO API');

    this.loadCity();
  }

  // =========================
  // LOAD CITY FROM API
  // =========================

  loadCity(): void {
    console.log('=================================');
    console.log('=== LOADING CITY FROM API ===');
    console.log('CITY ID:', this.cityId);

    this.isLoading = true;
    this.errorMessage = '';

    this.cityAreaService.getCityById(this.cityId).subscribe({
      next: (city) => {
        console.log('=================================');
        console.log('=== CITY RECEIVED FROM API ===');
        console.log('CITY RESPONSE:', city);

        this.cityName = city.name;

        console.log('CITY NAME SET TO:', this.cityName);

        this.isLoading = false;

        console.log('IS LOADING:', this.isLoading);
        console.log('=================================');
      },

      error: (error) => {
        console.error('=================================');
        console.error('=== FAILED TO LOAD CITY ===');
        console.error('ERROR:', error);
        console.error('ERROR STATUS:', error?.status);
        console.error('ERROR MESSAGE:', error?.message);
        console.error('SERVER ERROR:', error?.error);

        this.errorMessage = error?.error?.message ?? 'Unable to load city. Please try again.';

        this.isLoading = false;

        console.log('IS LOADING AFTER ERROR:', this.isLoading);
        console.log('=================================');
      },

      complete: () => {
        console.log('=== CITY REQUEST COMPLETED ===');
      },
    });
  }

  // =========================
  // SUBMIT / UPDATE CITY
  // =========================

  submit(): void {
    console.log('=================================');
    console.log('=== UPDATING CITY ===');

    this.cityName = this.cityName.trim();

    console.log('CITY ID:', this.cityId);
    console.log('CITY NAME:', this.cityName);

    if (!this.cityName) {
      this.errorMessage = 'City name is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: UpdateCityRequest = {
      name: this.cityName,
    };

    console.log('UPDATE REQUEST:', request);

    this.cityAreaService.updateCity(this.cityId, request).subscribe({
      next: () => {
        console.log('=== CITY UPDATED SUCCESSFULLY ===');

        this.isSubmitting = false;

        /*
         * Clear cache because the city name has changed.
         * When /cities loads again, it will fetch the latest
         * data from the backend.
         */
        this.cityAreaService.clearCitiesCache();

        this.router.navigate(['/cities']);
      },

      error: (error) => {
        console.error('=================================');
        console.error('=== FAILED TO UPDATE CITY ===');
        console.error('ERROR:', error);
        console.error('ERROR STATUS:', error?.status);
        console.error('SERVER ERROR:', error?.error);

        this.errorMessage = error?.error?.message ?? 'Unable to update city. Please try again.';

        this.isSubmitting = false;
      },

      complete: () => {
        console.log('=== UPDATE REQUEST COMPLETED ===');
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    console.log('=== EDIT CITY CANCELLED ===');

    this.router.navigate(['/cities']);
  }
}
