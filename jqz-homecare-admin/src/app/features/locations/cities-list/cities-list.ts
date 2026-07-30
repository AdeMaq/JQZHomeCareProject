import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { City, CityAreaService } from '../../../core/services/city-area';

@Component({
  selector: 'app-cities-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cities-list.html',
  styleUrl: './cities-list.css',
})
export class CitiesList implements OnInit {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  cities: City[] = [];

  isLoading = false;

  errorMessage = '';

  ngOnInit(): void {
    console.log('=================================');
    console.log('=== CITIES LIST INITIALIZED ===');
    console.log('=================================');

    this.loadCities();
  }

  loadCities(): void {
    console.log('=== LOADING CITIES ===');

    this.isLoading = true;
    this.errorMessage = '';

    /*
     * Immediately update the UI so the loading state appears.
     */
    this.cdr.detectChanges();

    this.cityAreaService.getCities().subscribe({
      next: (response: City[]) => {
        console.log('=== CITIES RECEIVED ===');
        console.log(response);

        this.cities = Array.isArray(response) ? response : [];

        console.log('CITY COUNT:', this.cities.length);

        this.isLoading = false;

        console.log('IS LOADING:', this.isLoading);

        /*
         * IMPORTANT:
         *
         * The API response is arriving correctly,
         * but the UI was not being refreshed.
         *
         * Force Angular to run change detection after
         * updating cities and isLoading.
         */
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('=== CITIES API ERROR ===');
        console.error(error);

        this.cities = [];

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load cities. Please try again.';

        this.isLoading = false;

        /*
         * Update the UI after the API error.
         */
        this.cdr.detectChanges();
      },
    });
  }

  addCity(): void {
    this.router.navigate(['/cities/add']);
  }

  editCity(id: string): void {
    console.log('=================================');
    console.log('=== EDIT CITY ===');
    console.log('CITY ID:', id);
    console.log('=================================');

    /*
     * app.routes.ts:
     *
     * cities/:id/edit
     *
     * Therefore:
     *
     * /cities/{id}/edit
     */
    this.router.navigate(['/cities', id, 'edit']);
  }

  deleteCity(id: string): void {
    const city = this.cities.find((x) => x.id === id);

    if (!city) {
      console.error('City not found in current list:', id);
      return;
    }

    const cityName = city.name;

    const confirmed = confirm(`Are you sure you want to delete ${cityName}?`);

    if (!confirmed) {
      return;
    }

    console.log('=================================');
    console.log('=== DELETE CITY ===');
    console.log('CITY NAME:', cityName);
    console.log('CITY ID:', id);
    console.log('=================================');

    this.cityAreaService.deleteCity(id).subscribe({
      next: () => {
        console.log('=== CITY DELETED SUCCESSFULLY ===');

        /*
         * Remove the city from the existing array.
         *
         * We do NOT call loadCities() here.
         * Therefore the loading screen will NOT appear
         * again after deleting a city.
         */
        this.cities = this.cities.filter((city) => city.id !== id);

        console.log('REMAINING CITIES:', this.cities.length);

        /*
         * Update the UI immediately.
         */
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('=== DELETE CITY ERROR ===');
        console.error(error);

        /*
         * Do not modify the cities array when the backend
         * reports that deletion failed.
         */
        const message =
          error?.error?.message ?? error?.message ?? 'Unable to delete city. Please try again.';

        alert(message);

        this.cdr.detectChanges();
      },
    });
  }
}
