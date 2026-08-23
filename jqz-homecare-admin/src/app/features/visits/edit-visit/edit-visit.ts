import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

import { Area, CityAreaService } from '../../../core/services/city-area';

import {
  ReassignPractitionerRequest,
  ScheduleVisitRequest,
  VisitsService,
} from '../visits.service';

import { Visit } from '../visits.interface';

// ============================================================
// EDIT VISIT FORM MODEL
// ============================================================

interface EditVisitForm {
  practitionerId: string | null;

  areaId: string | null;

  scheduledDate: string | null;

  startTime: string | null;

  endTime: string | null;

  refusedBy: 'Patient' | 'Practitioner';

  reason: string;
}

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-edit-visit',

  standalone: true,

  imports: [CommonModule, FormsModule],

  templateUrl: './edit-visit.html',

  styleUrl: './edit-visit.css',
})
export class EditVisit implements OnInit, OnDestroy {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly visitsService = inject(VisitsService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cityAreaService = inject(CityAreaService);

  private readonly cdr = inject(ChangeDetectorRef);

  // ============================================================
  // DESTROY
  // ============================================================

  private readonly destroy$ = new Subject<void>();

  // ============================================================
  // DATA
  // ============================================================

  visit: Visit | null = null;

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  // ============================================================
  // SEARCHABLE DROPDOWNS
  // ============================================================

  isAreaDropdownOpen = false;

  isPractitionerDropdownOpen = false;

  areaSearchTerm = '';

  practitionerSearchTerm = '';

  filteredAreas: Area[] = [];

  filteredPractitioners: Practitioner[] = [];

  // ============================================================
  // ORIGINAL VALUES
  // ============================================================

  private originalPractitionerId: string | null = null;

  private originalAreaId: string | null = null;

  private originalScheduledDate: string | null = null;

  private originalStartTime: string | null = null;

  private originalEndTime: string | null = null;

  // ============================================================
  // LOADING STATES
  // ============================================================

  isLoading = true;

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

  form: EditVisitForm = {
    practitionerId: null,

    areaId: null,

    scheduledDate: null,

    startTime: null,

    endTime: null,

    refusedBy: 'Practitioner',

    reason: '',
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const visitId = params.get('id');

      if (!visitId) {
        this.isLoading = false;

        this.errorMessage = 'Visit ID is missing.';

        this.detectChanges();

        return;
      }

      this.loadInitialData(visitId);
    });
  }

  // ============================================================
  // LOAD ALL INITIAL DATA
  // ============================================================

  private loadInitialData(visitId: string): void {
    // ----------------------------------------------------------
    // RESET STATE
    // ----------------------------------------------------------

    this.isLoading = true;

    this.isLoadingPractitioners = true;

    this.isLoadingAreas = true;

    this.errorMessage = '';

    this.successMessage = '';

    this.visit = null;

    this.practitioners = [];

    this.areas = [];

    this.filteredAreas = [];

    this.filteredPractitioners = [];

    this.detectChanges();

    // ----------------------------------------------------------
    // LOAD VISIT + PRACTITIONERS + AREAS TOGETHER
    // ----------------------------------------------------------

    forkJoin({
      visit: this.visitsService.getById(visitId),

      practitioners: this.practitionerService.getPractitioners(),

      areas: this.cityAreaService.getAreas(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ visit, practitioners, areas }) => {
          console.log('EDIT VISIT INITIAL DATA LOADED');

          // ----------------------------------------------------
          // ASSIGN DATA
          // ----------------------------------------------------

          this.visit = visit;

          this.practitioners = practitioners ?? [];

          this.areas = areas ?? [];

          // ----------------------------------------------------
          // POPULATE FORM
          // ----------------------------------------------------

          this.populateForm(visit);

          // ----------------------------------------------------
          // INITIALIZE FILTERED LISTS
          // ----------------------------------------------------

          this.filteredAreas = [...this.areas];

          this.filteredPractitioners = this.getPrioritizedPractitioners();

          // ----------------------------------------------------
          // RESTORE SELECTED VALUES
          // ----------------------------------------------------

          this.restoreSelectedAreaDisplay();

          this.restoreSelectedPractitionerDisplay();

          // ----------------------------------------------------
          // STOP LOADING
          // ----------------------------------------------------

          this.isLoading = false;

          this.isLoadingPractitioners = false;

          this.isLoadingAreas = false;

          // ----------------------------------------------------
          // FORCE VIEW UPDATE
          // ----------------------------------------------------

          this.detectChanges();
        },

        error: (error: unknown) => {
          console.error('Failed to load edit visit initial data:', error);

          this.isLoading = false;

          this.isLoadingPractitioners = false;

          this.isLoadingAreas = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to load visit information. Please try again.',
          );

          this.detectChanges();
        },
      });
  }

  // ============================================================
  // SAFE CHANGE DETECTION
  // ============================================================

  private detectChanges(): void {
    this.cdr.detectChanges();
  }

  // ============================================================
  // POPULATE FORM
  // ============================================================

  private populateForm(visit: Visit): void {
    const scheduledDate = this.formatDateForInput(visit.scheduledDate);

    const startTime = this.formatTimeForInput(visit.slotStart);

    const endTime = this.formatTimeForInput(visit.slotEnd);

    this.form = {
      practitionerId: visit.practitionerId ?? null,

      areaId: visit.areaId ?? null,

      scheduledDate,

      startTime,

      endTime,

      refusedBy: 'Practitioner',

      reason: '',
    };

    this.originalPractitionerId = visit.practitionerId ?? null;

    this.originalAreaId = visit.areaId ?? null;

    this.originalScheduledDate = scheduledDate;

    this.originalStartTime = startTime;

    this.originalEndTime = endTime;
  }

  // ============================================================
  // AREA DISPLAY
  // ============================================================

  getSelectedAreaDisplay(): string {
    const selectedArea = this.getSelectedArea();

    if (!selectedArea) {
      return '';
    }

    return selectedArea.cityName
      ? `${selectedArea.name} — ${selectedArea.cityName}`
      : selectedArea.name;
  }

  private restoreSelectedAreaDisplay(): void {
    this.areaSearchTerm = this.getSelectedAreaDisplay();
  }

  // ============================================================
  // PRACTITIONER DISPLAY
  // ============================================================

  getSelectedPractitionerDisplay(): string {
    const selectedPractitioner = this.getSelectedPractitioner();

    if (!selectedPractitioner) {
      return '';
    }

    return selectedPractitioner.name;
  }

  private restoreSelectedPractitionerDisplay(): void {
    this.practitionerSearchTerm = this.getSelectedPractitionerDisplay();
  }

  // ============================================================
  // AREA DROPDOWN
  // ============================================================

  openAreaDropdown(): void {
    this.isAreaDropdownOpen = true;

    this.isPractitionerDropdownOpen = false;

    this.areaSearchTerm = '';

    this.filteredAreas = [...this.areas];
  }

  toggleAreaDropdown(): void {
    if (this.isAreaDropdownOpen) {
      this.closeAreaDropdown();

      return;
    }

    this.openAreaDropdown();
  }

  closeAreaDropdown(): void {
    this.isAreaDropdownOpen = false;

    this.filteredAreas = [...this.areas];

    this.restoreSelectedAreaDisplay();
  }

  filterAreas(): void {
    const searchTerm = this.areaSearchTerm.trim().toLowerCase();

    if (!searchTerm) {
      this.filteredAreas = [...this.areas];

      return;
    }

    this.filteredAreas = this.areas.filter((area) => {
      const areaName = area.name?.toLowerCase() ?? '';

      const cityName = area.cityName?.toLowerCase() ?? '';

      return areaName.includes(searchTerm) || cityName.includes(searchTerm);
    });
  }

  getFilteredAreas(): Area[] {
    return this.filteredAreas;
  }

  getAreas(): Area[] {
    return this.areas;
  }

  selectArea(area: Area): void {
    this.form.areaId = area.id;

    this.filteredAreas = [...this.areas];

    this.filteredPractitioners = this.getPrioritizedPractitioners();

    this.closeAreaDropdown();
  }

  clearAreaSelection(): void {
    this.form.areaId = null;

    this.areaSearchTerm = '';

    this.filteredAreas = [...this.areas];

    this.filteredPractitioners = this.getPrioritizedPractitioners();
  }

  getSelectedArea(): Area | null {
    if (!this.form.areaId) {
      return null;
    }

    return this.areas.find((area) => area.id === this.form.areaId) ?? null;
  }

  isAreaSelected(areaId: string): boolean {
    return this.form.areaId === areaId;
  }

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  openPractitionerDropdown(): void {
    this.isPractitionerDropdownOpen = true;

    this.isAreaDropdownOpen = false;

    this.practitionerSearchTerm = '';

    this.filteredPractitioners = this.getPrioritizedPractitioners();
  }

  togglePractitionerDropdown(): void {
    if (this.isPractitionerDropdownOpen) {
      this.closePractitionerDropdown();

      return;
    }

    this.openPractitionerDropdown();
  }

  closePractitionerDropdown(): void {
    this.isPractitionerDropdownOpen = false;

    this.filteredPractitioners = this.getPrioritizedPractitioners();

    this.restoreSelectedPractitionerDisplay();
  }

  filterPractitioners(): void {
    const practitioners = this.getPrioritizedPractitioners();

    const searchTerm = this.practitionerSearchTerm.trim().toLowerCase();

    if (!searchTerm) {
      this.filteredPractitioners = [...practitioners];

      return;
    }

    this.filteredPractitioners = practitioners.filter((practitioner) => {
      const name = practitioner.name?.toLowerCase() ?? '';

      const email = practitioner.email?.toLowerCase() ?? '';

      const phone = practitioner.phone?.toLowerCase() ?? '';

      const serviceName = practitioner.serviceName?.toLowerCase() ?? '';

      return (
        name.includes(searchTerm) ||
        email.includes(searchTerm) ||
        phone.includes(searchTerm) ||
        serviceName.includes(searchTerm)
      );
    });
  }

  getFilteredPractitioners(): Practitioner[] {
    return this.filteredPractitioners;
  }

  getPractitioners(): Practitioner[] {
    return this.getPrioritizedPractitioners();
  }

  selectPractitioner(practitioner: Practitioner): void {
    this.form.practitionerId = practitioner.id;

    this.filteredPractitioners = this.getPrioritizedPractitioners();

    this.closePractitionerDropdown();
  }

  clearPractitionerSelection(): void {
    this.form.practitionerId = null;

    this.practitionerSearchTerm = '';

    this.filteredPractitioners = this.getPrioritizedPractitioners();
  }

  onPractitionerChange(): void {
    this.filterPractitioners();
  }

  getSelectedPractitioner(): Practitioner | null {
    if (!this.form.practitionerId) {
      return null;
    }

    return (
      this.practitioners.find((practitioner) => practitioner.id === this.form.practitionerId) ??
      null
    );
  }

  isPractitionerSelected(practitionerId: string): boolean {
    return this.form.practitionerId === practitionerId;
  }

  // ============================================================
  // CHECK IF PRACTITIONER IS ASSIGNED TO SELECTED AREA
  // ============================================================

  isPractitionerAssignedToSelectedArea(practitioner: Practitioner): boolean {
    if (!this.form.areaId) {
      return false;
    }

    return practitioner.areas?.some((area) => area.id === this.form.areaId) ?? false;
  }

  // ============================================================
  // PRIORITIZED PRACTITIONERS
  // ============================================================

  getPrioritizedPractitioners(): Practitioner[] {
    if (!this.form.areaId) {
      return [...this.practitioners];
    }

    const assignedToArea = this.practitioners.filter((practitioner) =>
      this.isPractitionerAssignedToSelectedArea(practitioner),
    );

    const otherPractitioners = this.practitioners.filter(
      (practitioner) => !this.isPractitionerAssignedToSelectedArea(practitioner),
    );

    return [...assignedToArea, ...otherPractitioners];
  }

  // ============================================================
  // SCHEDULE VALIDATION
  // ============================================================

  hasPartialSchedule(): boolean {
    const hasDate = !!this.form.scheduledDate;

    const hasStart = !!this.form.startTime;

    const hasEnd = !!this.form.endTime;

    const hasAny = hasDate || hasStart || hasEnd;

    const hasAll = hasDate && hasStart && hasEnd;

    return hasAny && !hasAll;
  }

  hasInvalidTimeOrder(): boolean {
    if (!this.form.startTime || !this.form.endTime) {
      return false;
    }

    return this.form.startTime >= this.form.endTime;
  }

  // ============================================================
  // CHANGE DETECTION
  // ============================================================

  hasPractitionerChanged(): boolean {
    return this.form.practitionerId !== this.originalPractitionerId;
  }

  hasAreaChanged(): boolean {
    return this.form.areaId !== this.originalAreaId;
  }

  hasScheduleChanged(): boolean {
    return (
      this.form.scheduledDate !== this.originalScheduledDate ||
      this.form.startTime !== this.originalStartTime ||
      this.form.endTime !== this.originalEndTime
    );
  }

  hasReassignment(): boolean {
    return this.hasPractitionerChanged() || this.hasAreaChanged();
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submit(): void {
    this.errorMessage = '';

    this.successMessage = '';

    if (!this.visit) {
      this.errorMessage = 'Visit information is unavailable.';

      return;
    }

    if (this.hasPartialSchedule()) {
      this.errorMessage = 'Scheduled date, start time and end time must all be provided together.';

      return;
    }

    if (this.hasInvalidTimeOrder()) {
      this.errorMessage = 'End time must be later than start time.';

      return;
    }

    if (this.hasReassignment()) {
      if (!this.form.practitionerId) {
        this.errorMessage = 'Please select a practitioner.';

        return;
      }

      if (!this.form.reason.trim()) {
        this.errorMessage = 'A reason is required when changing the practitioner or area.';

        return;
      }
    }

    if (!this.hasScheduleChanged() && !this.hasReassignment()) {
      this.errorMessage = 'No changes were made to this visit.';

      return;
    }

    this.isSubmitting = true;

    this.saveChanges();
  }

  // ============================================================
  // SAVE CHANGES
  // ============================================================

  private saveChanges(): void {
    const operations: Array<() => Observable<void>> = [];

    if (this.hasReassignment()) {
      const request: ReassignPractitionerRequest = {
        practitionerId: this.form.practitionerId!,

        areaId: this.form.areaId ?? null,

        refusedBy: this.form.refusedBy,

        reason: this.form.reason.trim(),
      };

      operations.push(() => this.visitsService.reassign(this.visit!.id, request));
    }

    if (this.hasScheduleChanged()) {
      if (!this.form.scheduledDate || !this.form.startTime || !this.form.endTime) {
        this.errorMessage = 'Scheduled date, start time and end time must all be provided.';

        this.isSubmitting = false;

        return;
      }

      const request: ScheduleVisitRequest = {
        scheduledDate: this.form.scheduledDate,

        slotStart: this.form.startTime,

        slotEnd: this.form.endTime,
      };

      operations.push(() => this.visitsService.schedule(this.visit!.id, request));
    }

    this.executeOperations(operations, 0);
  }

  // ============================================================
  // EXECUTE OPERATIONS SEQUENTIALLY
  // ============================================================

  private executeOperations(operations: Array<() => Observable<void>>, index: number): void {
    if (index >= operations.length) {
      this.isSubmitting = false;

      this.successMessage = 'Visit updated successfully.';

      this.detectChanges();

      setTimeout(() => {
        this.router.navigate(['/visits']);
      }, 700);

      return;
    }

    operations[index]()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.executeOperations(operations, index + 1);
        },

        error: (error: unknown) => {
          console.error('Failed to update visit:', error);

          this.isSubmitting = false;

          this.errorMessage = this.getErrorMessage(
            error,
            'Unable to update the visit. Please try again.',
          );

          this.detectChanges();
        },
      });
  }

  // ============================================================
  // DATE FORMATTER
  // ============================================================

  private formatDateForInput(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.substring(0, 10);
  }

  // ============================================================
  // TIME FORMATTER
  // ============================================================

  private formatTimeForInput(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.substring(0, 5);
  }

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  private getErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null) {
      const response = error as {
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
        const validationErrors = Object.values(response.error.errors).flat();

        if (validationErrors.length > 0) {
          return validationErrors.join(' ');
        }
      }
    }

    return fallback;
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancel(): void {
    this.router.navigate(['/visits']);
  }

  // ============================================================
  // DESTROY
  // ============================================================

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }
}
