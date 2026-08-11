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

  // =====================================================
  // CITIES
  // =====================================================

  cities: City[] = [];

  // =====================================================
  // SEARCH
  // =====================================================

  searchTerm = '';

  filteredCities: City[] = [];

  // =====================================================
  // PAGE STATE
  // =====================================================

  isLoading = false;

  errorMessage = '';

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('=== CITIES LIST INITIALIZED ===');
    console.log('=================================');

    this.loadCities();
  }

  // =====================================================
  // LOAD CITIES
  // =====================================================

  loadCities(): void {
    console.log('=== LOADING CITIES ===');

    this.isLoading = true;
    this.errorMessage = '';

    /*
     * Clear the current search while loading.
     */
    this.searchTerm = '';

    this.cdr.detectChanges();

    this.cityAreaService.getCities().subscribe({
      next: (response: City[]) => {
        console.log('=== CITIES RECEIVED ===');
        console.log(response);

        this.cities = Array.isArray(response) ? response : [];

        console.log('CITY COUNT:', this.cities.length);

        /*
         * Initially all cities are displayed.
         */
        this.filteredCities = [...this.cities];

        this.isLoading = false;

        console.log('IS LOADING:', this.isLoading);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('=== CITIES API ERROR ===');
        console.error(error);

        this.cities = [];
        this.filteredCities = [];

        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load cities. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =====================================================
  // SEARCH CITIES
  // =====================================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;

    const searchValue = this.searchTerm.trim().toLowerCase();

    /*
     * If search box is empty,
     * display all cities.
     */
    if (searchValue === '') {
      this.filteredCities = [...this.cities];
      return;
    }

    /*
     * Filter cities by city name.
     */
    this.filteredCities = this.cities.filter((city) =>
      city.name.toLowerCase().includes(searchValue),
    );

    this.cdr.detectChanges();
  }

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  clearSearch(): void {
    this.searchTerm = '';

    this.filteredCities = [...this.cities];

    this.cdr.detectChanges();
  }

  // =====================================================
  // ADD CITY
  // =====================================================

  addCity(): void {
    this.router.navigate(['/cities/add']);
  }

  // =====================================================
  // EDIT CITY
  // =====================================================

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

  // =====================================================
  // DELETE CITY
  // =====================================================

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
         * Remove the city from the original array.
         */
        this.cities = this.cities.filter((city) => city.id !== id);

        /*
         * Also remove it from the currently displayed list.
         */
        this.filteredCities = this.filteredCities.filter((city) => city.id !== id);

        console.log('REMAINING CITIES:', this.cities.length);

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('=== DELETE CITY ERROR ===');
        console.error(error);

        const message =
          error?.error?.message ?? error?.message ?? 'Unable to delete city. Please try again.';

        alert(message);

        this.cdr.detectChanges();
      },
    });
  }
}
