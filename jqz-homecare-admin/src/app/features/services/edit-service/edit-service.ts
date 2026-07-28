import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  ServiceService,
  ServiceCategory,
  UpdateServiceRequest,
} from '../../../core/services/service';

@Component({
  selector: 'app-edit-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-service.html',
  styleUrl: './edit-service.css',
})
export class EditService implements OnInit {
  // =========================
  // DEPENDENCIES
  // =========================

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serviceService = inject(ServiceService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // STATE
  // =========================

  serviceId = '';

  categories: ServiceCategory[] = [];

  isLoading = true;
  isSaving = false;

  successMessage = '';
  errorMessage = '';

  // =========================
  // FORM
  // =========================

  serviceForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    serviceCategoryId: ['', Validators.required],
    description: [''],
  });

  // =========================
  // FORM CONTROLS
  // =========================

  get nameControl() {
    return this.serviceForm.controls.name;
  }

  get categoryControl() {
    return this.serviceForm.controls.serviceCategoryId;
  }

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.serviceId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('EDIT SERVICE ID:', this.serviceId);

    if (!this.serviceId) {
      this.errorMessage = 'Service ID was not provided.';
      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }

    this.loadService();
  }

  // =========================
  // LOAD SERVICE
  // =========================

  loadService(): void {
    if (!this.serviceId) {
      this.errorMessage = 'Service ID was not provided.';
      this.isLoading = false;

      this.cdr.detectChanges();

      return;
    }

    console.log('LOADING EDIT SERVICE DATA...');

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.detectChanges();

    // Load categories first
    this.serviceService.getServiceCategories().subscribe({
      next: (categories) => {
        console.log('CATEGORIES RESPONSE:', categories);

        this.categories = categories;

        // Then load service
        this.serviceService.getServiceById(this.serviceId).subscribe({
          next: (service) => {
            console.log('SERVICE RESPONSE:', service);

            this.serviceForm.patchValue({
              name: service.name,
              serviceCategoryId: service.serviceCategoryId,
              description: service.description ?? '',
            });

            console.log('FORM VALUE:', this.serviceForm.getRawValue());

            this.isLoading = false;

            console.log('IS LOADING:', this.isLoading);

            // Force Angular to update the UI
            this.cdr.detectChanges();
          },

          error: (error) => {
            console.error('Error loading service:', error);

            this.errorMessage = 'Unable to load the service. Please try again.';

            this.isLoading = false;

            // Force Angular to update the UI
            this.cdr.detectChanges();
          },
        });
      },

      error: (error) => {
        console.error('Error loading service categories:', error);

        this.errorMessage = 'Unable to load service categories. Please try again.';

        this.isLoading = false;

        // Force Angular to update the UI
        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // UPDATE SERVICE
  // =========================

  updateService(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();

      this.cdr.detectChanges();

      return;
    }

    if (!this.serviceId) {
      this.errorMessage = 'Service ID was not provided.';

      this.cdr.detectChanges();

      return;
    }

    const formValue = this.serviceForm.getRawValue();

    const request: UpdateServiceRequest = {
      name: formValue.name?.trim() ?? '',
      description: formValue.description?.trim() || null,
    };

    console.log('UPDATE SERVICE REQUEST:', request);

    this.isSaving = true;

    this.cdr.detectChanges();

    this.serviceService.updateService(this.serviceId, request).subscribe({
      next: () => {
        console.log('SERVICE UPDATED SUCCESSFULLY');

        this.isSaving = false;
        this.successMessage = 'Service updated successfully.';

        this.cdr.detectChanges();

        setTimeout(() => {
          this.router.navigate(['/services']);
        }, 1000);
      },

      error: (error) => {
        console.error('Error updating service:', error);

        this.isSaving = false;
        this.errorMessage = 'Unable to update the service. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    if (this.isSaving) {
      return;
    }

    this.router.navigate(['/services']);
  }
}
