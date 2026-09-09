import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, forkJoin, Subject, takeUntil } from 'rxjs';

import { Practitioner, PractitionerService, Area } from '../../../core/services/practitioner';

import {
  ReassignPractitionerRequest,
  ScheduleVisitRequest,
  VisitsService,
} from '../visits.service';

import { Visit } from '../visits.interface';

// ============================================================
// FORM MODEL
// ============================================================

interface EditVisitForm {
  practitionerId: string | null;
  areaId: string | null;

  scheduledDate: string | null;
  startTime: string | null;
  endTime: string | null;
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
  // DEPENDENCIES
  // ============================================================

  private readonly route = inject(ActivatedRoute);

  private readonly router = inject(Router);

  private readonly visitsService = inject(VisitsService);

  private readonly practitionerService = inject(PractitionerService);

  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  // ============================================================
  // VISIT
  // ============================================================

  visit: Visit | null = null;

  // ============================================================
  // DATA
  // ============================================================

  practitioners: Practitioner[] = [];

  areas: Area[] = [];

  filteredPractitioners: Practitioner[] = [];

  // ============================================================
  // LOADING / STATE
  // ============================================================

  isLoading = true;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  isPractitionerDropdownOpen = false;

  practitionerSearchTerm = '';

  // ============================================================
  // SCHEDULE
  // ============================================================

  scheduledVisitsForDate: Visit[] = [];

  isLoadingSchedule = false;

  scheduleErrorMessage = '';

  // ============================================================
  // FORM
  // ============================================================

  form: EditVisitForm = {
    practitionerId: null,
    areaId: null,

    scheduledDate: null,
    startTime: null,
    endTime: null,
  };

  // ============================================================
  // ORIGINAL VALUES
  // ============================================================

  private originalPractitionerId: string | null = null;

  private originalAreaId: string | null = null;

  private originalScheduledDate: string | null = null;

  private originalStartTime: string | null = null;

  private originalEndTime: string | null = null;

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    const visitId = this.route.snapshot.paramMap.get('id');

    if (!visitId) {
      this.errorMessage = 'Visit ID is missing.';

      this.isLoading = false;

      return;
    }

    this.loadVisit(visitId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();

    this.destroy$.complete();
  }

  // ============================================================
  // LOAD VISIT
  // ============================================================

