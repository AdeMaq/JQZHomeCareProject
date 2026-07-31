import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

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

      this.cdr.detectChanges();

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

    this.cdr.detectChanges();

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

        // API request completed
        this.isLoadingArea = false;

        // Resolve city name if API didn't provide it
        this.resolveCityName();

        console.log('=================================');
        console.log('EDIT AREA: FINAL STATE');
        console.log('isLoadingArea:', this.isLoadingArea);
        console.log('area:', this.area);
        console.log('areaName:', this.areaName);
        console.log('selectedCityId:', this.selectedCityId);
        console.log('selectedCityName:', this.selectedCityName);
        console.log('=================================');

        // IMPORTANT:
        // Force Angular to update the Edit Area template.
        this.cdr.detectChanges();

        console.log('EDIT AREA: Change detection triggered after area load.');
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

        // Force Angular to display error state
        this.cdr.detectChanges();

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

    this.cdr.detectChanges();

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

        // Force Angular to update city-related UI
        this.cdr.detectChanges();

        console.log('EDIT AREA: Change detection triggered after cities load.');
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

        // Force Angular to update city error/loading state
        this.cdr.detectChanges();
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
      this.errorMessage = 'Area name is required';

      this.cdr.detectChanges();

      return;
    }

    if (!this.areaId) {
      this.errorMessage = 'Invalid area ID.';

      this.cdr.detectChanges();

      return;
    }

    if (!this.selectedCityId) {
      this.errorMessage = 'Area city information is missing.';

      this.cdr.detectChanges();

      return;
    }

    // =========================
    // SUBMITTING
    // =========================

    this.isSubmitting = true;

    this.cdr.detectChanges();

    /*
     * Backend UpdateAreaDto requires:
     *
     * Name
     * CityId
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

        this.cdr.detectChanges();

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

        this.cdr.detectChanges();
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
