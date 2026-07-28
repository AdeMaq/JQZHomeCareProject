import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  CreateServiceRequest,
  ServiceCategory,
  ServiceService,
} from '../../../core/services/service';

@Component({
  selector: 'app-add-service',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-service.html',
  styleUrl: './add-service.css',
})
export class AddService implements OnInit {
  private serviceService = inject(ServiceService);
  private router = inject(Router);

  // =========================
  // FORM DATA
  // =========================

  serviceName = '';
  serviceCategoryId = '';
  description = '';

  // =========================
  // SERVICE CATEGORIES
  // =========================

  categories: ServiceCategory[] = [];

  // =========================
  // UI STATE
  // =========================

  isLoadingCategories = false;
  isSaving = false;

  errorMessage = '';
  categoryErrorMessage = '';

  // =========================
  // INITIALIZE
  // =========================

  ngOnInit(): void {
    this.loadCategories();
  }

  // =========================
  // LOAD CATEGORIES
  // =========================

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryErrorMessage = '';

    this.serviceService.getServiceCategories().subscribe({
      next: (response) => {
        this.categories = response;
        this.isLoadingCategories = false;
      },

      error: (error) => {
        console.error('Error loading service categories:', error);

        this.categories = [];
        this.isLoadingCategories = false;

        this.categoryErrorMessage = 'Unable to load service categories. Please try again.';
      },
    });
  }

  // =========================
  // CREATE SERVICE
  // =========================

  createService(): void {
    this.errorMessage = '';

    // Remove unnecessary spaces
    this.serviceName = this.serviceName.trim();
    this.description = this.description.trim();

    // =========================
    // VALIDATION
    // =========================

    if (!this.serviceName) {
      this.errorMessage = 'Service name is required.';
      return;
    }

    if (!this.serviceCategoryId) {
      this.errorMessage = 'Please select a service category.';
      return;
    }

    // =========================
    // REQUEST
    // =========================

    const request: CreateServiceRequest = {
      name: this.serviceName,
      serviceCategoryId: this.serviceCategoryId,
      description: this.description || null,
    };

    this.isSaving = true;

    this.serviceService.createService(request).subscribe({
      next: (response) => {
        console.log('Service created successfully:', response);

        this.isSaving = false;

        // Go back to services list
        this.router.navigate(['/services']);
      },

      error: (error) => {
        console.error('Error creating service:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message || 'Unable to create the service. Please try again.';
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    this.router.navigate(['/services']);
  }
}