  private loadVisit(id: string): void {
    this.isLoading = true;

    this.errorMessage = '';

    forkJoin({
      visit: this.visitsService.getById(id),

      practitioners: this.practitionerService.getPractitioners(),

      areas: this.practitionerService.getAreas(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ visit, practitioners, areas }) => {
          this.visit = visit;

          this.practitioners = practitioners ?? [];

          this.areas = areas ?? [];

          this.populateForm(visit);

          this.filterPractitioners();

          if (this.form.scheduledDate) {
            this.loadScheduleForDate(this.form.scheduledDate);
          }

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Failed to load edit visit data:', error);

          this.errorMessage =
            error?.error?.message ?? error?.message ?? 'Failed to load visit information.';

          this.isLoading = false;

          this.cdr.detectChanges();
        },
      });
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
    };

    // ----------------------------------------------------------
    // ORIGINAL VALUES
    // ----------------------------------------------------------

    this.originalPractitionerId = visit.practitionerId ?? null;

    this.originalAreaId = visit.areaId ?? null;

    this.originalScheduledDate = scheduledDate;

    this.originalStartTime = startTime;

    this.originalEndTime = endTime;
  }

  // ============================================================
  // DATE FORMAT
  // ============================================================

  private formatDateForInput(value: string | Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    const year = date.getFullYear();

    const month = String(date.getMonth() + 1).padStart(2, '0');

    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // ============================================================
  // TIME FORMAT
  // ============================================================

  private formatTimeForInput(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (value.includes(':')) {
      const parts = value.split(':');

      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
      }
    }

    return value;
  }

  // ============================================================
  // PRACTITIONER FILTERING
  //
  // Rules:
  //
  // 1. Only practitioners belonging to the visit service.
  //
  // 2. If an area is selected:
  //    - practitioners covering that area first
  //    - other practitioners of the same service afterwards
  //
  // 3. Practitioners from another service are never shown.
  // ============================================================

  filterPractitioners(): void {
    if (!this.visit) {
      this.filteredPractitioners = [];

      return;
    }

    const serviceId = this.visit.serviceId;

    const selectedAreaId = this.form.areaId;

    // ----------------------------------------------------------
    // SERVICE FILTER
    // ----------------------------------------------------------

    const servicePractitioners = this.practitioners.filter((practitioner) =>
      this.areIdsEqual(practitioner.serviceId, serviceId),
    );

    // ----------------------------------------------------------
    // NO AREA SELECTED
    // ----------------------------------------------------------

    if (!selectedAreaId) {
      this.filteredPractitioners = this.sortPractitioners(servicePractitioners);

      this.applyPractitionerSearch();

      return;
    }

    // ----------------------------------------------------------
    // AREA MATCH
    //
    // Practitioner does not have areaId.
    //
    // Practitioner has:
    //
    // areas: PractitionerArea[]
    //
    // Therefore we check whether the selected area exists
    // inside practitioner.areas.
    // ----------------------------------------------------------

    const sameArea = servicePractitioners.filter(
      (practitioner) =>
        practitioner.areas?.some((area) => this.areIdsEqual(area.id, selectedAreaId)) ?? false,
    );

    // ----------------------------------------------------------
    // OTHER AREAS
    // ----------------------------------------------------------

    const otherArea = servicePractitioners.filter(
      (practitioner) =>
        !(practitioner.areas?.some((area) => this.areIdsEqual(area.id, selectedAreaId)) ?? false),
    );

    // ----------------------------------------------------------
    // PRIORITY ORDER
    // ----------------------------------------------------------

    this.filteredPractitioners = [
      ...this.sortPractitioners(sameArea),

      ...this.sortPractitioners(otherArea),
    ];

    this.applyPractitionerSearch();
  }

  // ============================================================
  // SORT PRACTITIONERS
  // ============================================================

  private sortPractitioners(practitioners: Practitioner[]): Practitioner[] {
    return [...practitioners].sort((a, b) => {
      const nameA = a.name?.toLowerCase() ?? '';

      const nameB = b.name?.toLowerCase() ?? '';

      return nameA.localeCompare(nameB);
    });
  }

  // ============================================================
  // PRACTITIONER SEARCH
  // ============================================================

  applyPractitionerSearch(): void {
    if (!this.visit) {
      this.filteredPractitioners = [];

      return;
    }

    const search = this.practitionerSearchTerm.trim().toLowerCase();

    if (!search) {
      return;
    }

    this.filteredPractitioners = this.filteredPractitioners.filter((practitioner) =>
      practitioner.name?.toLowerCase().includes(search),
    );
  }

  // ============================================================
  // AREA CHANGE
  // ============================================================

  onAreaChange(): void {
    this.errorMessage = '';

    this.practitionerSearchTerm = '';

    this.filterPractitioners();

    // ----------------------------------------------------------
    // Keep the currently selected practitioner if they still
    // belong to the visit service.
    //
    // We do NOT remove them merely because they don't cover the
    // selected area, because "same area first" is a priority
    // rule, not an exclusive rule.
    // ----------------------------------------------------------

    if (this.form.practitionerId && this.visit) {
      const selectedPractitioner = this.practitioners.find((practitioner) =>
        this.areIdsEqual(practitioner.id, this.form.practitionerId),
      );

      if (
        selectedPractitioner &&
        !this.areIdsEqual(selectedPractitioner.serviceId, this.visit.serviceId)
      ) {
        this.form.practitionerId = null;
      }
    }

    this.applyPractitionerSearch();
  }

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  togglePractitionerDropdown(): void {
    this.isPractitionerDropdownOpen = !this.isPractitionerDropdownOpen;

    if (this.isPractitionerDropdownOpen) {
      this.practitionerSearchTerm = '';

      this.filterPractitioners();
    }
  }

  closePractitionerDropdown(): void {
    this.isPractitionerDropdownOpen = false;
  }

  onPractitionerSearchChange(): void {
    const search = this.practitionerSearchTerm.trim().toLowerCase();

    // ----------------------------------------------------------
    // Rebuild the priority list first.
    // ----------------------------------------------------------

    if (this.visit) {
      const servicePractitioners = this.practitioners.filter((practitioner) =>
        this.areIdsEqual(practitioner.serviceId, this.visit!.serviceId),
      );

      let orderedPractitioners: Practitioner[];

      if (this.form.areaId) {
        const sameArea = servicePractitioners.filter(
          (practitioner) =>
            practitioner.areas?.some((area) => this.areIdsEqual(area.id, this.form.areaId!)) ??
            false,
        );

        const otherArea = servicePractitioners.filter(
          (practitioner) =>
            !(
              practitioner.areas?.some((area) => this.areIdsEqual(area.id, this.form.areaId!)) ??
              false
            ),
        );

        orderedPractitioners = [
          ...this.sortPractitioners(sameArea),

          ...this.sortPractitioners(otherArea),
        ];
      } else {
        orderedPractitioners = this.sortPractitioners(servicePractitioners);
      }

      if (!search) {
        this.filteredPractitioners = orderedPractitioners;

        return;
      }

      this.filteredPractitioners = orderedPractitioners.filter((practitioner) =>
        practitioner.name?.toLowerCase().includes(search),
      );
    }
  }

  // ============================================================
  // SELECT PRACTITIONER
  // ============================================================

  selectPractitioner(practitioner: Practitioner): void {
    this.form.practitionerId = practitioner.id;

    this.practitionerSearchTerm = practitioner.name ?? '';

    this.isPractitionerDropdownOpen = false;

    this.errorMessage = '';
  }

  // ============================================================
  // SELECTED PRACTITIONER NAME
  // ============================================================

  getSelectedPractitionerName(): string {
    if (!this.form.practitionerId) {
      return 'Select Practitioner';
    }

    const practitioner = this.practitioners.find((item) =>
      this.areIdsEqual(item.id, this.form.practitionerId),
    );

    return practitioner?.name ?? 'Select Practitioner';
  }

  // ============================================================
  // SCHEDULE DATE CHANGE
  // ============================================================

  onScheduledDateChange(): void {
    this.scheduleErrorMessage = '';

    if (!this.form.scheduledDate) {
      this.scheduledVisitsForDate = [];

      return;
    }

    this.loadScheduleForDate(this.form.scheduledDate);
  }

  // ============================================================
  // LOAD SCHEDULE
  // ============================================================

  private loadScheduleForDate(date: string): void {
    this.isLoadingSchedule = true;

    this.scheduleErrorMessage = '';

    this.visitsService
      .getByDate(date)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visits) => {
          this.scheduledVisitsForDate = visits ?? [];

          this.isLoadingSchedule = false;

          this.cdr.detectChanges();
        },

        error: (error) => {
          console.error('Failed to load schedule:', error);

          this.scheduledVisitsForDate = [];

          this.scheduleErrorMessage =
            error?.error?.message ?? 'Failed to load schedule for the selected date.';

          this.isLoadingSchedule = false;

          this.cdr.detectChanges();
        },
      });
  }

  // ============================================================
  // CHANGE DETECTION
  // ============================================================

  hasPractitionerChanged(): boolean {
    return !this.areIdsEqual(this.form.practitionerId, this.originalPractitionerId);
  }

  hasAreaChanged(): boolean {
    return !this.areIdsEqual(this.form.areaId, this.originalAreaId);
  }

  hasScheduleChanged(): boolean {
    return (
      this.form.scheduledDate !== this.originalScheduledDate ||
      this.form.startTime !== this.originalStartTime ||
      this.form.endTime !== this.originalEndTime
    );
  }

  hasAnyChanges(): boolean {
    return this.hasPractitionerChanged() || this.hasAreaChanged() || this.hasScheduleChanged();
  }

  // ============================================================
  // VALIDATION
  // ============================================================

  private validateForm(): boolean {
    this.errorMessage = '';

    this.scheduleErrorMessage = '';

    // ----------------------------------------------------------
    // NO CHANGES
    // ----------------------------------------------------------

    if (!this.hasAnyChanges()) {
      this.errorMessage = 'No changes were made to this visit.';

      return false;
    }

    // ----------------------------------------------------------
    // AREA CHANGE
    //
    // Current backend ReassignPractitionerRequest does not
    // support areaId.
    //
    // Therefore we must not pretend that the area was saved.
    // ----------------------------------------------------------

    if (this.hasAreaChanged()) {
      this.errorMessage =
        'The area cannot currently be changed from Edit Visit because the reassignment API only supports practitionerId.';

      return false;
    }

    // ----------------------------------------------------------
    // PRACTITIONER
    // ----------------------------------------------------------

    if (this.hasPractitionerChanged() && !this.form.practitionerId) {
      this.errorMessage = 'Please select a practitioner.';

      return false;
    }

    // ----------------------------------------------------------
    // SCHEDULE
    // ----------------------------------------------------------

    const hasAnyScheduleValue =
      !!this.form.scheduledDate || !!this.form.startTime || !!this.form.endTime;

    if (hasAnyScheduleValue) {
      if (!this.form.scheduledDate || !this.form.startTime || !this.form.endTime) {
        this.scheduleErrorMessage = 'Please provide the scheduled date, start time, and end time.';

        return false;
      }

      if (this.form.startTime >= this.form.endTime) {
        this.scheduleErrorMessage = 'End time must be later than start time.';

        return false;
      }

      if (this.hasScheduleChanged() && this.hasScheduleConflict()) {
        this.scheduleErrorMessage =
          'The selected practitioner already has a visit scheduled during this time. Please select another time or practitioner.';

        return false;
      }
    }

    return true;
  }

  // ============================================================
  // SCHEDULE CONFLICT
  // ============================================================

  private hasScheduleConflict(): boolean {
    if (
      !this.form.scheduledDate ||
      !this.form.startTime ||
      !this.form.endTime ||
      !this.form.practitionerId
    ) {
      return false;
    }

    const newStart = this.timeToMinutes(this.form.startTime);

    const newEnd = this.timeToMinutes(this.form.endTime);

    return this.scheduledVisitsForDate.some((existingVisit) => {
      // ------------------------------------------------------
      // Ignore current visit.
      // ------------------------------------------------------

      if (this.visit && this.areIdsEqual(existingVisit.id, this.visit.id)) {
        return false;
      }

      // ------------------------------------------------------
      // Same practitioner only.
      // ------------------------------------------------------

      if (!this.areIdsEqual(existingVisit.practitionerId, this.form.practitionerId)) {
        return false;
      }

      if (!existingVisit.slotStart || !existingVisit.slotEnd) {
        return false;
      }

      const existingStart = this.timeToMinutes(
        this.formatTimeForInput(existingVisit.slotStart) ?? '',
      );

      const existingEnd = this.timeToMinutes(this.formatTimeForInput(existingVisit.slotEnd) ?? '');

      // ------------------------------------------------------
      // Interval overlap.
      // ------------------------------------------------------

      return newStart < existingEnd && newEnd > existingStart;
    });
  }

  // ============================================================
  // TIME → MINUTES
  // ============================================================

  private timeToMinutes(time: string): number {
    if (!time) {
      return 0;
    }

    const [hours, minutes] = time.split(':').map(Number);

    return hours * 60 + minutes;
  }

  // ============================================================
  // SAVE CHANGES
  // ============================================================

  saveChanges(): void {
    if (this.isSaving || !this.visit) {
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isSaving = true;

    this.successMessage = '';

    this.errorMessage = '';

    const operations: Array<() => Observable<void>> = [];

    // ==========================================================
    // PRACTITIONER REASSIGNMENT
    // ==========================================================
    //
    // Actual backend contract:
    //
    // ReassignPractitionerRequest {
    //   practitionerId: string;
    // }
    //
    // ==========================================================

    if (this.hasPractitionerChanged()) {
      const request: ReassignPractitionerRequest = {
        practitionerId: this.form.practitionerId!,
      };

      operations.push(() => this.visitsService.reassign(this.visit!.id, request));
    }

    // ==========================================================
    // SCHEDULE UPDATE
    // ==========================================================

    if (this.hasScheduleChanged()) {
      if (!this.form.scheduledDate || !this.form.startTime || !this.form.endTime) {
        this.errorMessage = 'Please provide a complete schedule.';

        this.isSaving = false;

        return;
      }

      const request: ScheduleVisitRequest = {
        scheduledDate: this.form.scheduledDate,

        slotStart: this.form.startTime,

        slotEnd: this.form.endTime,
      };

      operations.push(() => this.visitsService.schedule(this.visit!.id, request));
    }

    // ==========================================================
    // SAFETY CHECK
    // ==========================================================

    if (operations.length === 0) {
      this.errorMessage = 'No changes were found to save.';

      this.isSaving = false;

      return;
    }

    // ==========================================================
    // EXECUTE OPERATIONS
    // ==========================================================

    this.executeOperations(operations, 0);
  }

  // ============================================================
  // EXECUTE OPERATIONS SEQUENTIALLY
  // ============================================================

  private executeOperations(
    operations: Array<() => Observable<void>>,

    index: number,
  ): void {
    if (index >= operations.length) {
      this.onSaveSuccess();

      return;
    }

    operations[index]()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // No action required.
        },

        error: (error) => {
          console.error('Failed to save visit changes:', error);

          this.isSaving = false;

          this.errorMessage =
            error?.error?.message ?? error?.message ?? 'Failed to save visit changes.';

          this.cdr.detectChanges();
        },

        complete: () => {
          this.executeOperations(operations, index + 1);
        },
      });
  }

  // ============================================================
  // SAVE SUCCESS
  // ============================================================

  private onSaveSuccess(): void {
    this.isSaving = false;

    this.successMessage = 'Visit updated successfully.';

    this.cdr.detectChanges();

    setTimeout(() => {
      this.router.navigate(['/admin/visits']);
    }, 800);
  }

  // ============================================================
  // CANCEL
  // ============================================================

  cancelEdit(): void {
    this.router.navigate(['/admin/visits']);
  }

  // ============================================================
  // ID COMPARISON
  // ============================================================

  private areIdsEqual(
    first: string | null | undefined,

    second: string | null | undefined,
  ): boolean {
    if (first === null || first === undefined || second === null || second === undefined) {
      return first === second;
    }

    return String(first).toLowerCase() === String(second).toLowerCase();
  }

  // ============================================================
  // STATUS CLASS
  // ============================================================

  getStatusClass(): string {
    if (!this.visit) {
      return '';
    }

    switch (this.visit.status) {
      case 'Scheduled':
        return 'scheduled';

      case 'Accepted':
        return 'accepted';

      case 'Completed':
        return 'completed';

      case 'Cancelled':
        return 'cancelled';

      default:
        return '';
    }
  }

  // ============================================================
  // AREA NAME
  // ============================================================

  getAreaName(): string {
    if (!this.visit?.areaId) {
      return 'Not assigned';
    }

    const area = this.areas.find((item) => this.areIdsEqual(item.id, this.visit?.areaId));

    return area?.name ?? this.visit.areaName ?? 'Not assigned';
  }

  // ============================================================
  // SERVICE NAME
  // ============================================================

  getServiceName(): string {
    return this.visit?.serviceName ?? 'Not available';
  }

  // ============================================================
  // PACKAGE NAME
  // ============================================================

  getPackageName(): string {
    return this.visit?.packageName ?? 'Not available';
  }

  // ============================================================
  // PATIENT NAME
  // ============================================================

  getPatientName(): string {
    return this.visit?.patientName ?? 'Not available';
  }

  // ============================================================
  // PATIENT PHONE
  // ============================================================

  getPatientPhone(): string {
    return this.visit?.patientPhone ?? 'Not available';
  }

  // ============================================================
  // PATIENT ADDRESS
  // ============================================================

  getPatientAddress(): string {
    return this.visit?.patientAddress ?? 'Not available';
  }

  // ============================================================
  // PATIENT DESCRIPTION
  // ============================================================

  getPatientDescription(): string {
    return this.visit?.patientDescription ?? 'No description provided.';
  }

  // ============================================================
  // CURRENT PRACTITIONER
  // ============================================================

  getCurrentPractitionerName(): string {
    return this.visit?.practitionerName ?? this.getSelectedPractitionerName();
  }

  // ============================================================
  // TRACK PRACTITIONER
  // ============================================================

  trackByPractitioner(_index: number, practitioner: Practitioner): string {
    return String(practitioner.id);
  }

  // ============================================================
  // TRACK AREA
  // ============================================================

  trackByArea(_index: number, area: Area): string {
    return String(area.id);
  }
}
