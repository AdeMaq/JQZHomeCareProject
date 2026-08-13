import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Package, PackageService, PackageServiceOption } from '../../../core/services/package';

@Component({
  selector: 'app-packages-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './packages-list.html',
  styleUrl: './packages-list.css',
})
export class PackagesList implements OnInit {
  // =========================================================
  // SERVICES
  // =========================================================

  private readonly packageService = inject(PackageService);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  // =========================================================
  // COMPONENT STATE
  // =========================================================

  /**
   * Complete package list returned by the API.
   *
   * IMPORTANT:
   * We keep the complete package list in memory and perform
   * searching and service filtering locally.
   *
   * This prevents the service dropdown and table data from
   * getting out of sync after changing the service filter.
   */
  packages: Package[] = [];

  /**
   * Available services used by the service dropdown.
   */
  services: PackageServiceOption[] = [];

  /**
   * Current search text.
   */
  searchTerm = '';

  /**
   * Currently selected service ID.
   *
   * Empty string means:
   * "All Services"
   */
  selectedServiceId = '';

  // =========================================================
  // LOADING STATE
  // =========================================================

  isLoading = false;

  isLoadingServices = false;

  // =========================================================
  // ERROR STATE
  // =========================================================

  errorMessage = '';

  serviceErrorMessage = '';

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('PACKAGES LIST INITIALIZED');
    console.log('=================================');

    /*
     * Load both datasets independently.
     *
     * Packages are loaded WITHOUT a service filter.
     *
     * Service filtering will be performed locally.
     */
    this.loadServices();

