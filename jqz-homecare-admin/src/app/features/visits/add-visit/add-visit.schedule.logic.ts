import { ChangeDetectorRef } from '@angular/core';

import { VisitsService } from '../visits.service';
import { Visit } from '../visits.interface';

import { AddVisitForm, PractitionerScheduleItem, VisitAssignmentForm } from './add-visit.models';

// ============================================================
// SCHEDULE LOGIC
// ============================================================

export class AddVisitScheduleLogic {
  readonly scheduleStartHour = 0;
  readonly scheduleEndHour = 24;

  practitionerVisits: Record<number, Visit[]> = {};
  isLoadingSchedule: Record<number, boolean> = {};
  scheduleErrors: Record<number, string> = {};

  private scheduleRequestVersions: Record<number, number> = {};

  private generation = 0;

  constructor(
    private readonly visitsService: VisitsService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  // ============================================================
  // RESET ALL
  // ============================================================

  resetAll(): void {
    this.generation++;

    this.practitionerVisits = {};
    this.isLoadingSchedule = {};
    this.scheduleErrors = {};
    this.scheduleRequestVersions = {};
  }

  // ============================================================
  // INVALIDATE REQUEST
  // ============================================================

  invalidateScheduleRequest(index: number): void {
    this.scheduleRequestVersions[index] = (this.scheduleRequestVersions[index] ?? 0) + 1;
  }

  // ============================================================
  // RESET SCHEDULE STATE FOR ASSIGNMENT
  // ============================================================

  resetScheduleState(index: number): void {
    this.invalidateScheduleRequest(index);

    delete this.practitionerVisits[index];
    delete this.isLoadingSchedule[index];
    delete this.scheduleErrors[index];
  }

  // ============================================================
  // LOAD PRACTITIONER SCHEDULE
  // ============================================================

  loadPractitionerSchedule(
    index: number,
    form: AddVisitForm,
    getErrorMessage: (error: unknown) => string,
  ): void {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    const practitionerId = assignment.practitionerId;

    const scheduledDate = assignment.scheduledDate;

    if (!practitionerId || !scheduledDate) {
      this.resetScheduleState(index);
      return;
    }

    const requestVersion = (this.scheduleRequestVersions[index] ?? 0) + 1;

    this.scheduleRequestVersions[index] = requestVersion;

    const currentGeneration = this.generation;

    this.isLoadingSchedule[index] = true;
    this.scheduleErrors[index] = '';

    this.visitsService.getPractitionerVisitsByDate(practitionerId, scheduledDate).subscribe({
      next: (visits) => {
        if (
          currentGeneration !== this.generation ||
          this.scheduleRequestVersions[index] !== requestVersion
        ) {
          return;
        }

        this.practitionerVisits[index] = visits ?? [];

        this.isLoadingSchedule[index] = false;
        this.scheduleErrors[index] = '';

        this.cdr.detectChanges();
      },

      error: (error: unknown) => {
        if (
          currentGeneration !== this.generation ||
          this.scheduleRequestVersions[index] !== requestVersion
        ) {
          return;
        }

        this.practitionerVisits[index] = [];
        this.isLoadingSchedule[index] = false;
        this.scheduleErrors[index] = getErrorMessage(error);

        this.cdr.detectChanges();
      },
    });
  }

  // ============================================================
  // GET SCHEDULE
  // ============================================================

  getPractitionerSchedule(index: number): PractitionerScheduleItem[] {
    const visits = this.practitionerVisits[index] ?? [];

    const bookedIntervals = visits
      .filter((visit) => !!visit.slotStart && !!visit.slotEnd)
      .map((visit) => ({
        start: this.timeToMinutes(visit.slotStart),
        end: this.timeToMinutes(visit.slotEnd),
        patientName: visit.patientName || 'Booked',
        visitId: visit.id,
      }))
      .filter((interval) => interval.start < interval.end)
      .sort((a, b) => a.start - b.start);

    const result: PractitionerScheduleItem[] = [];

    let currentMinutes = this.scheduleStartHour * 60;

    for (const booked of bookedIntervals) {
      if (booked.start > currentMinutes) {
        result.push({
          start: this.minutesToTime(currentMinutes),
          end: this.minutesToTime(booked.start),
          status: 'AVAILABLE',
        });
      }

      if (booked.end > currentMinutes) {
        result.push({
          start: this.minutesToTime(Math.max(currentMinutes, booked.start)),
          end: this.minutesToTime(booked.end),
          status: 'BOOKED',
          patientName: booked.patientName,
          visitId: booked.visitId,
        });

        currentMinutes = Math.max(currentMinutes, booked.end);
      }
    }

    const endOfDay = this.scheduleEndHour * 60;

    if (currentMinutes < endOfDay) {
      result.push({
        start: this.minutesToTime(currentMinutes),
        end: this.minutesToTime(endOfDay),
        status: 'AVAILABLE',
      });
    }

    return result;
  }

  // ============================================================
  // BOOKED VISIT COUNT
  // ============================================================

  getBookedVisitCount(index: number): number {
    return this.practitionerVisits[index]?.length ?? 0;
  }

  // ============================================================
  // SHOULD SHOW SCHEDULE
  // ============================================================

  shouldShowPractitionerSchedule(index: number, form: AddVisitForm): boolean {
    const assignment = form.visitAssignments[index];

    return !!(assignment?.practitionerId && assignment?.scheduledDate);
  }

  // ============================================================
  // PARTIAL SCHEDULE
  // ============================================================

  hasPartialSchedule(assignment: VisitAssignmentForm): boolean {
    const hasDate = !!assignment.scheduledDate;

    const hasStart = !!assignment.slotStart;

    const hasEnd = !!assignment.slotEnd;

    const hasAny = hasDate || hasStart || hasEnd;

    const isComplete = hasDate && hasStart && hasEnd;

    return hasAny && !isComplete;
  }

  // ============================================================
  // TIME RANGE ERROR
  // ============================================================

  getTimeRangeError(index: number, form: AddVisitForm): string {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return '';
    }

    if (!assignment.slotStart || !assignment.slotEnd) {
      return '';
    }

    const start = this.timeToMinutes(assignment.slotStart);

    const end = this.timeToMinutes(assignment.slotEnd);

    if (start >= end) {
      return 'End time must be after start time.';
    }

    if (
      !this.isWithinWorkingHours(assignment.slotStart) ||
      !this.isWithinWorkingHours(assignment.slotEnd)
    ) {
      return 'Selected time must be within the allowed working hours.';
    }

    if (this.hasScheduleConflict(index, form)) {
      return 'Selected time overlaps with another scheduled visit.';
    }

    return '';
  }

