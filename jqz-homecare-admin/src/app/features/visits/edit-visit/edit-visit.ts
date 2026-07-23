import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { VisitsListService } from '../visits-list/visits-list.service';
import { Visit, UpdateVisitRequest } from '../visits-list/visits-list.interface';

import { AddVisitService } from '../add-visit/add-visit.service';
import { Area, Package, Practitioner, Service } from '../add-visit/add-visit.interface';

@Component({
  selector: 'app-edit-visit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-visit.html',
  styleUrl: './edit-visit.css',
})
export class EditVisit implements OnInit {
  // =====================================================
  // DEPENDENCIES
  // =====================================================

  private readonly fb = inject(FormBuilder);

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly visitsListService = inject(VisitsListService);

  private readonly addVisitService = inject(AddVisitService);

  // =====================================================
  // VISIT ID
  // =====================================================

  visitId = '';

  // =====================================================
  // DROPDOWN DATA
  // =====================================================

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  services: Service[] = [];

  packages: Package[] = [];

  // =====================================================
  // UI STATE
  // =====================================================

  isLoading = true;

  isFormReady = false;

  isSubmitting = false;

  errorMessage = '';

  // =====================================================
  // FORM
  // =====================================================

  visitForm = this.fb.group({
    practitionerId: ['', Validators.required],

    areaId: ['', Validators.required],

    serviceId: ['', Validators.required],

    packageId: [''],

    scheduledDate: ['', Validators.required],

    timeSlot: ['', Validators.required],

    amountDue: [0, [Validators.required, Validators.min(0)]],
  });

  // =====================================================
  // INITIALIZATION
  // =====================================================

  ngOnInit(): void {
    console.log('EDIT VISIT COMPONENT INITIALIZED');

    this.visitId = this.route.snapshot.paramMap.get('id') ?? '';

    console.log('VISIT ID:', this.visitId);

    if (!this.visitId) {
      this.errorMessage = 'Visit ID was not found.';

      this.isLoading = false;

      this.isFormReady = false;

      this.cdr.detectChanges();

      return;
    }

    this.watchPractitionerChanges();

    this.watchPackageChanges();

    this.loadFormData();
  }

  // =====================================================
  // LOAD ALL FORM DATA
  // =====================================================