    this.loadPackages();
  }

  // =========================================================
  // LOAD SERVICES
  // =========================================================

  loadServices(): void {
    console.log('=================================');
    console.log('LOAD PACKAGE SERVICES STARTED');
    console.log('=================================');

    this.isLoadingServices = true;

    this.serviceErrorMessage = '';

    this.cdr.detectChanges();

    this.packageService
      .getServices()
      .pipe(
        finalize(() => {
          this.isLoadingServices = false;

          console.log('=================================');
          console.log('LOAD PACKAGE SERVICES FINISHED');
          console.log('=================================');

          console.log('FINAL SERVICE COUNT:', this.services.length);

          console.log('FINAL isLoadingServices:', this.isLoadingServices);

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // =====================================================
        // SUCCESS
        // =====================================================

        next: (response: PackageServiceOption[]) => {
          console.log('=================================');
          console.log('GET SERVICES SUCCESS');
          console.log('SERVICES RESPONSE:', response);
          console.log('=================================');

          this.services = Array.isArray(response) ? response : [];

          console.log('SERVICES:', this.services);

          console.log('SERVICE COUNT:', this.services.length);

          this.cdr.detectChanges();
        },

        // =====================================================
        // ERROR
        // =====================================================

        error: (error) => {
          console.error('=================================');
          console.error('ERROR LOADING SERVICES');
          console.error('=================================');

          console.error('ERROR:', error);
          console.error('STATUS:', error?.status);
          console.error('ERROR BODY:', error?.error);

          console.error('=================================');

          this.services = [];

          this.serviceErrorMessage =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Unable to load services. Please try again.';

          console.error('SERVICE ERROR MESSAGE:', this.serviceErrorMessage);

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // LOAD PACKAGES
  // =========================================================

  loadPackages(): void {
    console.log('=================================');
    console.log('LOAD ALL PACKAGES STARTED');
    console.log('=================================');

    /*
     * IMPORTANT:
     *
     * Always request the COMPLETE package list.
     *
     * We intentionally do NOT pass selectedServiceId here.
     *
     * Service filtering is handled locally by the
     * filteredPackages getter.
     */
    this.isLoading = true;

    this.errorMessage = '';

    this.cdr.detectChanges();

    this.packageService
      .getPackages()
      .pipe(
        finalize(() => {
          console.log('=================================');
          console.log('PACKAGE REQUEST FINISHED');
          console.log('=================================');

          this.isLoading = false;

          console.log('FINAL isLoading:', this.isLoading);

          console.log('FINAL packages.length:', this.packages.length);

          console.log('FINAL filteredPackages.length:', this.filteredPackages.length);

          console.log('FINAL selectedServiceId:', this.selectedServiceId);

          console.log('FINAL searchTerm:', this.searchTerm);

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // ===================================================
        // SUCCESS
        // ===================================================

        next: (response: Package[]) => {
          console.log('=================================');
          console.log('GET ALL PACKAGES SUCCESS');
          console.log('PACKAGES RESPONSE:', response);
          console.log('IS ARRAY:', Array.isArray(response));
          console.log('=================================');

          /*
           * Store the complete package list.
           */
          this.packages = Array.isArray(response) ? response : [];

          this.errorMessage = '';

          console.log('=================================');
          console.log('PACKAGE STATE UPDATED');
          console.log('=================================');

          console.log('packages.length:', this.packages.length);

          console.log('filteredPackages.length:', this.filteredPackages.length);

          this.cdr.detectChanges();
        },

        // ===================================================
        // ERROR
        // ===================================================

        error: (error) => {
          console.error('=================================');
          console.error('ERROR LOADING PACKAGES');
          console.error('=================================');

          console.error('ERROR:', error);
          console.error('STATUS:', error?.status);
          console.error('ERROR BODY:', error?.error);

          console.error('=================================');

          this.packages = [];

          this.errorMessage =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Unable to load packages. Please try again.';

          console.error('PACKAGE ERROR MESSAGE:', this.errorMessage);

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // FILTERED PACKAGES
  // =========================================================

  /**
   * Returns packages after applying:
   *
   * 1. Service filter
   * 2. Search filter
   *
   * Both filters work together.
   */
  get filteredPackages(): Package[] {
    const search = this.searchTerm.trim().toLowerCase();

    const selectedServiceId = this.selectedServiceId.trim();

    return this.packages.filter((packageItem) => {
      // =====================================================
      // SERVICE FILTER
      // =====================================================

      /*
       * If selectedServiceId is empty, all services are
       * allowed.
       *
       * Otherwise only packages belonging to the selected
       * service are returned.
       */
      const matchesService = !selectedServiceId || packageItem.serviceId === selectedServiceId;

      if (!matchesService) {
        return false;
      }

      // =====================================================
      // SEARCH FILTER
      // =====================================================

      /*
       * No search text means the package automatically
       * matches the search condition.
       */
      if (!search) {
        return true;
      }

      const packageName = packageItem.name?.toLowerCase() ?? '';

      const serviceName = packageItem.serviceName?.toLowerCase() ?? '';

      /*
       * Convert number of visits to a string so the user can
       * search by visit count.
       *
       * Example:
       *
       * Package:
       * "Family Care"
       * Visits: 10
       *
       * Searching:
       * "family" -> matches
       * "care"   -> matches
       * "10"     -> matches
       */
      const numberOfVisits =
        packageItem.numberOfVisits !== null && packageItem.numberOfVisits !== undefined
          ? String(packageItem.numberOfVisits)
          : '';

      return (
        packageName.includes(search) ||
        serviceName.includes(search) ||
        numberOfVisits.includes(search)
      );
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(value: string): void {
    console.log('SEARCH CHANGED:', value);

    this.searchTerm = value;

    /*
     * No API request is required.
     *
     * filteredPackages automatically recalculates because
     * searchTerm has changed.
     */
    this.cdr.detectChanges();
  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {
    console.log('CLEARING SEARCH');

    this.searchTerm = '';

    this.cdr.detectChanges();
  }

  // =========================================================
  // SERVICE FILTER
  // =========================================================

  onServiceFilterChange(value: string): void {
    console.log('=================================');
    console.log('SERVICE FILTER CHANGED');
    console.log('NEW SERVICE ID:', value);
    console.log('=================================');

    /*
     * Store the selected service ID.
     *
     * IMPORTANT:
     * We do NOT call loadPackages().
     *
     * The complete package list is already loaded and the
     * filteredPackages getter handles the filtering locally.
     */
    this.selectedServiceId = value;

    /*
     * We intentionally DO NOT clear searchTerm here.
     *
     * This allows the user to combine:
     *
     * Service filter + Search
     *
     * Example:
     *
     * Service = Physiotherapy
     * Search = "5"
     *
     * Result = Physiotherapy packages containing 5 visits.
     */

    console.log('SELECTED SERVICE ID:', this.selectedServiceId);

    console.log('FILTERED PACKAGE COUNT:', this.filteredPackages.length);

    this.cdr.detectChanges();
  }

  // =========================================================
  // CLEAR ALL FILTERS
  // =========================================================

  clearServiceFilter(): void {
    console.log('=================================');
    console.log('CLEARING PACKAGE FILTERS');
    console.log('=================================');

    /*
     * Empty service ID means "All Services".
     */
    this.selectedServiceId = '';

    /*
     * Clear search as well because this button is now
     * responsible for clearing ALL active filters.
     */
    this.searchTerm = '';

    console.log('SELECTED SERVICE ID:', this.selectedServiceId);

    console.log('SEARCH TERM:', this.searchTerm);

    console.log('FILTERED PACKAGE COUNT:', this.filteredPackages.length);

    /*
     * No API request is required.
     */
    this.cdr.detectChanges();
  }

  // =========================================================
  // ADD PACKAGE
  // =========================================================

  addPackage(): void {
    console.log('ADD PACKAGE CLICKED');

    this.router.navigate(['/packages/add']);
  }

  // =========================================================
  // EDIT PACKAGE
  // =========================================================

  editPackage(packageItem: Package): void {
    console.log('=================================');
    console.log('EDIT PACKAGE CLICKED');
    console.log('PACKAGE ID:', packageItem.id);
    console.log('PACKAGE NAME:', packageItem.name);
    console.log('=================================');

    this.router.navigate(['/packages', packageItem.id, 'edit']);
  }

  // =========================================================
  // DELETE PACKAGE
  // =========================================================

  deletePackage(packageItem: Package): void {
    console.log('=================================');
    console.log('DELETE PACKAGE CLICKED');
    console.log('PACKAGE ID:', packageItem.id);
    console.log('PACKAGE NAME:', packageItem.name);
    console.log('=================================');

    const confirmed = window.confirm(`Are you sure you want to delete "${packageItem.name}"?`);

    if (!confirmed) {
      console.log('DELETE CANCELLED BY USER');

      return;
    }

    // =====================================================
    // DELETE REQUEST
    // =====================================================

    this.packageService
      .deletePackage(packageItem.id)
      .pipe(
        finalize(() => {
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // ===================================================
        // SUCCESS
        // ===================================================

        next: () => {
          console.log('=================================');
          console.log('PACKAGE DELETED SUCCESSFULLY');
          console.log('PACKAGE ID:', packageItem.id);
          console.log('=================================');

          /*
           * Remove the deleted package from the complete
           * in-memory package list.
           */
          this.packages = this.packages.filter(
            (currentPackage) => currentPackage.id !== packageItem.id,
          );

          console.log('REMAINING PACKAGES:', this.packages.length);

          console.log('REMAINING FILTERED PACKAGES:', this.filteredPackages.length);

          this.cdr.detectChanges();
        },

        // ===================================================
        // ERROR
        // ===================================================

        error: (error) => {
          console.error('=================================');
          console.error('ERROR DELETING PACKAGE');
          console.error('=================================');

          console.error('ERROR:', error);
          console.error('STATUS:', error?.status);
          console.error('ERROR BODY:', error?.error);

          console.error('=================================');

          const message =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Unable to delete the package. Please try again.';

          window.alert(message);

          this.cdr.detectChanges();
        },
      });
  }
}
