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

  packages: Package[] = [];

  services: PackageServiceOption[] = [];

  searchTerm = '';

  selectedServiceId = '';

  isLoading = false;

  isLoadingServices = false;

  errorMessage = '';

  serviceErrorMessage = '';

  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('PACKAGES LIST INITIALIZED');
    console.log('=================================');

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

    this.packageService.getServices().subscribe({
      // =====================================================
      // SUCCESS
      // =====================================================

      next: (response: PackageServiceOption[]) => {
        console.log('=================================');
        console.log('GET SERVICES SUCCESS');
        console.log('SERVICES RESPONSE:', response);
        console.log('=================================');

        this.services = Array.isArray(response) ? response : [];

        this.isLoadingServices = false;

        console.log('SERVICES:', this.services);

        console.log('SERVICE COUNT:', this.services.length);

        console.log('isLoadingServices:', this.isLoadingServices);

        this.cdr.detectChanges();
      },

      // =====================================================
      // ERROR
      // =====================================================

      error: (error) => {
        console.error('=================================');
        console.error('ERROR LOADING SERVICES');
        console.error('ERROR:', error);
        console.error('STATUS:', error?.status);
        console.error('ERROR BODY:', error?.error);
        console.error('=================================');

        this.services = [];

        this.isLoadingServices = false;

        this.serviceErrorMessage =
          error?.error?.message ??
          error?.error?.title ??
          error?.message ??
          'Unable to load services. Please try again.';

        console.log('SERVICE ERROR MESSAGE:', this.serviceErrorMessage);

        this.cdr.detectChanges();
      },
    });
  }

  // =========================================================
  // LOAD PACKAGES
  // =========================================================

  loadPackages(): void {
    console.log('=================================');
    console.log('LOAD PACKAGES STARTED');
    console.log('=================================');

    // =====================================================
    // START LOADING
    // =====================================================

    this.isLoading = true;

    this.errorMessage = '';

    console.log('PACKAGE LOADING STATE:', this.isLoading);

    this.cdr.detectChanges();

    // =====================================================
    // SERVICE FILTER
    // =====================================================

    const serviceId = this.selectedServiceId || undefined;

    console.log('SELECTED SERVICE ID:', serviceId);

    // =====================================================
    // API REQUEST
    // =====================================================

    this.packageService
      .getPackages(serviceId)
      .pipe(
        finalize(() => {
          console.log('=================================');
          console.log('PACKAGE REQUEST FINISHED');
          console.log('=================================');

          // Always stop loading.
          this.isLoading = false;

          console.log('FINAL isLoading:', this.isLoading);

          console.log('FINAL packages.length:', this.packages.length);

          console.log('FINAL filteredPackages.length:', this.filteredPackages.length);

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // ===================================================
        // SUCCESS
        // ===================================================

        next: (response: Package[]) => {
          console.log('=================================');
          console.log('GET PACKAGES SUCCESS');
          console.log('PACKAGES RESPONSE:', response);
          console.log('IS ARRAY:', Array.isArray(response));
          console.log('=================================');

          this.packages = Array.isArray(response) ? response : [];

          this.errorMessage = '';

          console.log('=================================');
          console.log('PACKAGE STATE UPDATED');
          console.log('=================================');

          console.log('isLoading before finalize:', this.isLoading);

          console.log('packages.length:', this.packages.length);

          console.log('filteredPackages.length:', this.filteredPackages.length);

          console.log('errorMessage:', this.errorMessage);

          // Update the template immediately.
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

          console.log('PACKAGE ERROR MESSAGE:', this.errorMessage);

          this.cdr.detectChanges();
        },
      });
  }

  // =========================================================
  // FILTERED PACKAGES
  // =========================================================

  get filteredPackages(): Package[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.packages;
    }

    return this.packages.filter((packageItem) => {
      const packageName = packageItem.name?.toLowerCase() ?? '';

      const serviceName = packageItem.serviceName?.toLowerCase() ?? '';

      return packageName.includes(search) || serviceName.includes(search);
    });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  onSearchChange(value: string): void {
    this.searchTerm = value;

    this.cdr.detectChanges();
  }

  // =========================================================
  // CLEAR SEARCH
  // =========================================================

  clearSearch(): void {
    this.searchTerm = '';

    this.cdr.detectChanges();
  }

  // =========================================================
  // SERVICE FILTER
  // =========================================================

  onServiceFilterChange(value: string): void {
    console.log('SERVICE FILTER CHANGED:', value);

    this.selectedServiceId = value;

    this.searchTerm = '';

    this.loadPackages();
  }

  // =========================================================
  // CLEAR SERVICE FILTER
  // =========================================================

  clearServiceFilter(): void {
    console.log('CLEARING SERVICE FILTER');

    this.selectedServiceId = '';

    this.searchTerm = '';

    this.loadPackages();
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
    console.log('EDIT PACKAGE CLICKED');

    console.log('PACKAGE ID:', packageItem.id);

    this.router.navigate(['/packages', packageItem.id, 'edit']);
  }

  // =========================================================
  // DELETE PACKAGE
  // =========================================================

  deletePackage(packageItem: Package): void {
    console.log('DELETE PACKAGE CLICKED');

    console.log('PACKAGE ID:', packageItem.id);

    console.log('PACKAGE NAME:', packageItem.name);

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

          this.packages = this.packages.filter(
            (currentPackage) => currentPackage.id !== packageItem.id,
          );

          console.log('REMAINING PACKAGES:', this.packages.length);

          this.cdr.detectChanges();
        },

        // ===================================================
        // ERROR
        // ===================================================

        error: (error) => {
          console.error('=================================');
          console.error('ERROR DELETING PACKAGE');
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