  loadFormData(): void {
    console.log('LOADING EDIT PAGE DATA');

    this.isLoading = true;

    this.isFormReady = false;

    this.errorMessage = '';

    forkJoin({
      practitioners: this.addVisitService.getPractitioners(),

      services: this.addVisitService.getServices(),

      packages: this.addVisitService.getPackages(),

      visit: this.visitsListService.getVisitById(this.visitId),
    }).subscribe({
      next: (response) => {
        console.log('EDIT PAGE DATA LOADED:', response);

        this.practitioners = response.practitioners;

        this.services = response.services;

        this.packages = response.packages;

        this.loadVisitIntoForm(response.visit);
      },

      error: (error) => {
        console.error('ERROR LOADING EDIT PAGE DATA:', error);

        this.errorMessage = 'Unable to load visit information.';

        this.isLoading = false;

        this.isFormReady = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =====================================================
  // LOAD AREAS AND POPULATE FORM
  // =====================================================

  loadVisitIntoForm(visit: Visit): void {
    console.log('VISIT RECEIVED:', visit);

    this.addVisitService.getPractitionerAreas(visit.practitionerId).subscribe({
      next: (areasResponse) => {
        console.log('AREAS RECEIVED:', areasResponse);

        this.areas = areasResponse;

        // =============================================
        // PATCH VISIT DATA INTO FORM
        // =============================================

        this.visitForm.patchValue(
          {
            practitionerId: visit.practitionerId,

            areaId: visit.areaId,

            serviceId: visit.serviceId,

            packageId: visit.packageId ?? '',

            scheduledDate: this.formatDateForInput(visit.scheduledDate),

            timeSlot: visit.timeSlot,

            amountDue: visit.amountDue,
          },
          {
            emitEvent: false,
          },
        );

        console.log('FORM VALUE AFTER PATCH:', this.visitForm.getRawValue());

        // =============================================
        // FORM IS NOW READY
        // =============================================

        this.isLoading = false;

        this.isFormReady = true;

        console.log('IS LOADING:', this.isLoading);

        console.log('IS FORM READY:', this.isFormReady);

        this.cdr.detectChanges();

        console.log('EDIT FORM LOADED SUCCESSFULLY');
      },

      error: (error) => {
        console.error('ERROR LOADING PRACTITIONER AREAS:', error);

        this.errorMessage = 'Unable to load practitioner areas.';

        this.isLoading = false;

        this.isFormReady = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =====================================================
  // PRACTITIONER CHANGE
  // =====================================================

  watchPractitionerChanges(): void {
    this.visitForm.controls.practitionerId.valueChanges.subscribe((practitionerId) => {
      console.log('PRACTITIONER CHANGED:', practitionerId);

      if (!practitionerId) {
        this.areas = [];

        this.visitForm.patchValue(
          {
            areaId: '',
          },
          {
            emitEvent: false,
          },
        );

        return;
      }

      this.addVisitService.getPractitionerAreas(practitionerId).subscribe({
        next: (response) => {
          console.log('PRACTITIONER AREAS LOADED:', response);

          this.areas = response;

          this.visitForm.patchValue(
            {
              areaId: '',
            },
            {
              emitEvent: false,
            },
          );

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('ERROR LOADING AREAS FOR PRACTITIONER:', error);

          this.errorMessage = 'Unable to load practitioner areas.';

          this.cdr.detectChanges();
        },
      });
    });
  }

  // =====================================================
  // PACKAGE CHANGE
  // =====================================================

  watchPackageChanges(): void {
    this.visitForm.controls.packageId.valueChanges.subscribe((packageId) => {
      console.log('PACKAGE CHANGED:', packageId);

      if (!packageId) {
        return;
      }

      const selectedPackage = this.packages.find((pkg) => pkg.id === packageId);

      if (!selectedPackage) {
        return;
      }

      this.visitForm.patchValue(
        {
          amountDue: selectedPackage.amount,
        },
        {
          emitEvent: false,
        },
      );
    });
  }

  // =====================================================
  // UPDATE VISIT
  // =====================================================

  onSubmit(): void {
    console.log('SUBMIT BUTTON CLICKED');

    if (this.visitForm.invalid) {
      console.log('FORM IS INVALID:', this.visitForm.getRawValue());

      this.visitForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.errorMessage = '';

    const updateRequest: UpdateVisitRequest = {
      practitionerId: this.visitForm.value.practitionerId ?? '',

      areaId: this.visitForm.value.areaId ?? '',

      serviceId: this.visitForm.value.serviceId ?? '',

      packageId: this.visitForm.value.packageId || null,

      scheduledDate: this.visitForm.value.scheduledDate ?? '',

      timeSlot: this.visitForm.value.timeSlot ?? '',

      amountDue: Number(this.visitForm.value.amountDue ?? 0),
    };

    console.log('UPDATE VISIT PAYLOAD:', updateRequest);

    this.visitsListService.updateVisit(this.visitId, updateRequest).subscribe({
      next: () => {
        console.log('VISIT UPDATED SUCCESSFULLY');

        this.isSubmitting = false;

        this.router.navigate(['/visits', this.visitId]);
      },

      error: (error) => {
        console.error('ERROR UPDATING VISIT:', error);

        this.errorMessage = error?.error?.message ?? 'Unable to update visit.';

        this.isSubmitting = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =====================================================
  // CANCEL / BACK
  // =====================================================

  onCancel(): void {
    console.log('CANCEL / BACK BUTTON CLICKED');

    this.router.navigate(['/visits', this.visitId]);
  }

  // =====================================================
  // DATE FORMAT
  // =====================================================

  private formatDateForInput(date: string): string {
    if (!date) {
      return '';
    }

    return date.split('T')[0];
  }
}
