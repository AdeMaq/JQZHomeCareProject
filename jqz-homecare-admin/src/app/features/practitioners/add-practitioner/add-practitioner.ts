import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  Area,
  CreatePractitionerRequest,
  PractitionerService,
  Service,
} from '../../../core/services/practitioner';

@Component({
  selector: 'app-add-practitioner',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-practitioner.html',
  styleUrl: './add-practitioner.css',
})
export class AddPractitioner implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // FORM
  // =========================

  practitionerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],

    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],

    password: ['', [Validators.required, Validators.minLength(6)]],

    phone: ['', [Validators.required, Validators.maxLength(30)]],

    serviceId: ['', Validators.required],

    education: ['', [Validators.required, Validators.maxLength(200)]],

    priority: [0, [Validators.required, Validators.min(0)]],

    sharePercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  // =========================
  // DATA
  // =========================

  services: Service[] = [];

  areas: Area[] = [];

  selectedAreaIds: string[] = [];

  // =========================
  // STATE
  // =========================

  isLoading = true;

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.loadFormData();
  }

  // =========================
  // LOAD SERVICES + AREAS
  // =========================

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      services: this.practitionerService.getServices(),
      areas: this.practitionerService.getAreas(),
    }).subscribe({
      next: ({ services, areas }) => {
        console.log('SERVICES LOADED:', services);
        console.log('AREAS LOADED:', areas);

        this.services = Array.isArray(services) ? services : [];
        this.areas = Array.isArray(areas) ? areas : [];

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('FORM DATA LOADING COMPLETE');
        console.log('isLoading:', this.isLoading);
      },

      error: (error) => {
        console.error('Unable to load practitioner form data:', error);

        this.services = [];
        this.areas = [];

        this.errorMessage =
          error?.error?.message ??
          error?.error?.title ??
          error?.message ??
          'Unable to load form data. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('FORM DATA LOADING FAILED');
        console.log('isLoading:', this.isLoading);
      },
    });
  }

  // =========================
  // AREA SELECTION
  // =========================

  toggleArea(areaId: string): void {
    const index = this.selectedAreaIds.indexOf(areaId);

    if (index === -1) {
      this.selectedAreaIds.push(areaId);
    } else {
      this.selectedAreaIds.splice(index, 1);
    }
  }

  isAreaSelected(areaId: string): boolean {
    return this.selectedAreaIds.includes(areaId);
  }

  // =========================
  // FORM HELPERS
  // =========================

  isInvalid(controlName: string): boolean {
    const control = this.practitionerForm.get(controlName);

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: string): string {
    const control = this.practitionerForm.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }

    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
    }

    if (control.errors['min']) {
      return `Value must be at least ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      return `Value cannot be greater than ${control.errors['max'].max}.`;
    }

    return 'Invalid value.';
  }

  // =========================
  // SUBMIT
  // =========================

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.practitionerForm.markAllAsTouched();

    if (this.practitionerForm.invalid) {
      return;
    }

    const formValue = this.practitionerForm.getRawValue();

    const request: CreatePractitionerRequest = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      password: formValue.password,
      phone: formValue.phone.trim(),
      serviceId: formValue.serviceId,
      education: formValue.education.trim(),
      priority: Number(formValue.priority),
      sharePercentage: Number(formValue.sharePercentage),
      areaIds: [...this.selectedAreaIds],
    };

    this.isSubmitting = true;

    this.practitionerService.createPractitioner(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.router.navigate(['/practitioners']);
      },

      error: (error) => {
        console.error('Unable to create practitioner:', error);

        this.errorMessage =
          error?.error?.message ??
          error?.error?.title ??
          error?.message ??
          'Unable to create practitioner. Please try again.';

        this.isSubmitting = false;
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    this.router.navigate(['/practitioners']);
  }
}
