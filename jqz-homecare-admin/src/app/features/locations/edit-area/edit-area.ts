import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Area, City, CityAreaService, UpdateAreaRequest } from '../../../core/services/city-area';

@Component({
  selector: 'app-edit-area',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './edit-area.html',
  styleUrl: './edit-area.css',
})
export class EditArea implements OnInit {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // =========================
  // AREA
  // =========================

  areaId = '';

  area: Area | null = null;

  // =========================
  // FORM DATA
  // =========================

  areaName = '';

  selectedCityId = '';

  selectedCityName = '';

  // =========================
  // CITIES
  // =========================

  cities: City[] = [];

  isLoadingCities = true;

  // =========================
  // PAGE LOADING
  // =========================

  isLoadingArea = true;

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
    console.log('=================================');
    console.log('EDIT AREA COMPONENT INITIALIZED');
    console.log('=================================');

    this.areaId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('Area ID from route:', this.areaId);

    if (!this.areaId) {
      this.errorMessage = 'Invalid area ID.';
      this.isLoadingArea = false;
      return;
    }

    this.loadArea();
    this.loadCities();
  }

  // =========================
  // LOAD AREA
  // =========================

  loadArea(): void {
    this.isLoadingArea = true;
    this.errorMessage = '';

    console.log('=================================');
    console.log('EDIT AREA: Loading area');
    console.log('Area ID:', this.areaId);
    console.log('isLoadingArea BEFORE request:', this.isLoadingArea);
    console.log('=================================');

    this.cityAreaService.getAreaById(this.areaId).subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: (response: Area) => {
        console.log('=================================');
        console.log('EDIT AREA: Area loaded successfully');
        console.log('Area:', response);
        console.log('=================================');

        // Store complete area object
        this.area = response;

        // Populate form fields
        this.areaName = response.name ?? '';

        this.selectedCityId = response.cityId ?? '';

        this.selectedCityName = response.cityName ?? '';

        // IMPORTANT:
        // API request has completed.
        this.isLoadingArea = false;

        // Debug logs
        console.log('=================================');
        console.log('AFTER SETTING LOADING FALSE');
        console.log('isLoadingArea:', this.isLoadingArea);
        console.log('area:', this.area);
        console.log('areaName:', this.areaName);
        console.log('selectedCityId:', this.selectedCityId);
        console.log('selectedCityName:', this.selectedCityName);
        console.log('=================================');

        // Resolve city name from cities list if necessary
        this.resolveCityName();

        console.log('=================================');
        console.log('FINAL AREA STATE');
        console.log('isLoadingArea:', this.isLoadingArea);
        console.log('area:', this.area);
        console.log('areaName:', this.areaName);
        console.log('selectedCityId:', this.selectedCityId);
        console.log('selectedCityName:', this.selectedCityName);
        console.log('=================================');
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('=================================');
        console.error('EDIT AREA: Unable to load area');
        console.error('Error:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error body:', error?.error);
        console.error('=================================');

        this.area = null;

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load area. Please try again.';

        this.isLoadingArea = false;

        console.log('=================================');
        console.log('AREA LOAD ERROR STATE');
        console.log('isLoadingArea:', this.isLoadingArea);
        console.log('area:', this.area);
        console.log('errorMessage:', this.errorMessage);
        console.log('=================================');
      },
    });
  }

  // =========================
  // LOAD CITIES
  // =========================

  loadCities(): void {
    this.isLoadingCities = true;

    console.log('=================================');
    console.log('EDIT AREA: Loading cities');
    console.log('=================================');

    this.cityAreaService.getCities().subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: (response: City[]) => {
        console.log('=================================');
        console.log('EDIT AREA: Cities loaded');
        console.log('Cities:', response);
        console.log('=================================');

        this.cities = Array.isArray(response) ? response : [];

        this.isLoadingCities = false;

        this.resolveCityName();

        console.log('=================================');
        console.log('CITY STATE');
        console.log('cities:', this.cities);
        console.log('cities.length:', this.cities.length);
        console.log('isLoadingCities:', this.isLoadingCities);
        console.log('selectedCityId:', this.selectedCityId);
        console.log('selectedCityName:', this.selectedCityName);
        console.log('=================================');
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('=================================');
        console.error('EDIT AREA: Unable to load cities');
        console.error('Error:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error body:', error?.error);
        console.error('=================================');

        this.cities = [];

        if (!this.errorMessage) {
          this.errorMessage =
            error?.error?.message ?? error?.message ?? 'Unable to load cities. Please try again.';
        }

        this.isLoadingCities = false;
      },
    });
  }

  // =========================
  // RESOLVE CITY NAME
  // =========================

  private resolveCityName(): void {
    // No city ID available
    if (!this.selectedCityId) {
      return;
    }

    // Area API already provided city name
    if (this.selectedCityName) {
      return;
    }

    // Find city from cities API
    const city = this.cities.find((currentCity) => currentCity.id === this.selectedCityId);

    if (city) {
      this.selectedCityName = city.name;

      console.log('City name resolved:', this.selectedCityName);
    }
  }

  // =========================
  // SUBMIT
  // =========================

  submit(): void {
    // Trim whitespace
    this.areaName = this.areaName.trim();

    // Clear previous error
    this.errorMessage = '';

    console.log('=================================');
    console.log('EDIT AREA: SUBMIT');
    console.log('=================================');

    // =========================
    // VALIDATION
    // =========================

    if (!this.areaName) {
      this.errorMessage = 'Area name is required.';
      return;
    }

    if (!this.areaId) {
      this.errorMessage = 'Invalid area ID.';
      return;
    }

    if (!this.selectedCityId) {
      this.errorMessage = 'Area city information is missing.';
      return;
    }

    // =========================
    // SUBMITTING
    // =========================

    this.isSubmitting = true;

    /*
     * IMPORTANT:
     *
     * Backend UpdateAreaDto requires BOTH:
     *
     * Name
     * CityId
     *
     * Therefore we must send both values.
     */
    const request: UpdateAreaRequest = {
      name: this.areaName,
      cityId: this.selectedCityId,
    };

    console.log('=================================');
    console.log('UPDATING AREA');
    console.log('Area ID:', this.areaId);
    console.log('Update Request:', request);
    console.log('Name:', request.name);
    console.log('City ID:', request.cityId);
    console.log('=================================');

    this.cityAreaService.updateArea(this.areaId, request).subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: () => {
        console.log('=================================');
        console.log('AREA UPDATED SUCCESSFULLY');
        console.log('Area ID:', this.areaId);
        console.log('=================================');

        this.isSubmitting = false;

        /*
         * Navigate back to Areas list.
         */
        this.router.navigate(['/areas']);
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('=================================');
        console.error('UNABLE TO UPDATE AREA');
        console.error('Error:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error body:', error?.error);
        console.error('=================================');

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to update area. Please try again.';

        this.isSubmitting = false;
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.router.navigate(['/areas']);
  }

  // =========================
  // RETRY
  // =========================

  retry(): void {
    if (this.isSubmitting) {
      return;
    }

    console.log('Retrying area and city requests...');

    this.errorMessage = '';

    this.loadArea();
    this.loadCities();
  }
}
