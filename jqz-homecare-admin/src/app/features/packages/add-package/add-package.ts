import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Service, ServiceService } from '../../../core/services/service';
import { CreatePackageRequest, PackageService } from '../../../core/services/package-service';

@Component({
  selector: 'app-add-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-package.html',
  styleUrl: './add-package.css',
})
export class AddPackage implements OnInit {
  private readonly packageService = inject(PackageService);
  private readonly serviceService = inject(ServiceService);
  private readonly router = inject(Router);

  // =========================
  // FORM DATA
  // =========================

  packageName = '';
  serviceId = '';
  numberOfVisits: number | null = null;
  amount: number | null = null;

  // =========================
  // SERVICES
  // =========================

  services: Service[] = [];

  // =========================
  // UI STATE
  // =========================

  isLoadingServices = false;
  isSaving = false;

  errorMessage = '';
  serviceErrorMessage = '';

  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {
    this.loadServices();
  }

  // =========================
  // LOAD SERVICES
  // =========================

  loadServices(): void {
    this.isLoadingServices = true;
    this.serviceErrorMessage = '';

    this.serviceService.getServices().subscribe({
      next: (response: Service[]) => {
        this.services = response;
        this.isLoadingServices = false;
      },

      error: (error: unknown) => {
        console.error('Error loading services:', error);

        this.services = [];
        this.isLoadingServices = false;

        this.serviceErrorMessage = 'Unable to load services. Please try again.';
      },
    });
  }

  // =========================
  // PRICE PER VISIT
  // =========================

  get pricePerVisit(): number {
    if (this.amount === null || this.numberOfVisits === null || this.numberOfVisits <= 0) {
      return 0;
    }

    return this.amount / this.numberOfVisits;
  }

  // =========================
  // SAVINGS
  // =========================

  get savings(): number {
    // Savings are currently calculated by the backend.
    // The backend currently returns 0 because Service
    // does not have a standalone visit rate.
    return 0;
  }

  // =========================
  // CREATE PACKAGE
  // =========================

  createPackage(): void {
    this.errorMessage = '';

    // =========================
    // NORMALIZE VALUES
    // =========================

    this.packageName = this.packageName.trim();

    // =========================
    // VALIDATION
    // =========================

    if (!this.packageName) {
      this.errorMessage = 'Package name is required.';
      return;
    }

    if (!this.serviceId) {
      this.errorMessage = 'Please select a service.';
      return;
    }

    if (
      this.numberOfVisits === null ||
      this.numberOfVisits === undefined ||
      this.numberOfVisits < 1
    ) {
      this.errorMessage = 'Number of visits must be at least 1.';
      return;
    }

    if (this.amount === null || this.amount === undefined || this.amount <= 0) {
      this.errorMessage = 'Amount must be greater than 0.';
      return;
    }

    // =========================
    // REQUEST
    // =========================

    const request: CreatePackageRequest = {
      serviceId: this.serviceId,
      name: this.packageName,
      numberOfVisits: this.numberOfVisits,
      amount: this.amount,
    };

    // =========================
    // SAVE
    // =========================

    this.isSaving = true;

    this.packageService.createPackage(request).subscribe({
      next: (response) => {
        console.log('Package created successfully:', response);

        this.isSaving = false;

        // Go back to packages list
        this.router.navigate(['/packages']);
      },

      error: (error: unknown) => {
        console.error('Error creating package:', error);

        this.isSaving = false;

        const apiMessage = (error as any)?.error?.message || (error as any)?.error?.title;

        this.errorMessage = apiMessage || 'Unable to create the package. Please try again.';
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    this.router.navigate(['/packages']);
  }
}
