import { CommonModule } from '@angular/common';

import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { ActivatedRoute, Router } from '@angular/router';

import { Observable, forkJoin, Subject, takeUntil } from 'rxjs';

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
// PRACTITIONER SCHEDULE ITEM
// ============================================================

interface PractitionerScheduleItem {
  start: string;

  end: string;

  status: 'BOOKED' | 'AVAILABLE' | 'CURRENT';

  patientName?: string;

  visitId?: string;
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
  // SCHEDULE CONFIGURATION
  // ============================================================

  readonly scheduleStartHour = 0;

  readonly scheduleEndHour = 24;

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
  // PRACTITIONER SCHEDULE
  // ============================================================

  practitionerVisits: Visit[] = [];

  isLoadingSchedule = false;

  scheduleError = '';

  private scheduleRequestVersion = 0;

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

    this.resetScheduleState();

    this.detectChanges();

    forkJoin({
      visit: this.visitsService.getById(visitId),

      practitioners: this.practitionerService.getPractitioners(),

      areas: this.cityAreaService.getAreas(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ visit, practitioners, areas }) => {
          console.log('EDIT VISIT INITIAL DATA LOADED');

          this.visit = visit;

          this.practitioners = practitioners ?? [];

          this.areas = areas ?? [];

          // ------------------------------------------------------
          // POPULATE FORM
          // ------------------------------------------------------

          this.populateForm(visit);

          // ------------------------------------------------------
          // INITIALIZE FILTERED LISTS
          //
          // IMPORTANT:
          //
          // The practitioner list is filtered by the visit's
          // service first and then prioritized by area.
          // ------------------------------------------------------

          this.filteredAreas = [...this.areas];

          this.filteredPractitioners = this.getPrioritizedPractitioners();

          // ------------------------------------------------------
          // RESTORE SELECTED VALUES
          // ------------------------------------------------------

          this.restoreSelectedAreaDisplay();

          this.restoreSelectedPractitionerDisplay();

          // ------------------------------------------------------
          // STOP LOADING
          // ------------------------------------------------------

          this.isLoading = false;

          this.isLoadingPractitioners = false;

          this.isLoadingAreas = false;

          // ------------------------------------------------------
          // LOAD SCHEDULE
          // ------------------------------------------------------

          this.loadPractitionerSchedule();

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

    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // Changing the area must recalculate practitioner priority.
    //
    // Practitioners who:
    //   1. provide the visit service
    //   2. are assigned to the newly selected area
    //
    // are placed first.
    // ----------------------------------------------------------

    this.filteredPractitioners = this.getPrioritizedPractitioners();

    this.closeAreaDropdown();
  }

  clearAreaSelection(): void {
    this.form.areaId = null;

    this.areaSearchTerm = '';

    this.filteredAreas = [...this.areas];

    // ----------------------------------------------------------
    // If no area is selected, practitioners are still restricted
    // to the visit's service.
    // ----------------------------------------------------------

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
    // ----------------------------------------------------------
    // IMPORTANT:
    //
    // getPrioritizedPractitioners() already performs:
    //
    // 1. Service filtering
    // 2. Area prioritization
    //
    // Search is then performed against that resulting list.
    // ----------------------------------------------------------

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

    this.onPractitionerScheduleChange();
  }

  clearPractitionerSelection(): void {
    this.form.practitionerId = null;

    this.practitionerSearchTerm = '';

    this.filteredPractitioners = this.getPrioritizedPractitioners();

    this.onPractitionerScheduleChange();
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
  // CHECK PRACTITIONER SERVICE
  // ============================================================
  //
  // Only practitioners who provide the service of the current
  // visit are allowed to appear in the practitioner dropdown.
  //
  // Example:
  //
  // Visit Service = General Fever
  //
  // General Fever practitioner     -> SHOW
  // General Fever practitioner     -> SHOW
  // Physiotherapy practitioner     -> HIDE
  // Occupational Therapy           -> HIDE
  //
  // ============================================================

  isPractitionerForSelectedService(practitioner: Practitioner): boolean {
    const selectedServiceId = this.visit?.serviceId;

    if (!selectedServiceId) {
      return false;
    }

    return this.areIdsEqual(practitioner.serviceId, selectedServiceId);
  }

  // ============================================================
  // CHECK PRACTITIONER AREA
  // ============================================================

  isPractitionerAssignedToSelectedArea(practitioner: Practitioner): boolean {
    if (!this.form.areaId) {
      return false;
    }

    return (
      practitioner.areas?.some((area) => this.areIdsEqual(area.id, this.form.areaId!)) ?? false
    );
  }

  // ============================================================
  // PRIORITIZED PRACTITIONERS
  // ============================================================
  //
  // REQUIRED BUSINESS RULE:
  //
  // Only practitioners having the visit's service are included.
  //
  // Among those practitioners:
  //
  // Priority 1:
  // Service + Selected Area
  //
  // Priority 2:
  // Service but NOT Selected Area
  //
  // Example:
  //
  // Visit:
  // Service = General Fever
  // Area    = M Block Lahore
  //
  // Result:
  //
  // 1. Practitioner A -> General Fever + M Block Lahore
  // 2. Practitioner B -> General Fever + M Block Lahore
  // 3. Practitioner C -> General Fever + M Block Lahore
  // 4. Practitioner D -> General Fever + another area
  // 5. Practitioner E -> General Fever + no selected area
  //
  // Other services are never included.
  // ============================================================

  getPrioritizedPractitioners(): Practitioner[] {
    // ----------------------------------------------------------
    // STEP 1:
    // Get the service of the current visit.
    // ----------------------------------------------------------

    const selectedServiceId = this.visit?.serviceId;

    if (!selectedServiceId) {
      return [];
    }

    // ----------------------------------------------------------
    // STEP 2:
    // Filter ONLY practitioners who provide this service.
    // ----------------------------------------------------------

    const servicePractitioners = this.practitioners.filter((practitioner) =>
      this.areIdsEqual(practitioner.serviceId, selectedServiceId),
    );

    // ----------------------------------------------------------
    // STEP 3:
    // If no area is selected, return all practitioners for the
    // visit service.
    //
    // IMPORTANT:
    //
    // We do NOT return this.practitioners here because that would
    // incorrectly display practitioners from other services.
    // ----------------------------------------------------------

    if (!this.form.areaId) {
      return [...servicePractitioners];
    }

    // ----------------------------------------------------------
    // STEP 4:
    // Separate service practitioners into:
    //
    // A. Assigned to selected area
    // B. Not assigned to selected area
    // ----------------------------------------------------------

    const assignedToArea = servicePractitioners.filter((practitioner) =>
      this.isPractitionerAssignedToSelectedArea(practitioner),
    );

    const otherServicePractitioners = servicePractitioners.filter(
      (practitioner) => !this.isPractitionerAssignedToSelectedArea(practitioner),
    );

    // ----------------------------------------------------------
    // STEP 5:
    // Area-assigned practitioners first.
    // Other practitioners with the same service after them.
    // ----------------------------------------------------------

    return [...assignedToArea, ...otherServicePractitioners];
  }

  // ============================================================
  // ID COMPARISON
  // ============================================================
  //
  // Backend IDs are normally GUID strings.
  //
  // This helper makes comparison slightly safer by:
  //
  // - handling null/undefined safely
  // - ignoring casing differences
  // - avoiding accidental whitespace mismatch
  //
  // ============================================================

  private areIdsEqual(
    firstId: string | null | undefined,
    secondId: string | null | undefined,
  ): boolean {
    if (!firstId || !secondId) {
      return false;
    }

    return firstId.trim().toLowerCase() === secondId.trim().toLowerCase();
  }

  // ============================================================
  // SCHEDULE DATE CHANGE
  // ============================================================

  onScheduleDateChange(): void {
    this.resetScheduleState();

    this.loadPractitionerSchedule();
  }

  // ============================================================
  // PRACTITIONER SCHEDULE CHANGE
  // ============================================================

  onPractitionerScheduleChange(): void {
    this.resetScheduleState();

    this.loadPractitionerSchedule();
  }

  // ============================================================
  // INVALIDATE REQUEST
  // ============================================================

  private invalidateScheduleRequest(): void {
    this.scheduleRequestVersion++;
  }

  // ============================================================
  // RESET SCHEDULE
  // ============================================================

  private resetScheduleState(): void {
    this.invalidateScheduleRequest();

    this.practitionerVisits = [];

    this.isLoadingSchedule = false;

    this.scheduleError = '';
  }

  // ============================================================
  // LOAD PRACTITIONER SCHEDULE
  // ============================================================

  private loadPractitionerSchedule(): void {
    if (!this.form.practitionerId || !this.form.scheduledDate) {
      this.practitionerVisits = [];

      this.isLoadingSchedule = false;

      this.scheduleError = '';

      return;
    }

    const practitionerId = this.form.practitionerId;

    const scheduledDate = this.form.scheduledDate;

    const requestVersion = ++this.scheduleRequestVersion;

    this.isLoadingSchedule = true;

    this.scheduleError = '';

    this.practitionerVisits = [];

    console.log('Loading practitioner schedule:', {
      practitionerId,
      scheduledDate,
      requestVersion,
    });

    this.visitsService
      .getByDate(scheduledDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (visits) => {
          if (this.scheduleRequestVersion !== requestVersion) {
            return;
          }

          if (
            this.form.practitionerId !== practitionerId ||
            this.form.scheduledDate !== scheduledDate
          ) {
            return;
          }

          // =====================================================
          // IMPORTANT:
          //
          // DO NOT EXCLUDE THE CURRENT VISIT HERE.
          //
          // We need it in the schedule so that its current slot
          // remains visible.
          //
          // The current visit is excluded ONLY during overlap
          // validation.
          // =====================================================

          const practitionerVisits = visits
            .filter(
              (visit) =>
                visit.practitionerId === practitionerId && !!visit.slotStart && !!visit.slotEnd,
            )
            .sort(
              (a, b) => this.getTimeValue(a.slotStart ?? '') - this.getTimeValue(b.slotStart ?? ''),
            );

          this.practitionerVisits = practitionerVisits;

          this.isLoadingSchedule = false;

          this.scheduleError = '';

          this.detectChanges();

          console.log('Practitioner schedule loaded:', practitionerVisits);
        },

        error: (error: unknown) => {
          if (this.scheduleRequestVersion !== requestVersion) {
            return;
          }

          if (
            this.form.practitionerId !== practitionerId ||
            this.form.scheduledDate !== scheduledDate
          ) {
            return;
          }

          console.error('Failed to load practitioner schedule:', error);

          this.practitionerVisits = [];

          this.isLoadingSchedule = false;

          this.scheduleError = this.getErrorMessage(
            error,
            'Unable to load the practitioner schedule.',
          );

          this.detectChanges();
        },
      });
  }

  // ============================================================
  // SHOULD SHOW SCHEDULE
  // ============================================================

  shouldShowPractitionerSchedule(): boolean {
    return !!(this.form.practitionerId && this.form.scheduledDate);
  }

  // ============================================================
  // GET PRACTITIONER VISITS
  // ============================================================

  getPractitionerVisits(): Visit[] {
    return this.practitionerVisits;
  }

  // ============================================================
  // CHECK IF CURRENT VISIT
  // ============================================================

  isCurrentVisit(visit: Visit): boolean {
    return !!this.visit && visit.id === this.visit.id;
  }

  // ============================================================
  // GET PRACTITIONER SCHEDULE
  //
  // The schedule is generated dynamically.
  //
  // Example:
  //
  // 08:00 - 08:30 AVAILABLE
  // 08:30 - 09:30 CURRENT VISIT
  // 09:30 - 10:00 AVAILABLE
  // ============================================================

  getPractitionerSchedule(): PractitionerScheduleItem[] {
    if (!this.form.practitionerId || !this.form.scheduledDate) {
      return [];
    }

    const schedule: PractitionerScheduleItem[] = [];

    const relevantVisits = this.practitionerVisits
      .filter((visit) => !!visit.slotStart && !!visit.slotEnd)
      .sort((a, b) => this.getTimeValue(a.slotStart ?? '') - this.getTimeValue(b.slotStart ?? ''));

    // ----------------------------------------------------------
    // Create exact booked/current visit slots.
    // ----------------------------------------------------------

    const occupiedSlots = relevantVisits.map((visit) => {
      const isCurrent = this.isCurrentVisit(visit);

      return {
        start: this.formatTimeForInput(visit.slotStart) ?? '',

        end: this.formatTimeForInput(visit.slotEnd) ?? '',

        status: isCurrent ? ('CURRENT' as const) : ('BOOKED' as const),

        patientName: visit.patientName || 'Unknown Patient',

        visitId: visit.id,
      };
    });

    // ----------------------------------------------------------
    // Generate available gaps between visits.
    // ----------------------------------------------------------

    let cursor = '00:00';

    for (const occupied of occupiedSlots) {
      if (this.getTimeValue(cursor) < this.getTimeValue(occupied.start)) {
        schedule.push({
          start: cursor,

          end: occupied.start,

          status: 'AVAILABLE',
        });
      }

      schedule.push(occupied);

      if (this.getTimeValue(occupied.end) > this.getTimeValue(cursor)) {
        cursor = occupied.end;
      }
    }

    // ----------------------------------------------------------
    // Add remaining time until end of day.
    // ----------------------------------------------------------

    if (this.getTimeValue(cursor) < this.getTimeValue('23:59')) {
      schedule.push({
        start: cursor,

        end: '23:59',

        status: 'AVAILABLE',
      });
    }

    return schedule;
  }

  // ============================================================
  // GET BOOKED VISIT COUNT
  // ============================================================

  getBookedVisitCount(): number {
    return this.practitionerVisits.filter((visit) => !this.isCurrentVisit(visit)).length;
  }

  // ============================================================
  // GET AVAILABLE SLOT COUNT
  // ============================================================

  getAvailableSlotCount(): number {
    return this.getPractitionerSchedule().filter((slot) => slot.status === 'AVAILABLE').length;
  }

  // ============================================================
  // FORMAT TIME FOR DISPLAY
  // ============================================================

  formatTimeForDisplay(value: string): string {
    if (!value) {
      return '';
    }

    const timeValue = value.substring(0, 5);

    const [hoursString, minutes] = timeValue.split(':');

    let hours = Number(hoursString);

    const period = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${hours}:${minutes} ${period}`;
  }

  // ============================================================
  // TIME INPUT CHANGE
  // ============================================================

  onTimeChange(): void {
    this.errorMessage = '';

    if (
      this.form.startTime &&
      this.form.endTime &&
      this.getTimeValue(this.form.startTime) >= this.getTimeValue(this.form.endTime)
    ) {
      this.errorMessage = 'End time must be later than start time.';

      return;
    }

    const timeRangeError = this.getTimeRangeError();

    if (timeRangeError) {
      this.errorMessage = timeRangeError;
    }
  }

  // ============================================================
  // CHECK WORKING HOURS
  // ============================================================

  isWithinWorkingHours(start: string | null, end: string | null): boolean {
    if (!start || !end) {
      return true;
    }

    const startValue = this.getTimeValue(start);

    const endValue = this.getTimeValue(end);

    const minimumTime = 0;

    const maximumTime = 23 * 60 + 59;

    return startValue >= minimumTime && endValue <= maximumTime;
  }

  // ============================================================
  // GET TIME RANGE ERROR
  // ============================================================

  getTimeRangeError(): string {
    if (!this.form.startTime || !this.form.endTime) {
      return '';
    }

    if (this.getTimeValue(this.form.startTime) >= this.getTimeValue(this.form.endTime)) {
      return 'End time must be later than start time.';
    }

    if (!this.isWithinWorkingHours(this.form.startTime, this.form.endTime)) {
      return 'The selected time must be between 12:00 AM and 11:59 PM.';
    }

    // ==========================================================
    // EXCLUDE ONLY THE CURRENT VISIT FROM VALIDATION
    // ==========================================================

    const conflictingVisit = this.practitionerVisits.find(
      (visit) =>
        visit.id !== this.visit?.id &&
        this.doesTimeRangeOverlap(
          this.form.startTime!,
          this.form.endTime!,
          visit.slotStart ?? '',
          visit.slotEnd ?? '',
        ),
    );

    if (conflictingVisit) {
      const patientName = conflictingVisit.patientName || 'another patient';

      return `The selected time conflicts with an existing visit for ${patientName}.`;
    }

    return '';
  }

  // ============================================================
  // TIME RANGE OVERLAP
  // ============================================================

  private doesTimeRangeOverlap(
    startA: string,
    endA: string,
    startB: string,
    endB: string,
  ): boolean {
    if (!startA || !endA || !startB || !endB) {
      return false;
    }

    const startAValue = this.getTimeValue(startA);

    const endAValue = this.getTimeValue(endA);

    const startBValue = this.getTimeValue(startB);

    const endBValue = this.getTimeValue(endB);

    return startAValue < endBValue && endAValue > startBValue;
  }

  // ============================================================
  // GET TIME VALUE
  // ============================================================

  private getTimeValue(value: string): number {
    if (!value) {
      return 0;
    }

    const parts = value.substring(0, 5).split(':');

    const hours = Number(parts[0] ?? 0);

    const minutes = Number(parts[1] ?? 0);

    return hours * 60 + minutes;
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

    return this.getTimeValue(this.form.startTime) >= this.getTimeValue(this.form.endTime);
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

    const timeRangeError = this.getTimeRangeError();

    if (timeRangeError) {
      this.errorMessage = timeRangeError;

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
  // EXECUTE OPERATIONS
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