  // ============================================================
  // INVALID TIME ORDER
  // ============================================================

  hasInvalidTimeOrder(assignment: VisitAssignmentForm): boolean {
    if (!assignment.slotStart || !assignment.slotEnd) {
      return false;
    }

    return this.timeToMinutes(assignment.slotStart) >= this.timeToMinutes(assignment.slotEnd);
  }

  // ============================================================
  // WORKING HOURS
  // ============================================================

  isWithinWorkingHours(time: string | null | undefined): boolean {
    if (!time) {
      return false;
    }

    const minutes = this.timeToMinutes(time);

    return minutes >= this.scheduleStartHour * 60 && minutes <= this.scheduleEndHour * 60;
  }

  // ============================================================
  // SCHEDULE CONFLICT
  // ============================================================

  hasScheduleConflict(index: number, form: AddVisitForm): boolean {
    const assignment = form.visitAssignments[index];

    if (
      !assignment ||
      !assignment.practitionerId ||
      !assignment.scheduledDate ||
      !assignment.slotStart ||
      !assignment.slotEnd
    ) {
      return false;
    }

    const start = this.timeToMinutes(assignment.slotStart);

    const end = this.timeToMinutes(assignment.slotEnd);

    if (start >= end) {
      return false;
    }

    // ------------------------------------------------------------
    // EXISTING DATABASE VISITS
    // ------------------------------------------------------------

    const existingVisits = this.practitionerVisits[index] ?? [];

    const existingConflict = existingVisits.some((visit) => {
      if (!visit.slotStart || !visit.slotEnd) {
        return false;
      }

      const existingStart = this.timeToMinutes(visit.slotStart);

      const existingEnd = this.timeToMinutes(visit.slotEnd);

      return start < existingEnd && end > existingStart;
    });

    if (existingConflict) {
      return true;
    }

    // ------------------------------------------------------------
    // OTHER ASSIGNMENTS IN CURRENT FORM
    // ------------------------------------------------------------

    return form.visitAssignments.some((other, otherIndex) => {
      if (
        otherIndex === index ||
        other.practitionerId !== assignment.practitionerId ||
        other.scheduledDate !== assignment.scheduledDate ||
        !other.slotStart ||
        !other.slotEnd
      ) {
        return false;
      }

      const otherStart = this.timeToMinutes(other.slotStart);

      const otherEnd = this.timeToMinutes(other.slotEnd);

      return start < otherEnd && end > otherStart;
    });
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  formatTime(time: string | null | undefined): string {
    if (!time) {
      return '';
    }

    const minutes = this.timeToMinutes(time);

    if (minutes < 0) {
      return time;
    }

    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    const suffix = hours >= 12 ? 'PM' : 'AM';

    const displayHour = hours % 12 || 12;

    return `${displayHour}:${mins.toString().padStart(2, '0')} ${suffix}`;
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  formatDate(assignmentDate: string | null | undefined): string {
    if (!assignmentDate) {
      return '';
    }

    const date = new Date(`${assignmentDate}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return assignmentDate;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // ============================================================
  // DATE CHANGE
  // ============================================================

  onAssignmentDateChange(
    index: number,
    form: AddVisitForm,
    getErrorMessage: (error: unknown) => string,
  ): void {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    assignment.slotStart = null;
    assignment.slotEnd = null;

    this.resetScheduleState(index);

    if (assignment.practitionerId && assignment.scheduledDate) {
      this.loadPractitionerSchedule(index, form, getErrorMessage);
    }
  }

  // ============================================================
  // TIME CHANGE
  // ============================================================

  onTimeChange(index: number, form: AddVisitForm): void {
    const assignment = form.visitAssignments[index];

    if (!assignment) {
      return;
    }

    // Nothing else is required here.
    // Validation is performed through getTimeRangeError().
  }

  // ============================================================
  // CONVERT TIME TO MINUTES
  // ============================================================

  private timeToMinutes(time: string | null | undefined): number {
    if (!time) {
      return -1;
    }

    const normalized = time.trim();

    const match = normalized.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

    if (!match) {
      return -1;
    }

    const hours = Number(match[1]);

    const minutes = Number(match[2]);

    if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) {
      return -1;
    }

    return hours * 60 + minutes;
  }

  // ============================================================
  // MINUTES TO TIME
  // ============================================================

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);

    const mins = minutes % 60;

    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // ============================================================
  // DATE INPUT VALUE
  // ============================================================

  toDateInputValue(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.slice(0, 10);
  }

  // ============================================================
  // TIME INPUT VALUE
  // ============================================================

  toTimeInputValue(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    return value.slice(0, 5);
  }
}
