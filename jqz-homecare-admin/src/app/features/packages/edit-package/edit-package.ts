import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Package, PackageService, UpdatePackageRequest } from '../../../core/services/package';

@Component({
  selector: 'app-edit-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-package.html',
  styleUrl: './edit-package.css',
})
export class EditPackage implements OnInit {
  // =====================================================
  // SERVICES
  // =====================================================

  private readonly packageService = inject(PackageService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================================
  // PACKAGE ID
  // =====================================================

  packageId = '';

  // =====================================================
  // FORM DATA
  // =====================================================

  packageName = '';

  numberOfVisits: number | null = null;

  amount: number | null = null;

  // =====================================================
  // READ-ONLY PACKAGE INFORMATION
  // =====================================================

  serviceId = '';

  serviceName = '';

  // =====================================================
  // CALCULATED VALUES
  // =====================================================

  pricePerVisit = 0;

  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = false;

  isSaving = false;

  packageLoaded = false;

  errorMessage = '';

  successMessage = '';

  // =====================================================
  // INITIALIZE
  // =====================================================

  ngOnInit(): void {
    console.log('=================================');
    console.log('EDIT PACKAGE INITIALIZED');
    console.log('=================================');

    this.packageId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('PACKAGE ID FROM ROUTE:', this.packageId);

    // ===================================================
    // VALIDATE PACKAGE ID
    // ===================================================

    if (!this.packageId) {
      this.errorMessage = 'Package ID is missing.';

      this.packageLoaded = false;

      this.cdr.detectChanges();

      return;
    }

    // ===================================================
    // LOAD PACKAGE
    // ===================================================

    this.loadPackage();
  }

  // =====================================================
  // LOAD PACKAGE
  // =====================================================

  loadPackage(): void {
    console.log('=================================');
    console.log('LOAD PACKAGE STARTED');
    console.log('PACKAGE ID:', this.packageId);
    console.log('=================================');

    // ===================================================
    // START LOADING
    // ===================================================

    this.isLoading = true;

    this.packageLoaded = false;

    this.errorMessage = '';

    this.successMessage = '';

    this.cdr.detectChanges();

    // ===================================================
    // GET PACKAGE
    // ===================================================

    this.packageService
      .getPackageById(this.packageId)
      .pipe(
        finalize(() => {
          console.log('=================================');
          console.log('LOAD PACKAGE FINISHED');
          console.log('=================================');

          // Always stop loading.
          this.isLoading = false;

          console.log('FINAL isLoading VALUE:', this.isLoading);

          console.log('FINAL packageLoaded VALUE:', this.packageLoaded);

          console.log('FINAL packageName VALUE:', this.packageName);

          // Force Angular to update the UI.
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // =================================================
        // SUCCESS
        // =================================================

        next: (response: Package) => {
          console.log('=================================');
          console.log('GET PACKAGE SUCCESS');
          console.log('PACKAGE RESPONSE:', response);
          console.log('=================================');

          // =================================================
          // VALIDATE RESPONSE
          // =================================================

          if (!response) {
            this.errorMessage = 'Package data was not returned by the server.';

            this.packageLoaded = false;

            this.cdr.detectChanges();

            return;
          }

          // =================================================
          // POPULATE FORM
          // =================================================

          this.populateForm(response);

          // =================================================
          // MARK PACKAGE AS LOADED
          // =================================================

          this.packageLoaded = true;

          console.log('=================================');
          console.log('PACKAGE FORM POPULATED');
          console.log('PACKAGE NAME:', this.packageName);
          console.log('SERVICE ID:', this.serviceId);
          console.log('SERVICE NAME:', this.serviceName);
          console.log('NUMBER OF VISITS:', this.numberOfVisits);
          console.log('AMOUNT:', this.amount);
          console.log('PRICE PER VISIT:', this.pricePerVisit);
          console.log('packageLoaded:', this.packageLoaded);
          console.log('=================================');

          this.cdr.detectChanges();
        },

        // =================================================
        // ERROR
        // =================================================

        error: (error) => {
          console.error('=================================');
          console.error('GET PACKAGE ERROR');
          console.error('=================================');
          console.error('ERROR:', error);
          console.error('STATUS:', error?.status);
          console.error('ERROR BODY:', error?.error);
          console.error('=================================');

          this.packageLoaded = false;

          this.errorMessage =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Unable to load the package. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }

  // =====================================================
  // POPULATE FORM
  // =====================================================

  private populateForm(packageData: Package): void {
    this.packageName = packageData.name ?? '';

    this.numberOfVisits =
      packageData.numberOfVisits !== undefined && packageData.numberOfVisits !== null
        ? packageData.numberOfVisits
        : null;

    this.amount =
      packageData.amount !== undefined && packageData.amount !== null ? packageData.amount : null;

    this.serviceId = packageData.serviceId ?? '';

    this.serviceName = packageData.serviceName ?? '';

    this.pricePerVisit = packageData.pricePerVisit ?? 0;

    // Recalculate using current values.
    this.calculateValues();
  }

  // =====================================================
  // CALCULATE PACKAGE VALUES
  // =====================================================

  calculateValues(): void {
    if (
      this.numberOfVisits !== null &&
      this.numberOfVisits > 0 &&
      this.amount !== null &&
      this.amount >= 0
    ) {
      this.pricePerVisit = this.amount / this.numberOfVisits;
    } else {
      this.pricePerVisit = 0;
    }
  }

  // =====================================================
  // UPDATE PACKAGE
  // =====================================================

  updatePackage(): void {
    console.log('=================================');
    console.log('UPDATE PACKAGE STARTED');
    console.log('PACKAGE ID:', this.packageId);
    console.log('=================================');

    // ===================================================
    // RESET MESSAGES
    // ===================================================

    this.errorMessage = '';

    this.successMessage = '';

    // ===================================================
    // NORMALIZE PACKAGE NAME
    // ===================================================

    this.packageName = this.packageName.trim();

    // ===================================================
    // VALIDATE PACKAGE NAME
    // ===================================================

    if (!this.packageName) {
      this.errorMessage = 'Package name is required.';

      this.cdr.detectChanges();

      return;
    }

    if (this.packageName.length > 150) {
      this.errorMessage = 'Package name must not exceed 150 characters.';

      this.cdr.detectChanges();

      return;
    }

    // ===================================================
    // VALIDATE NUMBER OF VISITS
    // ===================================================

    if (
      this.numberOfVisits === null ||
      this.numberOfVisits < 1 ||
      !Number.isInteger(this.numberOfVisits)
    ) {
      this.errorMessage = 'Number of visits must be at least 1 and must be a whole number.';

      this.cdr.detectChanges();

      return;
    }

    // ===================================================
    // VALIDATE AMOUNT
    // ===================================================

    if (this.amount === null || this.amount <= 0 || !Number.isFinite(this.amount)) {
      this.errorMessage = 'Amount must be greater than 0.';

      this.cdr.detectChanges();

      return;
    }

    // ===================================================
    // CREATE UPDATE REQUEST
    // ===================================================

    const request: UpdatePackageRequest = {
      name: this.packageName,
      numberOfVisits: this.numberOfVisits,
      amount: this.amount,
    };

    console.log('UPDATE PACKAGE REQUEST:', request);

    // ===================================================
    // START SAVING
    // ===================================================

    this.isSaving = true;

    this.cdr.detectChanges();

    // ===================================================
    // UPDATE API
    // ===================================================

    this.packageService
      .updatePackage(this.packageId, request)
      .pipe(
        finalize(() => {
          console.log('UPDATE REQUEST FINISHED');

          this.isSaving = false;

          console.log('isSaving:', this.isSaving);

          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        // =================================================
        // SUCCESS
        // =================================================

        next: async () => {
          console.log('=================================');
          console.log('PACKAGE UPDATED SUCCESSFULLY');
          console.log('PACKAGE ID:', this.packageId);
          console.log('=================================');

          // =================================================
          // NAVIGATE BACK TO PACKAGE LIST
          // =================================================

          try {
            const navigationSuccessful = await this.router.navigate(['/packages']);

            console.log('NAVIGATION TO PACKAGES RESULT:', navigationSuccessful);
          } catch (navigationError) {
            console.error('ERROR NAVIGATING TO PACKAGES:', navigationError);

            this.errorMessage =
              'Package was updated, but navigation back to the package list failed.';

            this.cdr.detectChanges();
          }
        },

        // =================================================
        // ERROR
        // =================================================

        error: (error) => {
          console.error('=================================');
          console.error('UPDATE PACKAGE ERROR');
          console.error('=================================');
          console.error('ERROR:', error);
          console.error('STATUS:', error?.status);
          console.error('ERROR BODY:', error?.error);
          console.error('=================================');

          this.errorMessage =
            error?.error?.message ??
            error?.error?.title ??
            error?.message ??
            'Unable to update the package. Please try again.';

          this.cdr.detectChanges();
        },
      });
  }

  // =====================================================
  // CANCEL
  // =====================================================

  cancel(): void {
    console.log('CANCEL EDIT PACKAGE');

    this.router.navigate(['/packages']);
  }
}
