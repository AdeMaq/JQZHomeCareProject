import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Package, PackageService } from '../../../core/services/package';
import { Practitioner, PractitionerService } from '../../../core/services/practitioner';
import { Area, CityAreaService } from '../../../core/services/city-area';

import { CreateVisitRequest, VisitsService } from '../visits.service';
import { Visit } from '../visits.interface';

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
// PRACTITIONER SCHEDULE ITEM
// ============================================================

interface PractitionerScheduleItem {
  start: string;
  end: string;
  status: 'BOOKED' | 'AVAILABLE';
  patientName?: string;
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
   * UI payment type.
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
  // WORKING HOURS
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
  // SEARCHABLE DROPDOWN STATE
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

  /*
   * Every schedule request gets a unique version number.
   *
   * If the practitioner or date changes while an older request
   * is still running, that older response is ignored.
   */
  private scheduleRequestVersions: Record<number, number> = {};

  // ============================================================
  // SELECTED PACKAGE
  // ============================================================

  selectedPackage: Package | null = null;

  // ============================================================
  // LOADING STATES
  // ============================================================

  isLoading = false;
  isLoadingPackages = false;
  isLoadingPractitioners = false;
  isLoadingAreas = false;
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

  getPractitionersForAssignment(index: number): Practitioner[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return [];
    }

    let result = [...this.practitioners];

    const search = (this.practitionerSearchTerms[index] ?? '').trim().toLowerCase();

    if (search) {
      result = result.filter((practitioner) =>
        (practitioner.name ?? '').toLowerCase().includes(search),
      );
    }

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

  // ============================================================
  // PRACTITIONER CHANGE
  // ============================================================

  onPractitionerChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    /*
     * Changing practitioner means the previous schedule
     * and selected time are no longer valid.
     */
    assignment.slotStart = null;
    assignment.slotEnd = null;

    this.resetScheduleState(index);

    /*
     * If a date is already selected, immediately fetch
     * the schedule for the newly selected practitioner.
     */
    this.loadPractitionerSchedule(index);
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
     * Area affects practitioner suitability/order.
     *
     * Invalidate any currently running request so an old
     * response cannot update stale schedule data.
     */
    this.invalidateScheduleRequest(index);

    /*
     * If your business rules require changing area to also
     * invalidate the selected practitioner, uncomment:
     *
     * assignment.practitionerId = null;
     * assignment.slotStart = null;
     * assignment.slotEnd = null;
     * this.resetScheduleState(index);
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
     * A different date has a completely different schedule.
     */
    assignment.slotStart = null;
    assignment.slotEnd = null;

    this.resetScheduleState(index);

