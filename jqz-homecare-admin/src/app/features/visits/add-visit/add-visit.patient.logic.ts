import { ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Patient, PatientService } from '../../../core/services/patient.service';

import { PatientPackageService } from '../../../core/services/patient-package.service';

import { Package } from '../../../core/services/package';

import { PackagePaymentType, Visit } from '../visits.interface';

import { VisitsService } from '../visits.service';

import { AddVisitForm, VisitAssignmentForm } from './add-visit.models';

import { AddVisitScheduleLogic } from './add-visit.schedule.logic';

// ============================================================
// RESTORABLE PATIENT PACKAGE SHAPE
// ============================================================

interface RestorablePatientPackage {
  packageId?: string | null;
  paymentType?: PackagePaymentType | null;
  visits?: Visit[];
}

// ============================================================
// PATIENT LOGIC
// ============================================================

export class AddVisitPatientLogic {
  existingPatientSuggestion: Patient | null = null;
  selectedExistingPatient: Patient | null = null;

  patientLookupLoading = false;
  patientLookupError = '';
  patientLookupMessage = '';

  existingPatientVisits: Visit[] = [];

  isLoadingExistingPatientData = false;

  private patientLookupRequestVersion = 0;
  private existingPatientDataRequestVersion = 0;

  constructor(
    private readonly visitsService: VisitsService,
    private readonly patientService: PatientService,
    private readonly patientPackageService: PatientPackageService,
    private readonly scheduleLogic: AddVisitScheduleLogic,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ============================================================
  // SHOW EXISTING PATIENT SUGGESTION
  // ============================================================

  get showExistingPatientSuggestion(): boolean {
    return !!this.existingPatientSuggestion && !this.selectedExistingPatient;
  }

  // ============================================================
  // PHONE CHANGE
  // ============================================================

  onPatientPhoneChange(form: AddVisitForm, phone: string, clearPackageSelection: () => void): void {
    form.patientPhone = phone ?? '';

    this.patientLookupRequestVersion++;

    this.patientLookupError = '';
    this.patientLookupMessage = '';

    const normalizedPhone = form.patientPhone.trim();

    const selectedPhone = this.selectedExistingPatient?.phone?.trim() ?? '';

    if (this.selectedExistingPatient && normalizedPhone !== selectedPhone) {
      this.selectedExistingPatient = null;
      this.existingPatientSuggestion = null;
      this.existingPatientVisits = [];

      this.existingPatientDataRequestVersion++;

      clearPackageSelection();
    }

    if (!normalizedPhone) {
      this.existingPatientSuggestion = null;
      this.patientLookupLoading = false;
      return;
    }

    if (this.selectedExistingPatient && normalizedPhone === selectedPhone) {
      return;
    }
  }

  // ============================================================
  // PHONE BLUR
  // ============================================================

  onPatientPhoneBlur(form: AddVisitForm): void {
    const phone = form.patientPhone.trim();

    if (!phone) {
      this.existingPatientSuggestion = null;
      return;
    }

    const selectedPhone = this.selectedExistingPatient?.phone?.trim() ?? '';

    if (this.selectedExistingPatient && phone === selectedPhone) {
      return;
    }

    this.lookupPatientByPhone(form, phone);
  }

  // ============================================================
  // LOOKUP PATIENT
  // ============================================================

  private lookupPatientByPhone(form: AddVisitForm, phone: string): void {
    const requestVersion = ++this.patientLookupRequestVersion;

    this.patientLookupLoading = true;
    this.patientLookupError = '';
    this.patientLookupMessage = '';
    this.existingPatientSuggestion = null;

    this.patientService.getPatientByPhone(phone).subscribe({
      next: (patient: Patient) => {
        if (requestVersion !== this.patientLookupRequestVersion) {
          return;
        }

        this.patientLookupLoading = false;
        this.existingPatientSuggestion = patient;

        this.patientLookupMessage =
          'Existing patient found. You can use the existing patient information or continue editing the fields.';

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        if (requestVersion !== this.patientLookupRequestVersion) {
          return;
        }

        this.patientLookupLoading = false;
        this.existingPatientSuggestion = null;

        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.patientLookupMessage = 'No existing patient found with this phone number.';
          return;
        }

        this.patientLookupError = this.getErrorMessage(error);

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // SELECT EXISTING PATIENT
  // ============================================================

  selectExistingPatient(
    patient: Patient,
    form: AddVisitForm,
    clearPackageSelection: () => void,
    onPackageRestored: (
      packageId: string,
      paymentType: PackagePaymentType | null,
      visits: Visit[],
    ) => void,
    resetSchedule: () => void,
    loadSchedule: (index: number) => void,
    packages: Package[],
    getErrorMessage: (error: unknown) => string,
  ): void {
    this.selectedExistingPatient = patient;

    this.existingPatientSuggestion = null;

    form.patientPhone = patient.phone ?? '';

    form.patientName = patient.name ?? '';

    form.locationAddress = patient.locationAddress ?? '';

    form.description = patient.patientDescription ?? '';

    clearPackageSelection();
    resetSchedule();

    this.patientLookupError = '';
    this.patientLookupMessage =
      'Existing patient selected. You can edit the patient information before creating the visit.';

    this.loadExistingPatientVisitData(
      patient.id,
      form,
      onPackageRestored,
      resetSchedule,
      loadSchedule,
      packages,
      getErrorMessage,
    );
  }

  // ============================================================
  // LOAD EXISTING PATIENT DATA
  // ============================================================

  private loadExistingPatientVisitData(
    patientId: string,
    form: AddVisitForm,
    onPackageRestored: (
      packageId: string,
      paymentType: PackagePaymentType | null,
      visits: Visit[],
    ) => void,
    resetSchedule: () => void,
    loadSchedule: (index: number) => void,
    packages: Package[],
    getErrorMessage: (error: unknown) => string,
  ): void {
    const requestVersion = ++this.existingPatientDataRequestVersion;

    this.isLoadingExistingPatientData = true;

    this.existingPatientVisits = [];

    this.visitsService.getAll().subscribe({
      next: (visits: Visit[]) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        const patientVisits = (visits ?? [])
          .filter((visit) => visit.patientId === patientId)
          .sort((a, b) => this.getVisitDateValue(b) - this.getVisitDateValue(a));

        this.existingPatientVisits = patientVisits;

        const latestVisit = this.getLatestPatientVisit(patientVisits);

        if (!latestVisit?.patientPackageId) {
          this.isLoadingExistingPatientData = false;

          this.cdr.detectChanges();
          return;
        }

        this.loadExistingPatientPackage(
          latestVisit.patientPackageId,
          form,
          onPackageRestored,
          resetSchedule,
          loadSchedule,
          packages,
          getErrorMessage,
          requestVersion,
        );
      },

      error: (error: unknown) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        this.isLoadingExistingPatientData = false;

        this.patientLookupError = this.getErrorMessage(error);

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // LOAD EXISTING PATIENT PACKAGE
  // ============================================================

  private loadExistingPatientPackage(
    patientPackageId: string,
    form: AddVisitForm,
    onPackageRestored: (
      packageId: string,
      paymentType: PackagePaymentType | null,
      visits: Visit[],
    ) => void,
    resetSchedule: () => void,
    loadSchedule: (index: number) => void,
    packages: Package[],
    getErrorMessage: (error: unknown) => string,
    requestVersion: number,
  ): void {
    this.patientPackageService.getById(patientPackageId).subscribe({
      next: (patientPackage: unknown) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        const restoredPackage = patientPackage as RestorablePatientPackage;

        const packageId = restoredPackage.packageId ?? '';

        const paymentType = restoredPackage.paymentType ?? null;

        const packageVisits = restoredPackage.visits ?? [];

        if (!packageId) {
          this.isLoadingExistingPatientData = false;

          this.cdr.detectChanges();
          return;
        }

        const packageExists = packages.some((pkg) => pkg.id === packageId);

        if (!packageExists) {
          this.isLoadingExistingPatientData = false;

          this.patientLookupMessage =
            'The patient was found, but the previous package is no longer available for selection.';

          this.cdr.detectChanges();
          return;
        }

        onPackageRestored(packageId, paymentType, packageVisits);

        this.restorePackageVisits(form, packageVisits, loadSchedule, packages);

        this.isLoadingExistingPatientData = false;

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        this.isLoadingExistingPatientData = false;

        this.patientLookupError = getErrorMessage(error);

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // RESTORE PACKAGE VISITS
  // ============================================================

  private restorePackageVisits(
    form: AddVisitForm,
    visits: Visit[],
    loadSchedule: (index: number) => void,
    packages: Package[],
  ): void {
    const selectedPackage = packages.find((pkg) => pkg.id === form.packageId);

    if (!selectedPackage) {
      return;
    }

    const sortedVisits = this.getVisitsForRestoration(visits);

    const assignmentCount = selectedPackage.numberOfVisits;

    form.visitAssignments = Array.from({ length: assignmentCount }, (_, index) => {
      const visit = sortedVisits[index];

      if (!visit) {
        return this.createEmptyAssignment();
      }

      const sameService = !!visit.serviceId && visit.serviceId === selectedPackage.serviceId;

      return {
        practitionerId: sameService ? (visit.practitionerId ?? null) : null,

        areaId: visit.areaId ?? null,

        scheduledDate: this.toDateInputValue(visit.scheduledDate),

        slotStart: this.toTimeInputValue(visit.slotStart),

        slotEnd: this.toTimeInputValue(visit.slotEnd),
      };
    });

    form.visitAssignments.forEach((assignment, index) => {
      if (assignment.practitionerId && assignment.scheduledDate) {
        loadSchedule(index);
      }
    });
  }

  // ============================================================
  // GET VISITS FOR RESTORATION
  // ============================================================

  private getVisitsForRestoration(visits: Visit[]): Visit[] {
    return [...visits].sort((a, b) => {
      const aDate = this.getVisitDateValue(a);

      const bDate = this.getVisitDateValue(b);

      // Scheduled visits first,
      // latest scheduled date first.
      if (aDate !== bDate) {
        return bDate - aDate;
      }

      return 0;
    });
  }

  // ============================================================
  // LATEST PATIENT VISIT
  // ============================================================

  private getLatestPatientVisit(visits: Visit[]): Visit | null {
    if (!visits.length) {
      return null;
    }

    return visits[0] ?? null;
  }

  // ============================================================
  // VISIT DATE VALUE
  // ============================================================

  private getVisitDateValue(visit: Visit): number {
    if (!visit.scheduledDate) {
      return 0;
    }

    const date = new Date(visit.scheduledDate).getTime();

    if (Number.isNaN(date)) {
      return 0;
    }

    return date;
  }

  // ============================================================
  // EMPTY ASSIGNMENT
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
  // DATE INPUT VALUE
  // ============================================================

  private toDateInputValue(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.slice(0, 10);
  }

  // ============================================================
  // TIME INPUT VALUE
  // ============================================================

  private toTimeInputValue(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.slice(0, 5);
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const response = error.error;

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
      }

      if (error.message) {
        return error.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unable to load existing patient information.';
  }
}
