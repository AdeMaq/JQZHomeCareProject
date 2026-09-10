import { ChangeDetectorRef, Injectable, inject } from '@angular/core';

import { Router } from '@angular/router';

import { VisitsService } from '../visits.service';

import { CreateVisitRequest, VisitAssignment } from '../visits.service';

import { PackagePaymentType, Visit } from '../visits.interface';

import { Package, PackageService } from '../../../core/services/package';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

import { Area, CityAreaService } from '../../../core/services/city-area';

import { Patient, PatientService } from '../../../core/services/patient.service';

import { PatientPackageService } from '../../../core/services/patient-package.service';

import { AddVisitForm, OpenDropdown, PractitionerScheduleItem } from './add-visit.models';

import { AddVisitPatientLogic } from './add-visit.patient.logic';

import { AddVisitPackageLogic } from './add-visit.package.logic';

import { AddVisitPractitionerLogic } from './add-visit.practitioner.logic';

import { AddVisitScheduleLogic } from './add-visit.schedule.logic';

// ============================================================
// ADD VISIT LOGIC
// ============================================================

@Injectable()
export class AddVisitLogic {
  // ============================================================
  // DEPENDENCIES
  // ============================================================

  private readonly router = inject(Router);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly visitsService = inject(VisitsService);

  private readonly packageService = inject(PackageService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cityAreaService = inject(CityAreaService);

  private readonly patientService = inject(PatientService);

  private readonly patientPackageService = inject(PatientPackageService);

  // ============================================================
  // CHILD LOGIC
  // ============================================================

  private readonly packageLogic = new AddVisitPackageLogic();

  private readonly practitionerLogic = new AddVisitPractitionerLogic();

  private readonly scheduleLogic = new AddVisitScheduleLogic(this.visitsService, this.cdr);

  private readonly patientLogic = new AddVisitPatientLogic(
    this.visitsService,
    this.patientService,
    this.patientPackageService,
    this.scheduleLogic,
    this.cdr,
  );

  // ============================================================
  // DATA
  // ============================================================

  packages: Package[] = [];
  practitioners: Practitioner[] = [];
  areas: Area[] = [];

  // ============================================================
  // LOADING
  // ============================================================

  isLoading = false;

  isLoadingPackages = false;
  isLoadingPractitioners = false;
  isLoadingAreas = false;

  isSubmitting = false;

  // ============================================================
  // MESSAGES
  // ============================================================

  errorMessage = '';
  successMessage = '';

  // ============================================================
  // FORM
  // ============================================================

  readonly form: AddVisitForm = {
    patientName: '',
    patientPhone: '',
    locationAddress: '',
    description: '',
    packageId: '',
    paymentType: 'FullAdvance',
    initialAmountPaid: null,
    visitAssignments: [],
  };

  // ============================================================
  // INITIAL DATA
  // ============================================================

  loadInitialData(): void {
    this.isLoading = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.loadPackages();
  }

  // ============================================================
  // LOAD PACKAGES
  // ============================================================

  private loadPackages(): void {
    this.isLoadingPackages = true;

    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages ?? [];

        this.isLoadingPackages = false;

        this.loadPractitioners();
      },

      error: (error: unknown) => {
        this.isLoadingPackages = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // ============================================================
  // LOAD PRACTITIONERS
  // ============================================================

  private loadPractitioners(): void {
    this.isLoadingPractitioners = true;

    this.practitionerService.getPractitioners().subscribe({
      next: (practitioners) => {
        this.practitioners = practitioners ?? [];

        this.isLoadingPractitioners = false;

        this.loadAreas();
      },

      error: (error: unknown) => {
        this.isLoadingPractitioners = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // ============================================================
  // LOAD AREAS
  // ============================================================

  private loadAreas(): void {
    this.isLoadingAreas = true;

    this.cityAreaService.getAreas().subscribe({
      next: (areas) => {
        this.areas = areas ?? [];

        this.isLoadingAreas = false;

        this.isLoading = false;
      },

      error: (error: unknown) => {
        this.isLoadingAreas = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // ============================================================
  // PATIENT GETTERS
  // ============================================================

  get existingPatientSuggestion(): Patient | null {
    return this.patientLogic.existingPatientSuggestion;
  }

  get selectedExistingPatient(): Patient | null {
    return this.patientLogic.selectedExistingPatient;
  }

  get patientLookupLoading(): boolean {
    return this.patientLogic.patientLookupLoading;
  }

  get patientLookupError(): string {
    return this.patientLogic.patientLookupError;
  }

  get patientLookupMessage(): string {
    return this.patientLogic.patientLookupMessage;
  }

  get showExistingPatientSuggestion(): boolean {
    return this.patientLogic.showExistingPatientSuggestion;
  }

  // ============================================================
  // DROPDOWN GETTERS
  // ============================================================

  get openDropdown(): OpenDropdown {
    return this.practitionerLogic.openDropdown;
  }

  get areaSearchTerms(): Record<number, string> {
    return this.practitionerLogic.areaSearchTerms;
  }

  get practitionerSearchTerms(): Record<number, string> {
    return this.practitionerLogic.practitionerSearchTerms;
  }

  // ============================================================
  // SCHEDULE GETTERS
  // ============================================================

  get practitionerVisits(): Record<number, Visit[]> {
    return this.scheduleLogic.practitionerVisits;
  }

  get isLoadingSchedule(): Record<number, boolean> {
    return this.scheduleLogic.isLoadingSchedule;
  }

  get scheduleErrors(): Record<number, string> {
    return this.scheduleLogic.scheduleErrors;
  }

  get scheduleStartHour(): number {
    return this.scheduleLogic.scheduleStartHour;
  }

  get scheduleEndHour(): number {
    return this.scheduleLogic.scheduleEndHour;
  }

  // ============================================================
  // EXISTING PATIENT DATA LOADING
  // ============================================================

  get isLoadingExistingPatientData(): boolean {
    return this.patientLogic.isLoadingExistingPatientData;
  }

  // ============================================================
  // SELECTED PACKAGE
  // ============================================================

  get selectedPackage(): Package | null {
    return this.packageLogic.selectedPackage;
  }

  // ============================================================
  // PATIENT PHONE CHANGE
  // ============================================================

  onPatientPhoneChange(phone: string): void {
    this.patientLogic.onPatientPhoneChange(this.form, phone, () => this.clearPackageSelection());
  }

  // ============================================================
  // PATIENT PHONE BLUR
  // ============================================================

  onPatientPhoneBlur(): void {
    this.patientLogic.onPatientPhoneBlur(this.form);
  }

  // ============================================================
  // SELECT EXISTING PATIENT
  // ============================================================

  selectExistingPatient(patient: Patient): void {
    this.patientLogic.selectExistingPatient(
      patient,
      this.form,
      () => this.clearPackageSelection(),
      (packageId, paymentType, visits) =>
        this.restorePatientPackage(packageId, paymentType, visits),
      () => this.scheduleLogic.resetAll(),
      (index) => this.loadPractitionerSchedule(index),
      this.packages,
      (error: unknown) => this.getErrorMessage(error),
    );
  }

  // ============================================================
  // PACKAGE CHANGE
  // ============================================================

  onPackageChange(restoring = false): void {
    this.errorMessage = '';
    this.successMessage = '';

    this.scheduleLogic.resetAll();

    this.practitionerLogic.resetSearchState();

    if (!restoring) {
      this.form.initialAmountPaid = null;
    }

    this.packageLogic.onPackageChange(this.form, this.packages);

    if (!this.packageLogic.selectedPackage) {
      return;
    }

    if (this.form.paymentType === 'FullAdvance') {
      this.form.initialAmountPaid = this.packageLogic.selectedPackage.amount;
    }
  }

  // ============================================================
  // RESTORE PATIENT PACKAGE
  // ============================================================

  private restorePatientPackage(
    packageId: string,
    paymentType: PackagePaymentType | null,
    visits: Visit[],
  ): void {
    this.form.packageId = packageId;

    this.onPackageChange(true);

    if (paymentType) {
      this.form.paymentType = paymentType;

      if (paymentType === 'FullAdvance' && this.selectedPackage) {
        this.form.initialAmountPaid = this.selectedPackage.amount;
      } else if (paymentType === 'Installment') {
        this.form.initialAmountPaid = null;
      }
    }

    // The actual visit restoration is
    // handled by AddVisitPatientLogic.
    void visits;
  }

  // ============================================================
  // CLEAR PACKAGE SELECTION
  // ============================================================

  private clearPackageSelection(): void {
    this.packageLogic.clearPackageSelection(this.form);

    this.scheduleLogic.resetAll();

    this.practitionerLogic.resetSearchState();
  }

  // ============================================================
  // PAYMENT TYPE CHANGE
  // ============================================================

  onPaymentTypeChange(): void {
    this.packageLogic.onPaymentTypeChange(this.form, this.selectedPackage);
  }

  // ============================================================
  // GET PENDING AMOUNT
  // ============================================================

  getPendingAmount(): number {
    return this.packageLogic.getPendingAmount(this.form, this.selectedPackage);
  }

  // ============================================================
  // AREA DROPDOWN
  // ============================================================

  isAreaDropdownOpen(index: number): boolean {
    return this.practitionerLogic.isAreaDropdownOpen(index);
  }

  getSelectedAreaName(index: number): string {
    return this.practitionerLogic.getSelectedAreaName(index, this.form, this.areas);
  }

  openAreaDropdown(index: number): void {
    this.practitionerLogic.openAreaDropdown(index);
  }

  onAreaSearch(index: number, value: string): void {
    this.practitionerLogic.onAreaSearch(index, value);
  }

  getFilteredAreas(index: number): Area[] {
    return this.practitionerLogic.getFilteredAreas(index, this.areas);
  }

  selectArea(index: number, area: Area): void {
    this.practitionerLogic.selectArea(index, area, this.form, () => {
      this.onAreaChanged(index);
    });
  }

  // ============================================================
  // AREA CHANGED
  // ============================================================

  private onAreaChanged(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.slotStart = null;
    assignment.slotEnd = null;

    this.scheduleLogic.resetScheduleState(index);
  }

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  isPractitionerDropdownOpen(index: number): boolean {
    return this.practitionerLogic.isPractitionerDropdownOpen(index);
  }

  getSelectedPractitionerName(index: number): string {
    return this.practitionerLogic.getSelectedPractitionerName(index, this.form, this.practitioners);
  }

  openPractitionerDropdown(index: number): void {
    this.practitionerLogic.openPractitionerDropdown(index);
  }

  onPractitionerSearch(index: number, value: string): void {
    this.practitionerLogic.onPractitionerSearch(index, value);
  }

  getPractitionersForAssignment(index: number): Practitioner[] {
    return this.practitionerLogic.getPractitionersForAssignment(
      index,
      this.form,
      this.practitioners,
      this.selectedPackage,
    );
  }

  selectPractitioner(index: number, practitioner: Practitioner): void {
    this.practitionerLogic.selectPractitioner(index, practitioner, this.form, () => {
      this.onPractitionerChanged(index);
    });
  }

  // ============================================================
  // PRACTITIONER CHANGED
  // ============================================================

  private onPractitionerChanged(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.slotStart = null;
    assignment.slotEnd = null;

    this.scheduleLogic.resetScheduleState(index);

    if (assignment.practitionerId && assignment.scheduledDate) {
      this.loadPractitionerSchedule(index);
    }
  }

  // ============================================================
  // SCHEDULE DISPLAY
  // ============================================================

  shouldShowPractitionerSchedule(index: number): boolean {
    return this.scheduleLogic.shouldShowPractitionerSchedule(index, this.form);
  }

  getBookedVisitCount(index: number): number {
    return this.scheduleLogic.getBookedVisitCount(index);
  }

  getPractitionerSchedule(index: number): PractitionerScheduleItem[] {
    return this.scheduleLogic.getPractitionerSchedule(index);
  }

  // ============================================================
  // LOAD SCHEDULE
  // ============================================================

  private loadPractitionerSchedule(index: number): void {
    this.scheduleLogic.loadPractitionerSchedule(index, this.form, (error: unknown) =>
      this.getErrorMessage(error),
    );
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  formatDate(assignmentDate: string | null | undefined): string {
    return this.scheduleLogic.formatDate(assignmentDate);
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  formatTime(time: string | null | undefined): string {
    return this.scheduleLogic.formatTime(time);
  }

  // ============================================================
  // ASSIGNMENT DATE CHANGE
  // ============================================================

  onAssignmentDateChange(index: number): void {
    this.scheduleLogic.onAssignmentDateChange(index, this.form, (error: unknown) =>
      this.getErrorMessage(error),
    );
  }

  // ============================================================
  // TIME CHANGE
  // ============================================================

  onTimeChange(index: number): void {
    this.scheduleLogic.onTimeChange(index, this.form);
  }

  // ============================================================
  // TIME RANGE ERROR
  // ============================================================

  getTimeRangeError(index: number): string {
    return this.scheduleLogic.getTimeRangeError(index, this.form);
  }

  // ============================================================
  // PARTIAL SCHEDULE
  // ============================================================

  hasPartialSchedule(assignment: AddVisitForm['visitAssignments'][number]): boolean {
    return this.scheduleLogic.hasPartialSchedule(assignment);
  }

  // ============================================================
  // SUBMIT VISIT
  // ============================================================

  submitVisit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const validationError = this.validateForm();

    if (validationError) {
      this.errorMessage = validationError;
      return;
    }

    const selectedPackage = this.selectedPackage;

    if (!selectedPackage) {
      this.errorMessage = 'Please select a package.';
      return;
    }

    const installmentError = this.packageLogic.validateInstallment(this.form, selectedPackage);

    if (installmentError) {
      this.errorMessage = installmentError;
      return;
    }

    const request: CreateVisitRequest = {
      patientPhone: this.form.patientPhone.trim(),

      patientName: this.form.patientName.trim(),

      patientAddress: this.form.locationAddress.trim(),

      patientDescription: this.form.description.trim() || null,

      packageId: this.form.packageId,

      paymentType: this.form.paymentType,

      initialAmount:
        this.form.paymentType === 'Installment'
          ? (this.form.initialAmountPaid ?? 0)
          : selectedPackage.amount,

      assignments: this.form.visitAssignments.map((assignment): VisitAssignment => ({
        areaId: assignment.areaId || null,

        practitionerId: assignment.practitionerId || null,

        scheduledDate: assignment.scheduledDate || null,

        slotStart: assignment.slotStart || null,

        slotEnd: assignment.slotEnd || null,
      })),
    };

    this.isSubmitting = true;

    this.visitsService.createVisit(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.successMessage = 'Visit package created successfully.';

        this.router.navigate(['/visits']);
      },

      error: (error: unknown) => {
        this.isSubmitting = false;

        this.errorMessage = this.getErrorMessage(error);
      },
    });
  }

  // ============================================================
  // VALIDATE FORM
  // ============================================================

  private validateForm(): string | null {
    if (!this.form.patientName.trim()) {
      return 'Patient name is required.';
    }

    if (!this.form.patientPhone.trim()) {
      return 'Patient phone number is required.';
    }

    if (!this.form.locationAddress.trim()) {
      return 'Patient address is required.';
    }

    if (!this.form.packageId) {
      return 'Please select a package.';
    }

    const selectedPackage = this.selectedPackage;

    if (!selectedPackage) {
      return 'The selected package could not be found.';
    }

    if (this.form.visitAssignments.length !== selectedPackage.numberOfVisits) {
      return `This package requires exactly ${selectedPackage.numberOfVisits} visit assignments.`;
    }

    for (let index = 0; index < this.form.visitAssignments.length; index++) {
      const assignment = this.form.visitAssignments[index];

      if (!assignment) {
        return `Visit ${index + 1} is invalid.`;
      }

      if (!assignment.practitionerId) {
        return `Please select a practitioner for visit ${index + 1}.`;
      }

      if (!assignment.areaId) {
        return `Please select an area for visit ${index + 1}.`;
      }

      const hasAnySchedule =
        !!assignment.scheduledDate || !!assignment.slotStart || !!assignment.slotEnd;

      const hasCompleteSchedule =
        !!assignment.scheduledDate && !!assignment.slotStart && !!assignment.slotEnd;

      if (hasAnySchedule && !hasCompleteSchedule) {
        return `Please complete the schedule for visit ${index + 1}.`;
      }

      if (hasCompleteSchedule) {
        const timeError = this.scheduleLogic.getTimeRangeError(index, this.form);

        if (timeError) {
          return `Visit ${index + 1}: ${timeError}`;
        }
      }
    }

    return null;
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object') {
      const possibleError = error as {
        error?: unknown;
        message?: unknown;
        status?: unknown;
      };

      const response = possibleError.error;

      if (response && typeof response === 'object') {
        const data = response as Record<string, unknown>;

        if (typeof data['message'] === 'string') {
          return data['message'];
        }

        if (typeof data['detail'] === 'string') {
          return data['detail'];
        }

        if (typeof data['title'] === 'string') {
          return data['title'];
        }

        const errors = data['errors'];

        if (errors && typeof errors === 'object') {
          const validationMessages = Object.values(errors as Record<string, unknown>)
            .flatMap((value) => (Array.isArray(value) ? value : [value]))
            .filter((value): value is string => typeof value === 'string');

          if (validationMessages.length) {
            return validationMessages.join(' ');
          }
        }
      }

      if (typeof possibleError.message === 'string') {
        return possibleError.message;
      }

      if (possibleError.status === 0) {
        return 'Unable to connect to the server.';
      }

      if (typeof possibleError.status === 'number') {
        if (possibleError.status >= 500) {
          return 'A server error occurred. Please try again.';
        }

        if (possibleError.status >= 400 && possibleError.status < 500) {
          return 'The request could not be completed. Please check the entered information.';
        }
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong. Please try again.';
  }

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  closeDropdown(): void {
    this.practitionerLogic.closeDropdown();
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    this.router.navigate(['/visits']);
  }
}
