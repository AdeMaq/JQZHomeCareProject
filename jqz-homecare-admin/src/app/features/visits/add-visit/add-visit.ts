import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Package, PackageService } from '../../../core/services/package';
import { Practitioner, PractitionerService } from '../../../core/services/practitioner';
import { Area, CityAreaService } from '../../../core/services/city-area';

import { Patient, PatientService } from '../../../core/services/patient.service';

import {
  PatientPackage,
  PatientPackageService,
} from '../../../core/services/patient-package.service';

import { CreateVisitRequest, VisitsService } from '../visits.service';

import { Visit } from '../visits.interface';

// ============================================================
// FORM MODELS
// ============================================================

interface VisitAssignmentForm {
  practitionerId: string | null;
  areaId: string | null;
  scheduledDate: string | null;
  slotStart: string | null;
  slotEnd: string | null;
}

interface PractitionerScheduleItem {
  start: string;
  end: string;
  status: 'BOOKED' | 'AVAILABLE';
  patientName?: string;
  visitId?: string;
}

interface AddVisitForm {
  patientName: string;
  patientPhone: string;
  locationAddress: string;
  description: string;
  packageId: string;
  paymentType: 'FullAdvance' | 'Installment';
  initialAmountPaid: number | null;
  visitAssignments: VisitAssignmentForm[];
}

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
  // DEPENDENCIES
  // ============================================================

  private readonly router = inject(Router);

  private readonly visitsService = inject(VisitsService);

  private readonly packageService = inject(PackageService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cityAreaService = inject(CityAreaService);

  private readonly patientService = inject(PatientService);

  private readonly patientPackageService = inject(PatientPackageService);

  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // SCHEDULE CONFIGURATION
  // ============================================================

  readonly scheduleStartHour = 0;
  readonly scheduleEndHour = 24;

  // ============================================================
  // DATA
  // ============================================================

  packages: Package[] = [];

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  // ============================================================
  // PATIENT LOOKUP STATE
  // ============================================================

  existingPatientSuggestion: Patient | null = null;

  selectedExistingPatient: Patient | null = null;

  patientLookupLoading = false;

  patientLookupError = '';

  patientLookupMessage = '';

  showExistingPatientSuggestion = false;

  private patientLookupRequestVersion = 0;

  private selectedExistingPatientPhone = '';

  private existingPatientVisits: Visit[] = [];

  /**
   * Separate request version for loading the existing patient's
   * visits/package information.
   *
   * This prevents an old asynchronous response from overwriting
   * a newer selection or manually changed package.
   */
  private existingPatientDataRequestVersion = 0;

  // ============================================================
  // DROPDOWN STATE
  // ============================================================

  openDropdown: OpenDropdown = null;

  areaSearchTerms: Record<number, string> = {};

  practitionerSearchTerms: Record<number, string> = {};

  // ============================================================
  // PRACTITIONER SCHEDULE STATE
  // ============================================================

  practitionerVisits: Record<number, Visit[]> = {};

  isLoadingSchedule: Record<number, boolean> = {};

  scheduleErrors: Record<number, string> = {};

  private scheduleRequestVersions: Record<number, number> = {};

  // ============================================================
  // PACKAGE STATE
  // ============================================================

  selectedPackage: Package | null = null;

  // ============================================================
  // LOADING / SUBMISSION STATE
  // ============================================================

  isLoading = false;

  isLoadingPackages = false;

  isLoadingPractitioners = false;

  isLoadingAreas = false;

  isLoadingExistingPatientData = false;

  isSubmitting = false;

  // ============================================================
  // MESSAGES
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
    description: '',
    packageId: '',
    paymentType: 'FullAdvance',
    initialAmountPaid: null,
    visitAssignments: [],
  };

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.loadInitialData();
  }

  // ============================================================
  // DOCUMENT CLICK
  // ============================================================

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeDropdown();
  }

  // ============================================================
  // INITIAL DATA
  // ============================================================

  private loadInitialData(): void {
    this.isLoading = true;

    this.isLoadingPackages = true;

    this.errorMessage = '';

    this.packageService.getPackages().subscribe({
      next: (packages) => {
        this.packages = packages;

        this.isLoadingPackages = false;

        console.log('Packages loaded:', this.packages);

        this.loadPractitioners();
      },

      error: (error: unknown) => {
        console.error('Failed to load packages:', error);

        this.isLoadingPackages = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load packages. Please try again.',
        );
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
        this.practitioners = practitioners;

        this.isLoadingPractitioners = false;

        console.log('Practitioners loaded:', this.practitioners);

        this.loadAreas();
      },

      error: (error: unknown) => {
        console.error('Failed to load practitioners:', error);

        this.isLoadingPractitioners = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load practitioners. Please try again.',
        );
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
        this.areas = areas;

        this.isLoadingAreas = false;

        this.isLoading = false;

        console.log('Areas loaded:', this.areas);
      },

      error: (error: unknown) => {
        console.error('Failed to load areas:', error);

        this.isLoadingAreas = false;

        this.isLoading = false;

        this.errorMessage = this.getErrorMessage(error, 'Unable to load areas. Please try again.');
      },
    });
  }

  // ============================================================
  // PATIENT PHONE CHANGE
  // ============================================================

  onPatientPhoneChange(phone: string): void {
    const normalizedPhone = phone.trim();

    /*
     * If the admin changes the phone number after selecting
     * an existing patient, invalidate the previous patient
     * selection and any pending patient-data request.
     */
    if (this.selectedExistingPatient && normalizedPhone !== this.selectedExistingPatientPhone) {
      this.selectedExistingPatient = null;

      this.selectedExistingPatientPhone = '';

      this.existingPatientSuggestion = null;

      this.showExistingPatientSuggestion = false;

      this.existingPatientVisits = [];

      this.existingPatientDataRequestVersion++;

      this.isLoadingExistingPatientData = false;
    }

    this.patientLookupError = '';

    this.patientLookupMessage = '';
  }

  // ============================================================
  // PATIENT PHONE BLUR
  // ============================================================

  onPatientPhoneBlur(): void {
    const phone = this.form.patientPhone.trim();

    if (!phone) {
      this.existingPatientSuggestion = null;

      this.showExistingPatientSuggestion = false;

      this.patientLookupError = '';

      this.patientLookupMessage = '';

      return;
    }

    if (this.selectedExistingPatient && phone === this.selectedExistingPatientPhone) {
      return;
    }

    this.lookupPatientByPhone(phone);
  }

  // ============================================================
  // LOOKUP PATIENT BY PHONE
  // ============================================================

  private lookupPatientByPhone(phone: string): void {
    const requestVersion = ++this.patientLookupRequestVersion;

    this.patientLookupLoading = true;

    this.patientLookupError = '';

    this.patientLookupMessage = '';

    this.existingPatientSuggestion = null;

    this.showExistingPatientSuggestion = false;

    this.patientService.getPatientByPhone(phone).subscribe({
      next: (patient: Patient) => {
        /*
         * Ignore an older request if the admin has already
         * entered another phone number.
         */
        if (requestVersion !== this.patientLookupRequestVersion) {
          return;
        }

        this.patientLookupLoading = false;

        this.existingPatientSuggestion = patient;

        this.showExistingPatientSuggestion = true;

        this.patientLookupMessage = 'An existing patient was found with this phone number.';

        this.cdr.markForCheck();
      },

      error: (error: unknown) => {
        if (requestVersion !== this.patientLookupRequestVersion) {
          return;
        }

        this.patientLookupLoading = false;

        this.existingPatientSuggestion = null;

        this.showExistingPatientSuggestion = false;

        /*
         * 404 simply means that no existing patient was found.
         */
        if (this.getErrorStatus(error) === 404) {
          this.patientLookupError = '';

          this.patientLookupMessage =
            'No existing patient found. You can create a new patient using this phone number.';

          this.cdr.markForCheck();

          return;
        }

        console.error('Failed to find patient by phone:', error);

        this.patientLookupError = this.getErrorMessage(
          error,
          'Unable to check the phone number. Please try again.',
        );

        this.cdr.markForCheck();
      },
    });
  }

  // ============================================================
  // SELECT EXISTING PATIENT
  // ============================================================

  selectExistingPatient(patient: Patient): void {
    if (!patient) {
      return;
    }

    /*
     * Create a new request version for this patient's
     * visit/package restoration.
     */
    const requestVersion = ++this.existingPatientDataRequestVersion;

    /*
     * Populate the current Add Visit form.
     *
     * These are normal editable form values.
     * They do NOT update the existing Patient entity.
     */
    this.form.patientPhone = patient.phone ?? '';

    this.form.patientName = patient.name ?? '';

    this.form.locationAddress = patient.locationAddress ?? '';

    this.form.description = patient.patientDescription ?? '';

    this.selectedExistingPatient = patient;

    this.selectedExistingPatientPhone = patient.phone ?? '';

    this.existingPatientSuggestion = null;

    this.showExistingPatientSuggestion = false;

    this.patientLookupError = '';

    this.patientLookupMessage =
      'Existing patient selected. Patient information can still be edited.';

    /*
     * Clear the current package/assignment state before
     * restoring the patient's previous package.
     */
    this.clearPackageSelection();

    this.isLoadingExistingPatientData = true;

    this.loadExistingPatientVisitData(patient.id, requestVersion);
  }

  // ============================================================
  // CLEAR PACKAGE SELECTION
  // ============================================================

  private clearPackageSelection(): void {
    this.selectedPackage = null;

    this.form.packageId = '';

    this.form.initialAmountPaid = null;

    this.form.visitAssignments = [];

    this.areaSearchTerms = {};

    this.practitionerSearchTerms = {};

    this.practitionerVisits = {};

    this.isLoadingSchedule = {};

    this.scheduleErrors = {};

    this.scheduleRequestVersions = {};

    this.closeDropdown();
  }

  // ============================================================
  // LOAD EXISTING PATIENT VISIT DATA
  // ============================================================

  private loadExistingPatientVisitData(patientId: string, requestVersion: number): void {
    /*
     * PatientDto does not contain:
     *
     * - packageId
     * - areaId
     * - practitionerId
     *
     * Therefore we use the patient's existing visits to
     * recover the previous package assignment information.
     */
    this.visitsService.getAll().subscribe({
      next: (visits) => {
        /*
         * Ignore stale asynchronous response.
         */
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        /*
         * Make sure the selected patient is still the same.
         */
        if (this.selectedExistingPatient?.id !== patientId) {
          return;
        }

        const patientVisits = visits
          .filter((visit) => visit.patientId === patientId && !!visit.patientPackageId)
          .sort((a, b) => this.getVisitDateValue(b) - this.getVisitDateValue(a));

        this.existingPatientVisits = patientVisits;

        const latestVisit = this.getLatestPatientVisit(patientVisits);

        if (!latestVisit || !latestVisit.patientPackageId) {
          this.isLoadingExistingPatientData = false;

          this.patientLookupMessage =
            'Patient found, but no previous package assignment could be found. Please select a package manually.';

          this.cdr.markForCheck();

          return;
        }

        this.loadExistingPatientPackage(latestVisit, requestVersion);
      },

      error: (error: unknown) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        console.error('Failed to load existing patient visits:', error);

        this.isLoadingExistingPatientData = false;

        this.patientLookupError = this.getErrorMessage(
          error,
          'Patient was found, but previous visit information could not be loaded.',
        );

        this.cdr.markForCheck();
      },
    });
  }

  // ============================================================
  // LOAD EXISTING PATIENT PACKAGE
  // ============================================================

  private loadExistingPatientPackage(visit: Visit, requestVersion: number): void {
    if (!visit.patientPackageId) {
      this.isLoadingExistingPatientData = false;

      return;
    }

    this.patientPackageService.getById(visit.patientPackageId).subscribe({
      next: (patientPackage: PatientPackage) => {
        /*
         * Ignore stale asynchronous response.
         */
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        /*
         * Make sure the same existing patient is still selected.
         */
        if (!this.selectedExistingPatient) {
          return;
        }

        const existingPackage = this.packages.find((pkg) => pkg.id === patientPackage.packageId);

        if (!existingPackage) {
          this.isLoadingExistingPatientData = false;

          this.patientLookupMessage =
            'Patient found, but the previous package is no longer available in the package list. Please select a package manually.';

          this.cdr.markForCheck();

          return;
        }

        /*
         * Use the normal package-change workflow.
         *
         * The true argument tells onPackageChange() that
         * this change is part of existing-patient restoration
         * and should NOT invalidate this request.
         */
        this.form.packageId = existingPackage.id;

        this.onPackageChange(true);

        /*
         * onPackageChange() creates the correct number of
         * assignments for the selected package.
         */
        const firstAssignment = this.form.visitAssignments[0];

        if (firstAssignment) {
          /*
           * Restore area only if that area still exists.
           */
          if (visit.areaId) {
            const existingArea = this.areas.find((area) => area.id === visit.areaId);

            if (existingArea) {
              firstAssignment.areaId = existingArea.id;

              this.areaSearchTerms[0] = existingArea.cityName
                ? `${existingArea.name} — ${existingArea.cityName}`
                : existingArea.name;
            }
          }

          /*
           * Restore practitioner only if:
           *
           * 1. practitioner still exists
           * 2. practitioner belongs to the package service
           */
          if (visit.practitionerId) {
            const existingPractitioner = this.practitioners.find(
              (practitioner) =>
                practitioner.id === visit.practitionerId &&
                practitioner.serviceId === existingPackage.serviceId,
            );

            if (existingPractitioner) {
              firstAssignment.practitionerId = existingPractitioner.id;

              this.practitionerSearchTerms[0] = existingPractitioner.name;
            }
          }
        }

        this.isLoadingExistingPatientData = false;

        this.patientLookupMessage =
          'Existing patient information has been populated. You can edit any field before creating the visit.';

        this.cdr.markForCheck();
      },

      error: (error: unknown) => {
        if (requestVersion !== this.existingPatientDataRequestVersion) {
          return;
        }

        console.error('Failed to load existing patient package:', error);

        this.isLoadingExistingPatientData = false;

        this.patientLookupError =
          'Patient was found, but the previous package information could not be loaded. Please select a package manually.';

        this.cdr.markForCheck();
      },
    });
  }

  // ============================================================
  // GET LATEST PATIENT VISIT
  // ============================================================

  private getLatestPatientVisit(visits: Visit[]): Visit | null {
    if (!visits.length) {
      return null;
    }

    return visits[0] ?? null;
  }

  // ============================================================
  // GET VISIT DATE VALUE
  // ============================================================

  private getVisitDateValue(visit: Visit): number {
    if (!visit.scheduledDate) {
      return 0;
    }

    const timestamp = new Date(visit.scheduledDate).getTime();

    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  // ============================================================
  // PACKAGE CHANGE
  // ============================================================

  onPackageChange(restoringExistingPatient = false): void {
    /*
     * If the admin manually changes the package while an
     * existing-patient package restoration is in progress,
     * invalidate the old asynchronous restoration.
     *
     * When restoringExistingPatient === true, this method is
     * being called by loadExistingPatientPackage(), so the
     * request must remain valid.
     */
    if (!restoringExistingPatient) {
      this.existingPatientDataRequestVersion++;

      this.isLoadingExistingPatientData = false;
    }

    this.selectedPackage = this.packages.find((pkg) => pkg.id === this.form.packageId) ?? null;

    this.closeDropdown();

    this.areaSearchTerms = {};

    this.practitionerSearchTerms = {};

    this.practitionerVisits = {};

    this.isLoadingSchedule = {};

    this.scheduleErrors = {};

    this.scheduleRequestVersions = {};

    this.form.initialAmountPaid = null;

    if (!this.selectedPackage) {
      this.form.visitAssignments = [];

      return;
    }

    /*
     * Package number of visits determines how many assignment
     * cards are created.
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
  // PAYMENT
  // ============================================================

  getPendingAmount(): number {
    if (!this.selectedPackage) {
      return 0;
    }

    const initialPaid = Number(this.form.initialAmountPaid) || 0;

    return Math.max(0, this.selectedPackage.amount - initialPaid);
  }

  onPaymentTypeChange(): void {
    this.errorMessage = '';

    if (this.form.paymentType === 'FullAdvance') {
      this.form.initialAmountPaid = null;
    }
  }

  // ============================================================
  // AREA DROPDOWN
  // ============================================================

  openAreaDropdown(index: number): void {
    this.openDropdown = {
      type: 'area',
      index,
    };

    this.areaSearchTerms[index] = '';
  }

  isAreaDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'area' && this.openDropdown.index === index;
  }

  onAreaSearch(index: number, searchValue: string): void {
    this.areaSearchTerms[index] = searchValue;

    this.openDropdown = {
      type: 'area',
      index,
    };
  }

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

  selectArea(index: number, area: Area): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.areaId = area.id;

    this.areaSearchTerms[index] = area.cityName ? `${area.name} — ${area.cityName}` : area.name;

    this.onAreaChange(index);

    this.closeDropdown();
  }

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  openPractitionerDropdown(index: number): void {
    this.openDropdown = {
      type: 'practitioner',
      index,
    };

    this.practitionerSearchTerms[index] = '';
  }

  isPractitionerDropdownOpen(index: number): boolean {
    return this.openDropdown?.type === 'practitioner' && this.openDropdown.index === index;
  }

  onPractitionerSearch(index: number, searchValue: string): void {
    this.practitionerSearchTerms[index] = searchValue;

    this.openDropdown = {
      type: 'practitioner',
      index,
    };
  }

  // ============================================================
  // PRACTITIONER FILTERING
  // ============================================================

  getPractitionersForAssignment(index: number): Practitioner[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment || !this.selectedPackage) {
      return [];
    }

    /*
     * PACKAGE -> SERVICE
     *
     * Only practitioners belonging to the
     * package's service are allowed.
     */
    const requiredServiceId = this.selectedPackage.serviceId;

    let result = this.practitioners.filter(
      (practitioner) => practitioner.serviceId === requiredServiceId,
    );

    /*
     * SEARCH FILTER
     */
    const search = (this.practitionerSearchTerms[index] ?? '').trim().toLowerCase();

    if (search) {
      result = result.filter((practitioner) =>
        (practitioner.name ?? '').toLowerCase().includes(search),
      );
    }

    /*
     * PRIORITY:
     *
     * 1. Same service + selected area
     * 2. Same service but different/no area
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

  getSelectedPractitionerName(index: number): string {
    const assignment = this.form.visitAssignments[index];

    if (!assignment?.practitionerId) {
      return '';
    }

    const practitioner = this.practitioners.find((item) => item.id === assignment.practitionerId);

    return practitioner?.name ?? '';
  }

  selectPractitioner(index: number, practitioner: Practitioner): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.practitionerId = practitioner.id;

    this.practitionerSearchTerms[index] = practitioner.name;

    this.onPractitionerChange(index);

    this.closeDropdown();
  }

  onPractitionerChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.slotStart = null;

    assignment.slotEnd = null;

    this.resetScheduleState(index);

    this.loadPractitionerSchedule(index);
  }

  onAreaChange(index: number): void {
    this.invalidateScheduleRequest(index);
  }

  // ============================================================
  // DATE CHANGE
  // ============================================================

  onAssignmentDateChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.slotStart = null;

    assignment.slotEnd = null;

    this.resetScheduleState(index);

    this.loadPractitionerSchedule(index);
  }

  // ============================================================
  // SCHEDULE REQUEST VERSION
  // ============================================================

  private invalidateScheduleRequest(index: number): void {
    const nextVersion = (this.scheduleRequestVersions[index] ?? 0) + 1;

    this.scheduleRequestVersions = {
      ...this.scheduleRequestVersions,
      [index]: nextVersion,
    };
  }

  // ============================================================
  // RESET SCHEDULE STATE
  // ============================================================

  private resetScheduleState(index: number): void {
    this.invalidateScheduleRequest(index);

    this.practitionerVisits = {
      ...this.practitionerVisits,
      [index]: [],
    };

    this.isLoadingSchedule = {
      ...this.isLoadingSchedule,
      [index]: false,
    };

    this.scheduleErrors = {
      ...this.scheduleErrors,
      [index]: '',
    };
  }

  // ============================================================
  // LOAD PRACTITIONER SCHEDULE
  // ============================================================

  private loadPractitionerSchedule(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment || !assignment.practitionerId || !assignment.scheduledDate) {
      this.practitionerVisits = {
        ...this.practitionerVisits,
        [index]: [],
      };

      this.isLoadingSchedule = {
        ...this.isLoadingSchedule,
        [index]: false,
      };

      this.scheduleErrors = {
        ...this.scheduleErrors,
        [index]: '',
      };

      this.cdr.markForCheck();

      return;
    }

    const practitionerId = assignment.practitionerId;

    const scheduledDate = assignment.scheduledDate;

    const requestVersion = (this.scheduleRequestVersions[index] ?? 0) + 1;

    this.scheduleRequestVersions = {
      ...this.scheduleRequestVersions,
      [index]: requestVersion,
    };

    this.isLoadingSchedule = {
      ...this.isLoadingSchedule,
      [index]: true,
    };

    this.scheduleErrors = {
      ...this.scheduleErrors,
      [index]: '',
    };

    this.practitionerVisits = {
      ...this.practitionerVisits,
      [index]: [],
    };

    this.cdr.markForCheck();

    this.visitsService.getPractitionerVisitsByDate(practitionerId, scheduledDate).subscribe({
      next: (visits) => {
        if (this.scheduleRequestVersions[index] !== requestVersion) {
          return;
        }

        const currentAssignment = this.form.visitAssignments[index];

        if (
          !currentAssignment ||
          currentAssignment.practitionerId !== practitionerId ||
          currentAssignment.scheduledDate !== scheduledDate
        ) {
          return;
        }

        const practitionerVisits = visits
          .filter(
            (visit) =>
              !!visit.slotStart &&
              !!visit.slotEnd &&
              this.getTimeValue(visit.slotStart) < this.getTimeValue(visit.slotEnd),
          )
          .sort((a, b) => this.getTimeValue(a.slotStart) - this.getTimeValue(b.slotStart));

        this.practitionerVisits = {
          ...this.practitionerVisits,
          [index]: practitionerVisits,
        };

        this.isLoadingSchedule = {
          ...this.isLoadingSchedule,
          [index]: false,
        };

        this.scheduleErrors = {
          ...this.scheduleErrors,
          [index]: '',
        };

        this.cdr.markForCheck();
      },

      error: (error: unknown) => {
        if (this.scheduleRequestVersions[index] !== requestVersion) {
          return;
        }

        const currentAssignment = this.form.visitAssignments[index];

        if (
          !currentAssignment ||
          currentAssignment.practitionerId !== practitionerId ||
          currentAssignment.scheduledDate !== scheduledDate
        ) {
          return;
        }

        console.error('Failed to load practitioner schedule:', error);

        this.practitionerVisits = {
          ...this.practitionerVisits,
          [index]: [],
        };

        this.isLoadingSchedule = {
          ...this.isLoadingSchedule,
          [index]: false,
        };

        this.scheduleErrors = {
          ...this.scheduleErrors,
          [index]: this.getErrorMessage(error, 'Unable to load the practitioner schedule.'),
        };

        this.cdr.markForCheck();
      },
    });
  }

  // ============================================================
  // PRACTITIONER SCHEDULE DISPLAY
  // ============================================================

  shouldShowPractitionerSchedule(index: number): boolean {
    const assignment = this.form.visitAssignments[index];

    return !!(assignment?.practitionerId && assignment?.scheduledDate);
  }

  getPractitionerVisits(index: number): Visit[] {
    return this.practitionerVisits[index] ?? [];
  }

  getPractitionerSchedule(index: number): PractitionerScheduleItem[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment?.scheduledDate) {
      return [];
    }

    const bookedVisits = [...this.getPractitionerVisits(index)]
      .filter(
        (visit) =>
          !!visit.slotStart &&
          !!visit.slotEnd &&
          this.getTimeValue(visit.slotStart) < this.getTimeValue(visit.slotEnd),
      )
      .sort((a, b) => this.getTimeValue(a.slotStart) - this.getTimeValue(b.slotStart));

    const schedule: PractitionerScheduleItem[] = [];

    const scheduleStart = this.scheduleStartHour * 60;

    const scheduleEnd = this.scheduleEndHour * 60;

    let currentTime = scheduleStart;

    for (const visit of bookedVisits) {
      const visitStart = Math.max(scheduleStart, this.getTimeValue(visit.slotStart));

      const visitEnd = Math.min(scheduleEnd, this.getTimeValue(visit.slotEnd));

      if (visitStart >= visitEnd) {
        continue;
      }

      const effectiveStart = Math.max(currentTime, visitStart);

      if (currentTime < effectiveStart) {
        schedule.push({
          start: this.getTimeString(currentTime),
          end: this.getTimeString(effectiveStart),
          status: 'AVAILABLE',
        });
      }

      schedule.push({
        start: this.getTimeString(effectiveStart),
        end: this.getTimeString(visitEnd),
        status: 'BOOKED',
        patientName: visit.patientName || 'Unknown Patient',
        visitId: visit.id,
      });

      currentTime = Math.max(currentTime, visitEnd);
    }

    if (currentTime < scheduleEnd) {
      schedule.push({
        start: this.getTimeString(currentTime),
        end: this.getTimeString(scheduleEnd),
        status: 'AVAILABLE',
      });
    }

    if (schedule.length === 0) {
      schedule.push({
        start: this.getTimeString(scheduleStart),
        end: this.getTimeString(scheduleEnd),
        status: 'AVAILABLE',
      });
    }

    return schedule;
  }

  getBookedVisitCount(index: number): number {
    return this.getPractitionerVisits(index).filter(
      (visit) =>
        !!visit.slotStart &&
        !!visit.slotEnd &&
        this.getTimeValue(visit.slotStart) < this.getTimeValue(visit.slotEnd),
    ).length;
  }

  // ============================================================
  // TIME VALIDATION
  // ============================================================

  onTimeChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    this.errorMessage = '';
  }

  isWithinWorkingHours(start: string | null, end: string | null): boolean {
    if (!start || !end) {
      return true;
    }

    const startValue = this.getTimeValue(start);

    const endValue = this.getTimeValue(end);

    const minimumTime = this.scheduleStartHour * 60;

    const maximumTime = this.scheduleEndHour * 60;

    return startValue >= minimumTime && endValue <= maximumTime;
  }

  getTimeRangeError(index: number): string {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return '';
    }

    if (
      assignment.slotStart &&
      assignment.slotEnd &&
      this.getTimeValue(assignment.slotStart) >= this.getTimeValue(assignment.slotEnd)
    ) {
      return 'End time must be later than start time.';
    }

    if (
      assignment.slotStart &&
      assignment.slotEnd &&
      !this.isWithinWorkingHours(assignment.slotStart, assignment.slotEnd)
    ) {
      return (
        'Visit time must be between ' +
        `${this.formatTime(`${this.scheduleStartHour}:00`)} and ` +
        `${this.formatTime(`${this.scheduleEndHour}:00`)}.`
      );
    }

    if (assignment.slotStart && assignment.slotEnd && this.hasScheduleConflict(index)) {
      return 'The selected time overlaps with another visit for this practitioner.';
    }

    return '';
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  formatTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }

    if (time === '24:00' || time === '24:00:00') {
      return '11:59 PM';
    }

    const normalizedTime = time.substring(0, 5);

    const [hourString, minuteString] = normalizedTime.split(':');

    const hour = Number(hourString);

    const minute = minuteString ?? '00';

    if (Number.isNaN(hour)) {
      return time;
    }

    const period = hour >= 12 ? 'PM' : 'AM';

    const displayHour = hour % 12 || 12;

    return `${displayHour.toString().padStart(2, '0')}:${minute} ${period}`;
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return '';
    }

    const parts = date.split('-');

    if (parts.length !== 3) {
      return date;
    }

    const year = Number(parts[0]);

    const month = Number(parts[1]) - 1;

    const day = Number(parts[2]);

    const parsedDate = new Date(year, month, day);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ============================================================
  // TIME HELPERS
  // ============================================================

  private getTimeString(totalMinutes: number): string {
    if (totalMinutes >= 24 * 60) {
      return '23:59';
    }

    const hours = Math.floor(totalMinutes / 60);

    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  private getTimeValue(time: string | null | undefined): number {
    if (!time) {
      return 0;
    }

    const normalizedTime = time.substring(0, 5);

    const [hourString, minuteString] = normalizedTime.split(':');

    const hours = Number(hourString);

    const minutes = Number(minuteString);

    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return 0;
    }

    if (hours === 24 && minutes === 0) {
      return 24 * 60;
    }

    return hours * 60 + minutes;
  }

  // ============================================================
  // TIME OVERLAP
  // ============================================================

  private doesTimeRangeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    const startValueA = this.getTimeValue(startA);

    const endValueA = this.getTimeValue(endA);

    const startValueB = this.getTimeValue(startB);

    const endValueB = this.getTimeValue(endB);

    return startValueA < endValueB && endValueA > startValueB;
  }

  // ============================================================
  // SCHEDULE CONFLICT
  // ============================================================

  private hasScheduleConflict(index: number): boolean {
    const assignment = this.form.visitAssignments[index];

    if (
      !assignment ||
      !assignment.practitionerId ||
      !assignment.scheduledDate ||
      !assignment.slotStart ||
      !assignment.slotEnd
    ) {
      return false;
    }

    const bookedVisits = this.practitionerVisits[index] ?? [];

    const conflictsWithExistingVisit = bookedVisits.some((visit) => {
      if (!visit.slotStart || !visit.slotEnd) {
        return false;
      }

      return this.doesTimeRangeOverlap(
        assignment.slotStart!,
        assignment.slotEnd!,
        visit.slotStart,
        visit.slotEnd,
      );
    });

    if (conflictsWithExistingVisit) {
      return true;
    }

    return this.form.visitAssignments.some((otherAssignment, otherIndex) => {
      if (otherIndex === index) {
        return false;
      }

      if (
        otherAssignment.practitionerId !== assignment.practitionerId ||
        otherAssignment.scheduledDate !== assignment.scheduledDate ||
        !otherAssignment.slotStart ||
        !otherAssignment.slotEnd
      ) {
        return false;
      }

      return this.doesTimeRangeOverlap(
        assignment.slotStart!,
        assignment.slotEnd!,
        otherAssignment.slotStart,
        otherAssignment.slotEnd,
      );
    });
  }

  // ============================================================
  // PARTIAL SCHEDULE
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
  // PAYMENT TYPE
  // ============================================================

  private getPaymentTypeValue(): 0 | 1 {
    return this.form.paymentType === 'FullAdvance' ? 0 : 1;
  }

  // ============================================================
  // SUBMIT VISIT
  // ============================================================

  submitVisit(): void {
    if (this.isSubmitting || this.isLoading || this.isLoadingExistingPatientData) {
      return;
    }

    this.errorMessage = '';

    this.successMessage = '';

    // ==========================================================
    // PATIENT VALIDATION
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

    // ==========================================================
    // PACKAGE VALIDATION
    // ==========================================================

    if (!this.form.packageId) {
      this.errorMessage = 'Please select a package.';

      return;
    }

    if (!this.selectedPackage) {
      this.errorMessage = 'Selected package could not be found.';

      return;
    }

    // ==========================================================
    // PAYMENT VALIDATION
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

      if (this.hasPartialSchedule(assignment)) {
        this.errorMessage = `Visit #${i + 1}: Scheduled date, start time and end time must all be provided together.`;

        return;
      }

      if (
        assignment.slotStart &&
        assignment.slotEnd &&
        this.getTimeValue(assignment.slotStart) >= this.getTimeValue(assignment.slotEnd)
      ) {
        this.errorMessage = `Visit #${i + 1}: End time must be later than start time.`;

        return;
      }

      if (
        assignment.slotStart &&
        assignment.slotEnd &&
        !this.isWithinWorkingHours(assignment.slotStart, assignment.slotEnd)
      ) {
        this.errorMessage =
          `Visit #${i + 1}: Visit time must be between ` +
          `${this.formatTime(`${this.scheduleStartHour}:00`)} and ` +
          `${this.formatTime(`${this.scheduleEndHour}:00`)}.`;

        return;
      }

      if (this.hasScheduleConflict(i)) {
        this.errorMessage = `Visit #${i + 1}: The selected time overlaps with an existing visit for this practitioner. Please choose another time.`;

        return;
      }
    }

    // ==========================================================
    // CREATE PAYLOAD
    // ==========================================================

    const payload: CreateVisitRequest = {
      /*
       * IMPORTANT:
       *
       * These are the CURRENT values in the Add Visit form.
       *
       * If the admin selected an existing patient and then
       * edited the name/address/description, these edited
       * values are sent here.
       *
       * The backend must store these values as visit-level
       * snapshot data rather than modifying the existing
       * Patient entity.
       */
      patientName: this.form.patientName.trim(),

      patientPhone: this.form.patientPhone.trim(),

      locationAddress: this.form.locationAddress.trim(),

      patientDescription: this.form.description.trim() || null,

      packageId: this.form.packageId,

      paymentType: this.getPaymentTypeValue(),

      initialAmountPaid:
        this.form.paymentType === 'Installment' ? Number(this.form.initialAmountPaid) : null,

      visitAssignments: this.form.visitAssignments.map((assignment) => ({
        practitionerId: assignment.practitionerId,

        areaId: assignment.areaId,

        scheduledDate: assignment.scheduledDate || null,

        slotStart: assignment.slotStart || null,

        slotEnd: assignment.slotEnd || null,
      })),
    };

    console.log('CREATE VISIT REQUEST', payload);

    this.isSubmitting = true;

    // ==========================================================
    // CREATE
    // ==========================================================

    this.visitsService.create(payload).subscribe({
      next: (response: unknown) => {
        console.log('VISIT CREATED SUCCESSFULLY', response);

        this.isSubmitting = false;

        this.successMessage = 'Visit package created successfully.';

        this.router.navigate(['/visits']);
      },

      error: (error: unknown) => {
        console.error('FAILED TO CREATE VISIT', error);

        this.isSubmitting = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Failed to create the visit. Please try again.',
        );
      },

      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  // ============================================================
  // ERROR HELPERS
  // ============================================================

  private getErrorStatus(error: unknown): number {
    if (typeof error !== 'object' || error === null) {
      return 0;
    }

    const response = error as {
      status?: number;
    };

    return response.status ?? 0;
  }

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
  // DROPDOWN / NAVIGATION
  // ============================================================

  closeDropdown(): void {
    this.openDropdown = null;
  }

  cancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.router.navigate(['/visits']);
  }
}