    /*
     * This is triggered directly by:
     *
     * (ngModelChange)="onAssignmentDateChange(i)"
     *
     * So the API request starts immediately when the date
     * value changes.
     */
    this.loadPractitionerSchedule(index);
  }

  // ============================================================
  // INVALIDATE SCHEDULE REQUEST
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
    /*
     * Invalidate any request currently in progress.
     */
    this.invalidateScheduleRequest(index);

    /*
     * Create new object references so the schedule state
     * is replaced as one consistent update.
     */
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

    /*
     * A schedule only exists when both practitioner and date
     * are selected.
     */
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

      return;
    }

    const practitionerId = assignment.practitionerId;
    const scheduledDate = assignment.scheduledDate;

    /*
     * Create a new request version.
     *
     * Only the latest request version is allowed to update
     * this assignment's schedule state.
     */
    const requestVersion = (this.scheduleRequestVersions[index] ?? 0) + 1;

    this.scheduleRequestVersions = {
      ...this.scheduleRequestVersions,
      [index]: requestVersion,
    };

    /*
     * Immediately show loading and clear stale data.
     */
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

    console.log(`Loading practitioner schedule for assignment ${index + 1}`, {
      practitionerId,
      scheduledDate,
      requestVersion,
    });

    this.visitsService.getByDate(scheduledDate).subscribe({
      next: (visits) => {
        /*
         * Ignore stale responses.
         */
        if (this.scheduleRequestVersions[index] !== requestVersion) {
          return;
        }

        const currentAssignment = this.form.visitAssignments[index];

        /*
         * Also verify that the current form state still
         * matches the request that was sent.
         */
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
              visit.practitionerId === practitionerId && !!visit.slotStart && !!visit.slotEnd,
          )
          .sort((a, b) => this.getTimeValue(a.slotStart) - this.getTimeValue(b.slotStart));

        /*
         * Replace state with new object references.
         *
         * Angular can now render the schedule immediately
         * without requiring a click or focus event.
         */
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

        console.log(
          `Practitioner schedule loaded for assignment ${index + 1}:`,
          practitionerVisits,
        );
      },

      error: (error: unknown) => {
        /*
         * Ignore errors from stale requests as well.
         */
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
      },
    });
  }

  // ============================================================
  // SHOULD SHOW PRACTITIONER SCHEDULE
  // ============================================================

  shouldShowPractitionerSchedule(index: number): boolean {
    const assignment = this.form.visitAssignments[index];

    return !!(assignment?.practitionerId && assignment?.scheduledDate);
  }

  // ============================================================
  // GET PRACTITIONER VISITS
  // ============================================================

  getPractitionerVisits(index: number): Visit[] {
    return this.practitionerVisits[index] ?? [];
  }

  // ============================================================
  // GET PRACTITIONER SCHEDULE
  // ============================================================

  getPractitionerSchedule(index: number): PractitionerScheduleItem[] {
    const assignment = this.form.visitAssignments[index];

    if (!assignment?.scheduledDate) {
      return [];
    }

    const bookedVisits = this.getPractitionerVisits(index);

    const schedule: PractitionerScheduleItem[] = [];

    /*
     * Full 24-hour timeline.
     */
    for (let hour = this.scheduleStartHour; hour < this.scheduleEndHour; hour++) {
      const start = `${hour.toString().padStart(2, '0')}:00`;

      const nextHour = hour + 1;

      const end = nextHour === 24 ? '23:59' : `${nextHour.toString().padStart(2, '0')}:00`;

      const bookedVisit = bookedVisits.find((visit) =>
        this.doesTimeRangeOverlap(start, end, visit.slotStart ?? '', visit.slotEnd ?? ''),
      );

      if (bookedVisit) {
        schedule.push({
          start,
          end,
          status: 'BOOKED',
          patientName: bookedVisit.patientName || 'Unknown Patient',
        });
      } else {
        schedule.push({
          start,
          end,
          status: 'AVAILABLE',
        });
      }
    }

    return schedule;
  }

  // ============================================================
  // GET BOOKED SLOT COUNT
  // ============================================================

  getBookedVisitCount(index: number): number {
    return this.getPractitionerSchedule(index).filter((slot) => slot.status === 'BOOKED').length;
  }

  // ============================================================
  // TIME INPUT CHANGE
  // ============================================================

  onTimeChange(index: number): void {
    const assignment = this.form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    this.errorMessage = '';

    /*
     * Immediately validate the selected time range.
     */
    if (
      assignment.slotStart &&
      assignment.slotEnd &&
      this.getTimeValue(assignment.slotStart) >= this.getTimeValue(assignment.slotEnd)
    ) {
      this.errorMessage = `Visit #${index + 1}: ` + 'End time must be later than start time.';
    }
  }

  // ============================================================
  // CHECK IF TIME IS INSIDE WORKING HOURS
  // ============================================================

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

  // ============================================================
  // GET TIME RANGE ERROR
  // ============================================================

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
        `Visit time must be between ` +
        `${this.formatTime(`${this.scheduleStartHour}:00`)} and ` +
        `${this.formatTime(`${this.scheduleEndHour}:00`)}.`
      );
    }

    if (assignment.slotStart && assignment.slotEnd && this.hasScheduleConflict(index)) {
      return 'The selected time overlaps with another visit ' + 'for this practitioner.';
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
  // TIME VALUE
  // ============================================================

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

    return hours * 60 + minutes;
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
    const startValueA = this.getTimeValue(startA);

    const endValueA = this.getTimeValue(endA);

    const startValueB = this.getTimeValue(startB);

    const endValueB = this.getTimeValue(endB);

    return startValueA < endValueB && endValueA > startValueB;
  }

  // ============================================================
  // CHECK SCHEDULE CONFLICT
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

    /*
     * Check conflict with existing backend visits.
     */
    const bookedVisits = this.practitionerVisits[index] ?? [];

    const conflictsWithExistingVisit = bookedVisits.some((visit) =>
      this.doesTimeRangeOverlap(
        assignment.slotStart ?? '',
        assignment.slotEnd ?? '',
        visit.slotStart ?? '',
        visit.slotEnd ?? '',
      ),
    );

    if (conflictsWithExistingVisit) {
      return true;
    }

    /*
     * Check conflict with another assignment
     * currently being created in this form.
     */
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
        otherAssignment.slotStart!,
        otherAssignment.slotEnd!,
      );
    });
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
  // PAYMENT TYPE VALUE
  // ============================================================

  private getPaymentTypeValue(): 0 | 1 {
    return this.form.paymentType === 'FullAdvance' ? 0 : 1;
  }

  // ============================================================
  // SUBMIT VISIT
  // ============================================================

  submitVisit(): void {
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
       * Date, start time and end time must all
       * be supplied together.
       */
      if (this.hasPartialSchedule(assignment)) {
        this.errorMessage =
          `Visit #${i + 1}: Scheduled date, start time and end time ` +
          'must all be provided together.';

        return;
      }

      /*
       * Validate time order.
       */
      if (
        assignment.slotStart &&
        assignment.slotEnd &&
        this.getTimeValue(assignment.slotStart) >= this.getTimeValue(assignment.slotEnd)
      ) {
        this.errorMessage = `Visit #${i + 1}: ` + 'End time must be later than start time.';

        return;
      }

      /*
       * Validate working hours.
       */
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

      /*
       * Validate overlap with backend visits
       * and other assignments.
       */
      if (this.hasScheduleConflict(i)) {
        this.errorMessage =
          `Visit #${i + 1}: ` +
          'The selected time overlaps with an existing visit ' +
          'for this practitioner. Please choose another time.';

        return;
      }
    }

    // ==========================================================
    // CREATE BACKEND PAYLOAD
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

        scheduledDate: assignment.scheduledDate || null,

        slotStart: assignment.slotStart || null,

        slotEnd: assignment.slotEnd || null,
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
      next: (response: unknown) => {
        console.log('================================================');

        console.log('VISIT CREATED SUCCESSFULLY');

        console.log('API RESPONSE:', response);

        console.log('================================================');

        this.isSubmitting = false;

        this.successMessage = 'Visit package created successfully.';

        this.router.navigate(['/visits']);
      },

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
        return 'The server encountered an error while creating the visit. ' + 'Please try again.';
      }

      if ((response.status ?? 0) >= 400) {
        return (
          'The visit could not be created. ' + 'Please check the entered information and try again.'
        );
      }
    }

    return fallbackMessage;
  }

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  closeDropdown(): void {
    this.openDropdown = null;
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
