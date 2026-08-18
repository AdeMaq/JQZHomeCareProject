import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';

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
  slotStart: string | null;
  slotEnd: string | null;

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
export class EditVisit implements OnInit {
  // ============================================================
  // SERVICES
  // ============================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly visitsService = inject(VisitsService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cityAreaService = inject(CityAreaService);

  // ============================================================
  // DATA
  // ============================================================

  visit: Visit | null = null;

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  // ============================================================
  // ORIGINAL VALUES
  // Used to determine what actually changed
  // ============================================================

  private originalPractitionerId: string | null = null;

  private originalAreaId: string | null = null;

  private originalScheduledDate: string | null = null;

  private originalSlotStart: string | null = null;

  private originalSlotEnd: string | null = null;

  // ============================================================
  // LOADING STATES
  // ============================================================

  isLoading = false;

  isSaving = false;

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
    slotStart: null,
    slotEnd: null,

    refusedBy: 'Practitioner',
    reason: '',
  };

  // ============================================================
  // INITIALIZATION
  // ============================================================

  ngOnInit(): void {
    const visitId = this.route.snapshot.paramMap.get('id');

    if (!visitId) {
      this.errorMessage = 'Visit ID is missing.';
      return;
    }

    this.loadVisit(visitId);
  }

  // ============================================================
  // LOAD VISIT
  // ============================================================

  private loadVisit(id: string): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.visitsService.getById(id).subscribe({
      next: (visit) => {
        this.visit = visit;

        this.populateForm(visit);

        this.loadPractitioners();
      },

      error: (error: unknown) => {
        console.error('Failed to load visit:', error);

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to load the visit. Please try again.',
        );

        this.isLoading = false;
      },
    });
  }

  // ============================================================
  // POPULATE FORM
  // ============================================================

  private populateForm(visit: Visit): void {
    const scheduledDate = this.formatDateForInput(visit.scheduledDate);

    const slotStart = this.formatTimeForInput(visit.slotStart);

    const slotEnd = this.formatTimeForInput(visit.slotEnd);

    this.form = {
      practitionerId: visit.practitionerId ?? null,

      areaId: visit.areaId ?? null,

      scheduledDate,

      slotStart,

      slotEnd,

      refusedBy: 'Practitioner',

      reason: '',
    };

    // Store original values.

    this.originalPractitionerId = visit.practitionerId ?? null;

    this.originalAreaId = visit.areaId ?? null;

    this.originalScheduledDate = scheduledDate;

    this.originalSlotStart = slotStart;

    this.originalSlotEnd = slotEnd;
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
  // GET PRACTITIONERS
  // ============================================================

  getPractitioners(): Practitioner[] {
    if (!this.visit) {
      return [];
    }

    return this.practitioners.filter(
      (practitioner) => practitioner.serviceId === this.visit!.serviceId,
    );
  }

  // ============================================================
  // PRACTITIONER CHANGE
  // ============================================================

  onPractitionerChange(): void {
    if (!this.form.practitionerId) {
      this.form.areaId = null;
      return;
    }

    const practitioner = this.practitioners.find((p) => p.id === this.form.practitionerId);

    if (!practitioner) {
      this.form.areaId = null;
      return;
    }

    // If current area does not belong to the selected
    // practitioner, clear it.

    if (this.form.areaId) {
      const validArea = practitioner.areas.some((area) => area.id === this.form.areaId);

      if (!validArea) {
        this.form.areaId = null;
      }
    }
  }

  // ============================================================
  // GET AREAS
  // ============================================================

  getAreas(): Area[] {
    if (!this.form.practitionerId) {
      return this.areas;
    }

    const practitioner = this.practitioners.find((p) => p.id === this.form.practitionerId);

    if (!practitioner) {
      return [];
    }

    const practitionerAreaIds = new Set(practitioner.areas.map((area) => area.id));

    return this.areas.filter((area) => practitionerAreaIds.has(area.id));
  }

  // ============================================================
  // CHECK PARTIAL SCHEDULE
  // ============================================================

  hasPartialSchedule(): boolean {
    const hasDate = !!this.form.scheduledDate;

    const hasStart = !!this.form.slotStart;

    const hasEnd = !!this.form.slotEnd;

    const hasAny = hasDate || hasStart || hasEnd;

    const hasAll = hasDate && hasStart && hasEnd;

    return hasAny && !hasAll;
  }

  // ============================================================
  // CHECK TIME ORDER
  // ============================================================

  hasInvalidTimeOrder(): boolean {
    if (!this.form.slotStart || !this.form.slotEnd) {
      return false;
    }

    return this.form.slotStart >= this.form.slotEnd;
  }

  // ============================================================
  // CHECK PRACTITIONER CHANGE
  // ============================================================

  hasPractitionerChanged(): boolean {
    return this.form.practitionerId !== this.originalPractitionerId;
  }

  // ============================================================
  // CHECK AREA CHANGE
  // ============================================================

  hasAreaChanged(): boolean {
    return this.form.areaId !== this.originalAreaId;
  }

  // ============================================================
  // CHECK SCHEDULE CHANGE
  // ============================================================

  hasScheduleChanged(): boolean {
    return (
      this.form.scheduledDate !== this.originalScheduledDate ||
      this.form.slotStart !== this.originalSlotStart ||
      this.form.slotEnd !== this.originalSlotEnd
    );
  }

  // ============================================================
  // CHECK REASSIGNMENT
  // ============================================================

  hasReassignment(): boolean {
    return this.hasPractitionerChanged() || this.hasAreaChanged();
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submit(): void {
    this.errorMessage = '';

    this.successMessage = '';

    // ----------------------------------------------------------
    // VISIT VALIDATION
    // ----------------------------------------------------------

    if (!this.visit) {
      this.errorMessage = 'Visit information is unavailable.';

      return;
    }

    // ----------------------------------------------------------
    // SCHEDULE VALIDATION
    // ----------------------------------------------------------

    if (this.hasPartialSchedule()) {
      this.errorMessage = 'Scheduled date, start time and end time must all be provided together.';

      return;
    }

    if (this.hasInvalidTimeOrder()) {
      this.errorMessage = 'End time must be later than start time.';

      return;
    }

    // ----------------------------------------------------------
    // REASSIGNMENT VALIDATION
    // ----------------------------------------------------------

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

    // ----------------------------------------------------------
    // NOTHING CHANGED
    // ----------------------------------------------------------

    if (!this.hasScheduleChanged() && !this.hasReassignment()) {
      this.errorMessage = 'No changes were made to this visit.';

      return;
    }

    // ----------------------------------------------------------
    // SAVE
    // ----------------------------------------------------------

    this.isSaving = true;

    this.saveChanges();
  }

  // ============================================================
  // SAVE CHANGES
  // ============================================================

  private saveChanges(): void {
    const operations: Array<() => Observable<void>> = [];

    // ----------------------------------------------------------
    // REASSIGNMENT
    // ----------------------------------------------------------

    if (this.hasReassignment()) {
      const request: ReassignPractitionerRequest = {
        practitionerId: this.form.practitionerId!,

        areaId: this.form.areaId ?? null,

        refusedBy: this.form.refusedBy,

        reason: this.form.reason.trim(),
      };

      operations.push(() => this.visitsService.reassign(this.visit!.id, request));
    }

    // ----------------------------------------------------------
    // SCHEDULE
    // ----------------------------------------------------------

    if (this.hasScheduleChanged()) {
      // Because a partial schedule was already rejected above,
      // either all values are present or all are empty.

      if (!this.form.scheduledDate || !this.form.slotStart || !this.form.slotEnd) {
        this.errorMessage = 'Scheduled date, start time and end time must all be provided.';

        this.isSaving = false;

        return;
      }

      const request: ScheduleVisitRequest = {
        scheduledDate: this.form.scheduledDate,

        slotStart: this.form.slotStart,

        slotEnd: this.form.slotEnd,
      };

      operations.push(() => this.visitsService.schedule(this.visit!.id, request));
    }

    // ----------------------------------------------------------
    // EXECUTE OPERATIONS SEQUENTIALLY
    // ----------------------------------------------------------

    this.executeOperations(operations, 0);
  }

  // ============================================================
  // EXECUTE OPERATIONS
  // ============================================================

  private executeOperations(operations: Array<() => Observable<void>>, index: number): void {
    if (index >= operations.length) {
      this.isSaving = false;

      this.successMessage = 'Visit updated successfully.';

      // Navigate back after successful update.

      setTimeout(() => {
        this.router.navigate(['/admin/visits']);
      }, 700);

      return;
    }

    operations[index]().subscribe({
      next: () => {
        this.executeOperations(operations, index + 1);
      },

      error: (error: unknown) => {
        console.error('Failed to update visit:', error);

        this.isSaving = false;

        this.errorMessage = this.getErrorMessage(
          error,
          'Unable to update the visit. Please try again.',
        );
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
  // Handles:
  // "09:00:00"
  // "09:00:00.0000000"
  // "09:00"
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
    this.router.navigate(['/admin/visits']);
  }
}
