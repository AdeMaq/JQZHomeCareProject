import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Package, PackageService } from '../../../core/services/package';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

import { Area, CityAreaService } from '../../../core/services/city-area';

import { CreateVisitRequest, VisitsService } from '../visits.service';

// ============================================================
// VISIT ASSIGNMENT MODEL
// ============================================================

interface VisitAssignmentForm {
  practitionerId: string | null;
  areaId: string | null;
  scheduledDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
}

// ============================================================
// ADD VISIT FORM MODEL
// ============================================================

interface AddVisitForm {
  patientName: string;
  patientPhone: string;
  locationAddress: string;

  packageId: string;

  paymentType: 'FullAdvance' | 'Installment';

  initialAmountPaid: number | null;

  visitAssignments: VisitAssignmentForm[];
}

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-add-visit',
  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './add-visit.html',
  styleUrl: './add-visit.css',
})
export class AddVisit implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly router = inject(Router);

  private readonly visitsService = inject(VisitsService);

  private readonly packageService = inject(PackageService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cityAreaService = inject(CityAreaService);

  // ============================================================
  // DATA
  // ============================================================

  packages: Package[] = [];

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  // ============================================================
  // SELECTED PACKAGE
  // ============================================================

  selectedPackage: Package | null = null;

  // ============================================================
  // LOADING STATES
  // ============================================================

  isLoading = false;

  isSubmitting = false;

  // ============================================================
  // ERROR / SUCCESS MESSAGES
  // ============================================================

  errorMessage = '';

  successMessage = '';

  // ============================================================
  // FORM
  // ============================================================

  form: AddVisitForm = {
    patientName: '',
    patientPhone: '',
    locationAddress: '',

    packageId: '',

    paymentType: 'FullAdvance',

    initialAmountPaid: null,

    visitAssignments: [],
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ============================================================
  // LOAD INITIAL DATA
  // ============================================================

  private loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages;

        this.loadPractitioners();
      },

      error: (error: unknown) => {
        console.error('Failed to load packages:', error);

        this.errorMessage = 'Unable to load packages. Please try again.';

        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // LOAD PRACTITIONERS
  // ============================================================

  private loadPractitioners(): void {
    this.practitionerService.getPractitioners().subscribe({
      next: (practitioners) => {
        this.practitioners = practitioners;

        this.loadAreas();
      },

      error: (error: unknown) => {
        console.error('Failed to load practitioners:', error);

        this.errorMessage = 'Unable to load practitioners. Please try again.';

        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // LOAD AREAS
  // ============================================================

  private loadAreas(): void {
    this.cityAreaService.getAreas().subscribe({
      next: (areas) => {
        this.areas = areas;

        this.isLoading = false;
      },

      error: (error: unknown) => {
        console.error('Failed to load areas:', error);

        this.errorMessage = 'Unable to load areas. Please try again.';

        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // PACKAGE CHANGE
  // ============================================================

  onPackageChange(): void {
    this.selectedPackage = this.packages.find((pkg) => pkg.id === this.form.packageId) ?? null;

    if (!this.selectedPackage) {
      this.form.visitAssignments = [];
      return;
    }

    // Reset installment amount when package changes.
    this.form.initialAmountPaid = null;

    // Create one assignment row for every visit
    // included in the selected package.
    this.form.visitAssignments = Array.from(
      {
        length: this.selectedPackage.numberOfVisits,
      },
      () => this.createEmptyAssignment(),
    );
  }

  // ============================================================
  // CREATE EMPTY ASSIGNMENT
  // ============================================================

  private createEmptyAssignment(): VisitAssignmentForm {
    return {
      practitionerId: null,
      areaId: null,
      scheduledDate: null,
      slotStart: null,
      slotEnd: null,
    };
  }

  // ============================================================
  // GET PENDING AMOUNT
  // ============================================================

  getPendingAmount(): number {
    if (!this.selectedPackage) {
      return 0;
    }

    const initialPaid = Number(this.form.initialAmountPaid) || 0;

    return Math.max(0, this.selectedPackage.amount - initialPaid);
  }

  // ============================================================
  // PAYMENT TYPE CHANGE
  // ============================================================

  onPaymentTypeChange(): void {
    if (this.form.paymentType === 'FullAdvance') {
      this.form.initialAmountPaid = null;
    }
  }

  // ============================================================
  // GET PRACTITIONERS FOR ASSIGNMENT
  // ============================================================

  getPractitionersForAssignment(index: number): Practitioner[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return [];
    }

    // If no package is selected, return nothing.
    if (!this.selectedPackage) {
      return [];
    }

    // Filter practitioners according to the package's service.
    let result = this.practitioners.filter(
      (practitioner) => practitioner.serviceId === this.selectedPackage!.serviceId,
    );

    // If an area has already been selected,
    // only show practitioners who work in that area.
    if (assignment.areaId) {
      result = result.filter((practitioner) =>
        practitioner.areas.some((area) => area.id === assignment.areaId),
      );
    }

    return result;
  }

  // ============================================================
  // PRACTITIONER CHANGE
  // ============================================================

  onPractitionerChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    // If the currently selected area does not belong
    // to the newly selected practitioner, clear it.
    if (assignment.practitionerId && assignment.areaId) {
      const practitioner = this.practitioners.find((p) => p.id === assignment.practitionerId);

      const hasArea = practitioner?.areas.some((area) => area.id === assignment.areaId) ?? false;

      if (!hasArea) {
        assignment.areaId = null;
      }
    }
  }

  // ============================================================
  // GET AREAS FOR ASSIGNMENT
  // ============================================================

  getAreasForAssignment(index: number): Area[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return [];
    }

    // If a practitioner has been selected,
    // only show their assigned areas.
    if (assignment.practitionerId) {
      const practitioner = this.practitioners.find((p) => p.id === assignment.practitionerId);

      if (!practitioner) {
        return [];
      }

      const practitionerAreaIds = new Set(practitioner.areas.map((area) => area.id));

      return this.areas.filter((area) => practitionerAreaIds.has(area.id));
    }

    // Otherwise show all areas.
    return this.areas;
  }

  // ============================================================
  // AREA CHANGE
  // ============================================================

  onAreaChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    // If practitioner is already selected,
    // make sure that practitioner belongs to the
    // selected area.
    if (assignment.areaId && assignment.practitionerId) {
      const practitioner = this.practitioners.find((p) => p.id === assignment.practitionerId);

      const valid = practitioner?.areas.some((area) => area.id === assignment.areaId) ?? false;

      if (!valid) {
        assignment.practitionerId = null;
      }
    }
  }

  // ============================================================
  // ASSIGNMENT DATE CHANGE
  // ============================================================

  onAssignmentDateChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    // No additional API call is required here.
    //
    // The actual conflict validation is performed
    // by the backend when the visit is created.
  }

  // ============================================================
  // CHECK PARTIAL SCHEDULE
  // ============================================================

  hasPartialSchedule(assignment: VisitAssignmentForm): boolean {
    const hasDate = !!assignment.scheduledDate;

    const hasStart = !!assignment.slotStart;

    const hasEnd = !!assignment.slotEnd;

    const hasAny = hasDate || hasStart || hasEnd;

    const hasAll = hasDate && hasStart && hasEnd;

    return hasAny && !hasAll;
  }

  // ============================================================
  // SUBMIT VISIT
  // ============================================================

  submitVisit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!this.form.patientName.trim()) {
      this.errorMessage = 'Patient name is required.';
      return;
    }

    if (!this.form.patientPhone.trim()) {
      this.errorMessage = 'Patient phone is required.';
      return;
    }

    if (!this.form.locationAddress.trim()) {
      this.errorMessage = 'Patient location address is required.';
      return;
    }

    if (!this.form.packageId) {
      this.errorMessage = 'Please select a package.';
      return;
    }

    if (!this.selectedPackage) {
      this.errorMessage = 'Selected package could not be found.';
      return;
    }

    // ----------------------------------------------------------
    // INSTALLMENT VALIDATION
    // ----------------------------------------------------------

    if (this.form.paymentType === 'Installment') {
      if (this.form.initialAmountPaid === null || this.form.initialAmountPaid === undefined) {
        this.errorMessage = 'Initial amount paid is required for installment payment.';
        return;
      }

      if (this.form.initialAmountPaid < 0) {
        this.errorMessage = 'Initial amount paid cannot be negative.';
        return;
      }

      if (this.form.initialAmountPaid > this.selectedPackage.amount) {
        this.errorMessage = 'Initial amount paid cannot exceed the package amount.';
        return;
      }
    }

    // ----------------------------------------------------------
    // ASSIGNMENT VALIDATION
    // ----------------------------------------------------------

    for (let i = 0; i < this.form.visitAssignments.length; i++) {
      const assignment = this.form.visitAssignments[i];

      if (this.hasPartialSchedule(assignment)) {
        this.errorMessage = `Visit #${i + 1}: Scheduled date, start time and end time must all be provided together.`;

        return;
      }

      if (
        assignment.slotStart &&
        assignment.slotEnd &&
        assignment.slotStart >= assignment.slotEnd
      ) {
        this.errorMessage = `Visit #${i + 1}: End time must be later than start time.`;

        return;
      }
    }

    // ----------------------------------------------------------
    // CREATE REQUEST
    // ----------------------------------------------------------

    const request: CreateVisitRequest = {
      patientName: this.form.patientName.trim(),

      patientPhone: this.form.patientPhone.trim(),

      locationAddress: this.form.locationAddress.trim(),

      packageId: this.form.packageId,

      paymentType: this.form.paymentType,

      initialAmountPaid:
        this.form.paymentType === 'Installment' ? Number(this.form.initialAmountPaid) : null,

      visitAssignments: this.form.visitAssignments.map((assignment) => ({
        practitionerId: assignment.practitionerId,

        areaId: assignment.areaId,

        scheduledDate: assignment.scheduledDate ? assignment.scheduledDate : null,

        slotStart: assignment.slotStart ? assignment.slotStart : null,

        slotEnd: assignment.slotEnd ? assignment.slotEnd : null,
      })),
    };

    // ----------------------------------------------------------
    // SUBMIT
    // ----------------------------------------------------------

    this.isSubmitting = true;

    this.visitsService.create(request).subscribe({
      next: (response: unknown) => {
        console.log('Visit created successfully:', response);

        this.isSubmitting = false;

        this.successMessage = 'Visit package created successfully.';

        // Navigate back to visits list.
        this.router.navigate(['/admin/visits']);
      },

      error: (error: unknown) => {
        console.error('Failed to create visit:', error);

        this.isSubmitting = false;

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const response = error as {
        error?: {
          message?: string;
          title?: string;
          detail?: string;
        };
      };

      if (response.error?.message) {
        return response.error.message;
      }

      if (response.error?.detail) {
        return response.error.detail;
      }

      if (response.error?.title) {
        return response.error.title;
      }
    }

    return 'Failed to create the visit. Please try again.';
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    this.router.navigate(['/admin/visits']);
  }
}
