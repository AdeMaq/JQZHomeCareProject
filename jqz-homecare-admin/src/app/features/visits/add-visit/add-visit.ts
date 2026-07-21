import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Area, CreateVisit, Package, Practitioner, Service } from './add-visit.interface';

import { AddVisitService } from './add-visit.service';

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-visit.html',
  styleUrl: './add-visit.css',
})
export class AddVisit implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private addVisitService = inject(AddVisitService);
  private platformId = inject(PLATFORM_ID);
  // =========================
  // DROPDOWN DATA
  // =========================

  practitioners: Practitioner[] = [];
  areas: Area[] = [];
  services: Service[] = [];
  packages: Package[] = [];

  // =========================
  // UI STATE
  // =========================

  isLoading = false;
  isSubmitting = false;
  errorMessage = '';

  // =========================
  // FORM
  // =========================

  visitForm = this.fb.group({
    patientName: ['', Validators.required],

    patientPhone: ['', Validators.required],

    locationAddress: ['', Validators.required],

    practitionerId: ['', Validators.required],

    areaId: ['', Validators.required],

    serviceId: ['', Validators.required],

    packageId: [''],

    scheduledDate: [this.getTodayDate(), Validators.required],

    timeSlot: ['', Validators.required],

    amountDue: [0, [Validators.required, Validators.min(0)]],
  });

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.watchPractitionerChanges();

    this.watchPackageChanges();

    if (isPlatformBrowser(this.platformId)) {
      this.loadFormData();
    }
  }

  // =========================
  // LOAD DROPDOWN DATA
  // =========================

  loadFormData(): void {
    this.isLoading = true;

    this.addVisitService.getPractitioners().subscribe({
      next: (response) => {
        this.practitioners = response;
      },

      error: (error) => {
        console.error('Error loading practitioners:', error);

        this.errorMessage = 'Unable to load practitioners.';
      },
    });

    this.addVisitService.getServices().subscribe({
      next: (response) => {
        this.services = response;
      },

      error: (error) => {
        console.error('Error loading services:', error);

        this.errorMessage = 'Unable to load services.';
      },
    });

    this.addVisitService.getPackages().subscribe({
      next: (response) => {
        this.packages = response;

        this.isLoading = false;
      },

      error: (error) => {
        console.error('Error loading packages:', error);

        this.errorMessage = 'Unable to load packages.';

        this.isLoading = false;
      },
    });
  }

  // =========================
  // PRACTITIONER CHANGE
  // =========================

  watchPractitionerChanges(): void {
    this.visitForm.controls.practitionerId.valueChanges.subscribe((practitionerId) => {
      this.areas = [];

      this.visitForm.patchValue({
        areaId: '',
      });

      if (!practitionerId) {
        return;
      }

      this.addVisitService.getPractitionerAreas(practitionerId).subscribe({
        next: (response) => {
          this.areas = response;
        },

        error: (error) => {
          console.error('Error loading practitioner areas:', error);

          this.errorMessage = 'Unable to load practitioner areas.';
        },
      });
    });
  }

  // =========================
  // PACKAGE CHANGE
  // =========================

  watchPackageChanges(): void {
    this.visitForm.controls.packageId.valueChanges.subscribe((packageId) => {
      if (!packageId) {
        this.visitForm.patchValue({
          amountDue: 0,
        });

        return;
      }

      const selectedPackage = this.packages.find((pkg) => pkg.id === packageId);

      if (selectedPackage) {
        this.visitForm.patchValue({
          amountDue: selectedPackage.amount,
        });
      }
    });
  }

  // =========================
  // CREATE VISIT
  // =========================

  onSubmit(): void {
    if (this.visitForm.invalid) {
      this.visitForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.errorMessage = '';

    const visitData: CreateVisit = {
      patientName: this.visitForm.value.patientName ?? '',

      patientPhone: this.visitForm.value.patientPhone ?? '',

      locationAddress: this.visitForm.value.locationAddress ?? '',

      practitionerId: this.visitForm.value.practitionerId ?? '',

      areaId: this.visitForm.value.areaId ?? '',

      serviceId: this.visitForm.value.serviceId ?? '',

      packageId: this.visitForm.value.packageId || null,

      scheduledDate: this.visitForm.value.scheduledDate ?? '',

      timeSlot: this.visitForm.value.timeSlot ?? '',

      amountDue: Number(this.visitForm.value.amountDue ?? 0),
    };

    console.log('CREATE VISIT PAYLOAD:', visitData);

    this.addVisitService.createVisit(visitData).subscribe({
      next: (response) => {
        console.log('VISIT CREATED SUCCESSFULLY:', response);

        this.isSubmitting = false;

        this.router.navigate(['/visits']);
      },

      error: (error) => {
        console.error('Error creating visit:', error);

        this.errorMessage = error?.error?.message ?? 'Unable to create visit.';

        this.isSubmitting = false;
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  onCancel(): void {
    this.router.navigate(['/visits']);
  }

  // =========================
  // HELPER METHODS
  // =========================

  private getTodayDate(): string {
    const today = new Date();

    return today.toISOString().split('T')[0];
  }
}
