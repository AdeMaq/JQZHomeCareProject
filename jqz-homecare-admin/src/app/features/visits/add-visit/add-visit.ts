import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
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

  /*
   * These are UI values.
   *
   * They are converted to the numeric backend enum
   * immediately before the API request is sent.
   *
   * FullAdvance = 0
   * Installment = 1
   */
  paymentType: 'FullAdvance' | 'Installment';

  initialAmountPaid: number | null;

  visitAssignments: VisitAssignmentForm[];
}

// ============================================================
// BACKEND CREATE VISIT PAYLOAD
// ============================================================

interface CreateVisitPayload {
  patientName: string;
  patientPhone: string;
  locationAddress: string;

  packageId: string;

  paymentType: 0 | 1;

  initialAmountPaid: number | null;

  visitAssignments: {
    practitionerId: string | null;
    areaId: string | null;
    scheduledDate: string | null;
    slotStart: string | null;
    slotEnd: string | null;
  }[];
}

// ============================================================
// DROPDOWN TYPE
// ============================================================

type OpenDropdown = {
  type: 'area' | 'practitioner';
  index: number;
} | null;

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
  // SEARCHABLE DROPDOWN STATE
  // ============================================================

  /*
   * Keeps track of which dropdown is currently open.
   *
   * Only one dropdown is open at a time.
   */
  openDropdown: OpenDropdown = null;

  /*
   * Search text for every Area assignment row.
   *
   * Example:
   *
   * areaSearchTerms[0] = "kamran"
   * areaSearchTerms[1] = "tank"
   */
  areaSearchTerms: Record<number, string> = {};

  /*
   * Search text for every Practitioner assignment row.
   */
  practitionerSearchTerms: Record<number, string> = {};

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
  // CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  // ============================================================

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdown();
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

        console.log('Packages loaded:', this.packages);

        this.loadPractitioners();
      },

      error: (error: unknown) => {
        console.error('Failed to load packages:', error);

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load packages. Please try again.',
        );

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

        console.log('Practitioners loaded:', this.practitioners);

        this.loadAreas();
      },

      error: (error: unknown) => {
        console.error('Failed to load practitioners:', error);

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load practitioners. Please try again.',
        );

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

        console.log('Areas loaded:', this.areas);

        this.isLoading = false;
      },

      error: (error: unknown) => {
        console.error('Failed to load areas:', error);

        this.errorMessage = this.getErrorMessage(error, 'Unable to load areas. Please try again.');

        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // PACKAGE CHANGE
  // ============================================================

  onPackageChange(): void {
    this.selectedPackage = this.packages.find((pkg) => pkg.id === this.form.packageId) ?? null;

    /*
     * Close any currently open dropdown when the package
     * changes.
     */
    this.closeDropdown();

    /*
     * Reset searchable dropdown state because the assignment
     * rows are about to be recreated.
     */
    this.areaSearchTerms = {};

    this.practitionerSearchTerms = {};

    if (!this.selectedPackage) {
      this.form.visitAssignments = [];

      return;
    }

    /*
     * Reset installment amount whenever the package changes.
     */
    this.form.initialAmountPaid = null;

    /*
     * Create one assignment row for every visit
     * contained in the selected package.
     */
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
  // OPEN AREA DROPDOWN
  // ============================================================

  openAreaDropdown(index: number): void {
    /*
     * Stop the document click handler from immediately
     * closing the dropdown.
     */
    this.openDropdown = {
      type: 'area',
      index,
    };

    /*
     * Start with an empty search whenever the dropdown opens.
     *
     * The selected Area is still displayed while the dropdown
     * is closed.
     */
    this.areaSearchTerms[index] = '';
  }

  // ============================================================
  // OPEN PRACTITIONER DROPDOWN
  // ============================================================

  openPractitionerDropdown(index: number): void {
    this.openDropdown = {
      type: 'practitioner',
      index,
    };

    /*
     * Start with an empty search whenever the dropdown opens.
     */
    this.practitionerSearchTerms[index] = '';
  }

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  closeDropdown(): void {
    this.openDropdown = null;
  }

  // ============================================================
  // CHECK DROPDOWN STATE
  // ============================================================

  isAreaDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'area' && this.openDropdown.index === index;
  }

  isPractitionerDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'practitioner' && this.openDropdown.index === index;
  }

  // ============================================================
  // AREA SEARCH
  // ============================================================

  onAreaSearch(index: number, searchValue: string): void {
    this.areaSearchTerms[index] = searchValue;

    this.openDropdown = {
      type: 'area',
      index,
    };
  }

  // ============================================================
  // GET FILTERED AREAS
  // ============================================================

  getFilteredAreas(index: number): Area[] {
    const search = (this.areaSearchTerms[index] ?? '').trim().toLowerCase();

    if (!search) {
      return this.areas;
    }

    return this.areas.filter((area) => {
      const areaName = (area.name ?? '').toLowerCase();

      const cityName = (area.cityName ?? '').toLowerCase();

      return areaName.includes(search) || cityName.includes(search);
    });
  }

  // ============================================================
  // GET SELECTED AREA NAME
  // ============================================================

  getSelectedAreaName(index: number): string {
    const assignment = this.form.visitAssignments[index];

    if (!assignment?.areaId) {
      return '';
    }

    const area = this.areas.find((item) => item.id === assignment.areaId);

    if (!area) {
      return '';
    }

    return area.cityName ? `${area.name} — ${area.cityName}` : area.name;
  }

  // ============================================================
  // SELECT AREA
  // ============================================================

  selectArea(index: number, area: Area): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    /*
     * Set the selected Area.
     */
    assignment.areaId = area.id;

    /*
     * Keep the selected Area visible after selection.
     */
    this.areaSearchTerms[index] = area.cityName ? `${area.name} — ${area.cityName}` : area.name;

    /*
     * IMPORTANT:
     *
     * onAreaChange() no longer clears a practitioner who is
     * not assigned to this Area.
     *
     * Instead, it only causes the practitioner list to be
     * recalculated and prioritized.
     */
    this.onAreaChange(index);

    this.closeDropdown();
  }

  // ============================================================
  // GET PRACTITIONERS FOR ASSIGNMENT
  // ============================================================

  getPractitionersForAssignment(index: number): Practitioner[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return [];
    }

    /*
     * IMPORTANT:
     *
     * All loaded practitioners remain available.
     *
     * We intentionally do NOT filter by:
     *
     * - selected Area
     * - selected Package service
     *
     * The selected Area only controls the ordering.
     */
    let result = [...this.practitioners];

    /*
     * Apply Practitioner search AFTER taking the complete
     * practitioner list.
     *
     * Therefore searching always searches across all
     * practitioners.
     */
    const search = (this.practitionerSearchTerms[index] ?? '').trim().toLowerCase();

    if (search) {
      result = result.filter((practitioner) =>
        (practitioner.name ?? '').toLowerCase().includes(search),
      );
    }

    /*
     * If an Area is selected, prioritize practitioners who
     * are already assigned to that Area.
     *
     * Practitioners who are not assigned to that Area are
     * still kept in the list.
     */
    if (assignment.areaId) {
      const selectedAreaId = assignment.areaId;

      result.sort((a, b) => {
        const aAssigned = a.areas?.some((area) => area.id === selectedAreaId) ?? false;

        const bAssigned = b.areas?.some((area) => area.id === selectedAreaId) ?? false;

        if (aAssigned && !bAssigned) {
          return -1;
        }

        if (!aAssigned && bAssigned) {
          return 1;
        }

        return 0;
      });
    }

    return result;
  }

  // ============================================================
  // GET SELECTED PRACTITIONER NAME
  // ============================================================

  getSelectedPractitionerName(index: number): string {
    const assignment = this.form.visitAssignments[index];

    if (!assignment?.practitionerId) {
      return '';
    }

    const practitioner = this.practitioners.find((item) => item.id === assignment.practitionerId);

    return practitioner?.name ?? '';
  }

  // ============================================================
  // PRACTITIONER SEARCH
  // ============================================================

  onPractitionerSearch(index: number, searchValue: string): void {
    this.practitionerSearchTerms[index] = searchValue;

    this.openDropdown = {
      type: 'practitioner',
      index,
    };
  }

  // ============================================================
  // SELECT PRACTITIONER
  // ============================================================

  selectPractitioner(index: number, practitioner: Practitioner): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    /*
     * Select the practitioner.
     */
    assignment.practitionerId = practitioner.id;

    /*
     * Keep the selected practitioner name visible.
     */
    this.practitionerSearchTerms[index] = practitioner.name;

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT clear the selected Area.
     *
     * A practitioner can be intentionally selected even if
     * they have not previously been assigned to the selected
     * Area.
     */
    this.onPractitionerChange(index);

    this.closeDropdown();
  }

  // ============================================================
  // PRACTITIONER CHANGE
  // ============================================================

  onPractitionerChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    /*
     * IMPORTANT:
     *
     * We intentionally do NOT clear assignment.areaId here.
     *
     * The business requirement allows a practitioner to be
     * selected even when that practitioner is not already
     * assigned to the selected Area.
     *
     * Therefore this method is intentionally kept as a
     * no-op for Area validation.
     */
  }

  // ============================================================
  // GET AREAS FOR ASSIGNMENT
  // ============================================================

  getAreasForAssignment(index: number): Area[] {
    /*
     * The Area dropdown must always contain ALL available
     * areas.
     *
     * It is no longer restricted by the selected practitioner.
     */
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

    /*
     * IMPORTANT:
     *
     * Do NOT clear assignment.practitionerId.
     *
     * Changing the Area only changes the priority ordering
     * inside getPractitionersForAssignment().
     *
     * The selected practitioner remains selected even if
     * they are not assigned to the new Area.
     */
  }

  // ============================================================
  // ASSIGNMENT DATE CHANGE
  // ============================================================

  onAssignmentDateChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    /*
     * Schedule conflict validation is handled by
     * the backend.
     */
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
  // CONVERT PAYMENT TYPE TO BACKEND ENUM
  // ============================================================

  private getPaymentTypeValue(): 0 | 1 {
    /*
     * Backend PackagePaymentType enum:
     *
     * 0 = FullAdvance
     * 1 = Installment
     */
    return this.form.paymentType === 'FullAdvance' ? 0 : 1;
  }

  // ============================================================
  // SUBMIT VISIT
  // ============================================================

  submitVisit(): void {
    /*
     * Prevent duplicate submissions.
     */
    if (this.isSubmitting) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    // ==========================================================
    // BASIC VALIDATION
    // ==========================================================

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

    // ==========================================================
    // INSTALLMENT VALIDATION
    // ==========================================================

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

    // ==========================================================
    // ASSIGNMENT VALIDATION
    // ==========================================================

    for (let i = 0; i < this.form.visitAssignments.length; i++) {
      const assignment = this.form.visitAssignments[i];

      /*
       * Check partial scheduling.
       */
      if (this.hasPartialSchedule(assignment)) {
        this.errorMessage = `Visit #${i + 1}: Scheduled date, start time and end time must all be provided together.`;

        return;
      }

      /*
       * Check time order.
       */
      if (
        assignment.slotStart &&
        assignment.slotEnd &&
        assignment.slotStart >= assignment.slotEnd
      ) {
        this.errorMessage = `Visit #${i + 1}: End time must be later than start time.`;

        return;
      }
    }

    // ==========================================================
    // CREATE ACTUAL BACKEND PAYLOAD
    // ==========================================================

    const payload: CreateVisitPayload = {
      patientName: this.form.patientName.trim(),

      patientPhone: this.form.patientPhone.trim(),

      locationAddress: this.form.locationAddress.trim(),

      packageId: this.form.packageId,

      paymentType: this.getPaymentTypeValue(),

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

    // ==========================================================
    // DEBUG LOGGING
    // ==========================================================

    console.log('================================================');

    console.log('CREATE VISIT REQUEST');

    console.log('Payload sent to backend:', payload);

    console.log(
      'Payment Type:',
      payload.paymentType,
      payload.paymentType === 0 ? '(FullAdvance)' : '(Installment)',
    );

    console.log('Package:', this.selectedPackage);

    console.log('Assignments:', payload.visitAssignments);

    console.log('================================================');

    // ==========================================================
    // START SUBMISSION
    // ==========================================================

    this.isSubmitting = true;

    // ==========================================================
    // API REQUEST
    // ==========================================================

    this.visitsService.create(payload as unknown as CreateVisitRequest).subscribe({
      // ======================================================
      // SUCCESS
      // ======================================================

      next: (response: unknown) => {
        console.log('================================================');

        console.log('VISIT CREATED SUCCESSFULLY');

        console.log('API RESPONSE:', response);

        console.log('================================================');

        this.isSubmitting = false;

        this.successMessage = 'Visit package created successfully.';

        this.router.navigate(['/visits']);
      },

      // ======================================================
      // ERROR
      // ======================================================

      error: (error: unknown) => {
        console.error('================================================');

        console.error('FAILED TO CREATE VISIT');

        console.error('HTTP ERROR:', error);

        console.error('================================================');

        this.isSubmitting = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Failed to create the visit. Please try again.',
        );

        console.error('Create Visit Error Message:', this.errorMessage);
      },

      // ======================================================
      // COMPLETE
      // ======================================================

      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown, fallbackMessage: string): string {
    console.error('Processed API error:', error);

    if (typeof error === 'object' && error !== null) {
      const response = error as {
        status?: number;

        message?: string;

        error?: {
          message?: string;

          title?: string;

          detail?: string;

          errors?: Record<string, string[]>;
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

      if (response.error?.errors) {
        const validationErrors = Object.values(response.error.errors)
          .flat()
          .filter(
            (message): message is string =>
              typeof message === 'string' && message.trim().length > 0,
          );

        if (validationErrors.length > 0) {
          return validationErrors.join(' ');
        }
      }

      if (response.message && response.message.trim().length > 0) {
        return response.message;
      }

      if ((response.status ?? 0) >= 500) {
        return 'The server encountered an error while creating the visit. Please try again.';
      }

      if ((response.status ?? 0) >= 400) {
        return 'The visit could not be created. Please check the entered information and try again.';
      }
    }

    return fallbackMessage;
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.router.navigate(['/visits']);
  }
}
