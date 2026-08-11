import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
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
  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================================
  // COMPONENT STATE
  // =====================================================

  areas: Area[] = [];

  /*
   * Filtered list displayed in the table.
   *
   * Initially this will contain all areas.
   * When the user searches, this array will contain
   * only the matching areas.
   */
  filteredAreas: Area[] = [];

  /*
   * Current search text.
   */
  searchTerm = '';

  isLoading = true;

  errorMessage = '';

  // =====================================================
  // COMPONENT INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('AREAS LIST COMPONENT INITIALIZED');
    console.log('=================================');

    this.loadAreas();
  }

  // =====================================================
  // LOAD AREAS
  // =====================================================

  loadAreas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('=================================');
    console.log('LOAD AREAS: Starting API request...');
    console.log('isLoading before request:', this.isLoading);
    console.log('=================================');

    /*
     * Reset search when the list is loaded again.
     */
    this.searchTerm = '';

    /*
     * Make sure the loading state is rendered
     * immediately before the API request completes.
     */
    this.cdr.detectChanges();

    this.cityAreaService.getAreas().subscribe({
      // =====================================================
      // SUCCESS
      // =====================================================

      next: (response: Area[]) => {
        console.log('=================================');
        console.log('LOAD AREAS: API RESPONSE:', response);
        console.log('LOAD AREAS: Is Array:', Array.isArray(response));
        console.log('LOAD AREAS: Response Length:', response?.length);
        console.log('=================================');

        /*
         * Store the areas returned by the backend.
         */
        this.areas = Array.isArray(response) ? response : [];

        /*
         * Initially display all areas.
         */
        this.filteredAreas = [...this.areas];

        /*
         * API request has finished.
         */
        this.isLoading = false;

        /*
         * Force Angular to update the template.
         */
        this.cdr.detectChanges();

        console.log('=================================');
        console.log('LOAD AREAS: API request completed');
        console.log('LOAD AREAS: isLoading:', this.isLoading);
        console.log('LOAD AREAS: areas:', this.areas);
        console.log('LOAD AREAS: areas.length:', this.areas.length);
        console.log('LOAD AREAS: filteredAreas.length:', this.filteredAreas.length);
        console.log('LOAD AREAS: errorMessage:', this.errorMessage);
        console.log('=================================');
      },

      // =====================================================
      // ERROR
      // =====================================================

      error: (error) => {
        console.error('=================================');
        console.error('LOAD AREAS: API ERROR');
        console.error('Error:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error body:', error?.error);
        console.error('=================================');

        /*
         * Clear the existing lists when the request fails.
         */
        this.areas = [];
        this.filteredAreas = [];

        /*
         * Display a useful error message.
         */
        this.errorMessage =
          error?.error?.message ?? error?.message ?? 'Unable to load areas. Please try again.';

        /*
         * Stop the loading state.
         */
        this.isLoading = false;

        /*
         * Make sure the error state is rendered.
         */
        this.cdr.detectChanges();

        console.log('=================================');
        console.log('LOAD AREAS: Error handling completed');
        console.log('isLoading:', this.isLoading);
        console.log('errorMessage:', this.errorMessage);
        console.log('=================================');
      },
    });
  }

  // =====================================================
  // SEARCH AREAS
  // =====================================================

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;

    const term = this.searchTerm.trim().toLowerCase();

    /*
     * If the search box is empty,
     * show all areas again.
     */
    if (term === '') {
      this.filteredAreas = [...this.areas];
      return;
    }

    /*
     * Filter areas by area name.
     */
    this.filteredAreas = this.areas.filter((area) => area.name.toLowerCase().includes(term));

    /*
     * Update the UI immediately.
     */
    this.cdr.detectChanges();
  }

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  clearSearch(): void {
    /*
     * Clear the search text.
     */
    this.searchTerm = '';

    /*
     * Restore the complete area list.
     */
    this.filteredAreas = [...this.areas];

    /*
     * Update the UI.
     */
    this.cdr.detectChanges();
  }

  // =====================================================
  // ADD AREA
  // =====================================================

  addArea(): void {
    console.log('ADD AREA clicked');

    this.router.navigate(['/areas/add']);
  }

  // =====================================================
  // EDIT AREA
  // =====================================================

  editArea(id: string): void {
    console.log('=================================');
    console.log('EDIT AREA clicked');
    console.log('Area ID:', id);
    console.log('=================================');

    this.router.navigate(['/areas', id, 'edit']);
  }

  // =====================================================
  // DELETE AREA
  // =====================================================

  deleteArea(id: string): void {
    console.log('=================================');
    console.log('DELETE AREA clicked');
    console.log('Area ID:', id);
    console.log('=================================');

    /*
     * Find the area in the currently loaded list.
     */
    const area = this.areas.find((x) => x.id === id);

    if (!area) {
      console.error('Area not found:', id);
      return;
    }

    /*
     * Ask the user for confirmation.
     */
    const confirmed = confirm(`Are you sure you want to delete ${area.name}?`);

    if (!confirmed) {
      console.log('Delete cancelled by user');
      return;
    }

    /*
     * Call the backend API.
     */
    this.cityAreaService.deleteArea(id).subscribe({
      // =====================================================
      // DELETE SUCCESS
      // =====================================================

      next: () => {
        console.log('=================================');
        console.log('AREA DELETED SUCCESSFULLY');
        console.log('Deleted Area ID:', id);
        console.log('=================================');

        /*
         * Remove the deleted area from the main array.
         *
         * We do NOT call loadAreas().
         *
         * Therefore the loading state will not appear
         * again after deleting an area.
         */
        this.areas = this.areas.filter((currentArea) => currentArea.id !== id);

        /*
         * Also remove the deleted area from the
         * currently displayed filtered list.
         */
        this.filteredAreas = this.filteredAreas.filter((currentArea) => currentArea.id !== id);

        /*
         * Update the UI immediately.
         */
        this.cdr.detectChanges();

        console.log('Remaining areas:', this.areas);
        console.log('Remaining area count:', this.areas.length);
        console.log('Remaining filtered area count:', this.filteredAreas.length);
      },

      // =====================================================
      // DELETE ERROR
      // =====================================================

      error: (error) => {
        console.error('=================================');
        console.error('UNABLE TO DELETE AREA');
        console.error('Error:', error);
        console.error('Error status:', error?.status);
        console.error('Error message:', error?.message);
        console.error('Error body:', error?.error);
        console.error('=================================');

        const message =
          error?.error?.message ?? error?.message ?? 'Unable to delete area. Please try again.';

        alert(message);

        /*
         * Make sure the UI remains consistent.
         */
        this.cdr.detectChanges();
      },
    });
  }
}
