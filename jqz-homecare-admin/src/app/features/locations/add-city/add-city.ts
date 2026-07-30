import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CityAreaService, CreateCityRequest } from '../../../core/services/city-area';

@Component({
  selector: 'app-add-city',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-city.html',
  styleUrl: './add-city.css',
})
export class AddCity {
  private readonly cityAreaService = inject(CityAreaService);
  private readonly router = inject(Router);

  cityName = '';

  isSubmitting = false;

  errorMessage = '';

  submit(): void {
    this.cityName = this.cityName.trim();

    if (!this.cityName) {
      this.errorMessage = 'City name is required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const request: CreateCityRequest = {
      name: this.cityName,
    };

    this.cityAreaService.createCity(request).subscribe({
      next: (createdCity) => {
        console.log('City created successfully:', createdCity);

        this.isSubmitting = false;

        /*
         * Pass the newly-created city to the list page.
         */
        this.router.navigate(['/cities'], {
          state: {
            createdCity,
          },
        });
      },

      error: (error) => {
        console.error('Failed to create city:', error);

        this.errorMessage = error?.error?.message ?? 'Unable to create city. Please try again.';

        this.isSubmitting = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/cities']);
  }
}
