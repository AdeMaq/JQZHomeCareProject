import { CommonModule } from '@angular/common';

import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { AddVisitLogic } from './add-visit.logic';

import {
  AddVisitForm,
  OpenDropdown,
  PractitionerScheduleItem,
  VisitAssignmentForm,
} from './add-visit.models';

import { Package } from '../../../core/services/package';

import { Practitioner } from '../../../core/services/practitioner';

import { Area } from '../../../core/services/city-area';

import { Patient } from '../../../core/services/patient.service';

import { Visit } from '../visits.interface';

// ============================================================
// COMPONENT
// ============================================================

@Component({
  selector: 'app-add-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [AddVisitLogic],
  templateUrl: './add-visit.html',
  styleUrl: './add-visit.css',
})
export class AddVisit implements OnInit {
  // ============================================================
  // LOGIC
  // ============================================================

  private readonly logic = inject(AddVisitLogic);

  // ============================================================
  // TEMPLATE STATE
  // ============================================================

  readonly form: AddVisitForm = this.logic.form;

  get packages(): Package[] {
    return this.logic.packages;
  }

  get practitioners(): Practitioner[] {
    return this.logic.practitioners;
  }

  get areas(): Area[] {
    return this.logic.areas;
  }

  // ============================================================
  // PATIENT LOOKUP STATE
  // ============================================================

  get existingPatientSuggestion(): Patient | null {
    return this.logic.existingPatientSuggestion;
  }

  get selectedExistingPatient(): Patient | null {
    return this.logic.selectedExistingPatient;
  }

  get patientLookupLoading(): boolean {
    return this.logic.patientLookupLoading;
  }

  get patientLookupError(): string {
    return this.logic.patientLookupError;
  }

  get patientLookupMessage(): string {
    return this.logic.patientLookupMessage;
  }

  get showExistingPatientSuggestion(): boolean {
    return this.logic.showExistingPatientSuggestion;
  }

  // ============================================================
  // LOCATION PARSING STATE
  // ============================================================

  get isParsingLocation(): boolean {
    return this.logic.isParsingLocation;
  }

  get locationParseError(): string {
    return this.logic.locationParseError;
  }

  get locationParseMessage(): string {
    return this.logic.locationParseMessage;
  }

  get locationLatitude(): number | null {
    return this.logic.locationLatitude;
  }

  get locationLongitude(): number | null {
    return this.logic.locationLongitude;
  }

  get locationSource(): 'link' | 'geocoded' | null {
    return this.logic.locationSource;
  }

  // ============================================================
  // DROPDOWN STATE
  // ============================================================

  get openDropdown(): OpenDropdown {
    return this.logic.openDropdown;
  }

  get areaSearchTerms(): Record<number, string> {
    return this.logic.areaSearchTerms;
  }

  get practitionerSearchTerms(): Record<number, string> {
    return this.logic.practitionerSearchTerms;
  }

  // ============================================================
  // PRACTITIONER SCHEDULE STATE
  // ============================================================

  get practitionerVisits(): Record<number, Visit[]> {
    return this.logic.practitionerVisits;
  }

  get isLoadingSchedule(): Record<number, boolean> {
    return this.logic.isLoadingSchedule;
  }

  get scheduleErrors(): Record<number, string> {
    return this.logic.scheduleErrors;
  }

  // ============================================================
  // PACKAGE STATE
  // ============================================================

  get selectedPackage(): Package | null {
    return this.logic.selectedPackage;
  }

  // ============================================================
  // LOADING / SUBMISSION STATE
  // ============================================================

  get isLoading(): boolean {
    return this.logic.isLoading;
  }

  get isLoadingPackages(): boolean {
    return this.logic.isLoadingPackages;
  }

  get isLoadingPractitioners(): boolean {
    return this.logic.isLoadingPractitioners;
  }

  get isLoadingAreas(): boolean {
    return this.logic.isLoadingAreas;
  }

  get isLoadingExistingPatientData(): boolean {
    return this.logic.isLoadingExistingPatientData;
  }

  get isSubmitting(): boolean {
    return this.logic.isSubmitting;
  }

  // ============================================================
  // MESSAGES
  // ============================================================

  get errorMessage(): string {
    return this.logic.errorMessage;
  }

  get successMessage(): string {
    return this.logic.successMessage;
  }

  // ============================================================
  // SCHEDULE CONFIGURATION
  // ============================================================

  get scheduleStartHour(): number {
    return this.logic.scheduleStartHour;
  }

  get scheduleEndHour(): number {
    return this.logic.scheduleEndHour;
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  ngOnInit(): void {
    this.logic.loadInitialData();
  }

  // ============================================================
  // DOCUMENT CLICK
  // ============================================================

  @HostListener('document:click')
  onDocumentClick(): void {
    this.logic.closeDropdown();
  }

  // ============================================================
  // PATIENT PHONE
  // ============================================================

  onPatientPhoneChange(phone: string): void {
    this.logic.onPatientPhoneChange(phone);
  }

  onPatientPhoneBlur(): void {
    this.logic.onPatientPhoneBlur();
  }

  selectExistingPatient(patient: Patient): void {
    this.logic.selectExistingPatient(patient);
  }

  // ============================================================
  // LOCATION
  // ============================================================

  parseLocation(): void {
    this.logic.parseLocation();
  }

  // ============================================================
  // PACKAGE
  // ============================================================

  onPackageChange(): void {
    this.logic.onPackageChange();
  }

  // ============================================================
  // PAYMENT
  // ============================================================

  onPaymentTypeChange(): void {
    this.logic.onPaymentTypeChange();
  }

  getPendingAmount(): number {
    return this.logic.getPendingAmount();
  }

  // ============================================================
  // AREA DROPDOWN
  // ============================================================

  isAreaDropdownOpen(index: number): boolean {
    return this.logic.isAreaDropdownOpen(index);
  }

  getSelectedAreaName(index: number): string {
    return this.logic.getSelectedAreaName(index);
  }

  openAreaDropdown(index: number): void {
    this.logic.openAreaDropdown(index);
  }

  onAreaSearch(index: number, value: string): void {
    this.logic.onAreaSearch(index, value);
  }

  getFilteredAreas(index: number): Area[] {
    return this.logic.getFilteredAreas(index);
  }

  selectArea(index: number, area: Area): void {
    this.logic.selectArea(index, area);
  }

  // ============================================================
  // PRACTITIONER DROPDOWN
  // ============================================================

  isPractitionerDropdownOpen(index: number): boolean {
    return this.logic.isPractitionerDropdownOpen(index);
  }

  getSelectedPractitionerName(index: number): string {
    return this.logic.getSelectedPractitionerName(index);
  }

  openPractitionerDropdown(index: number): void {
    this.logic.openPractitionerDropdown(index);
  }

  onPractitionerSearch(index: number, value: string): void {
    this.logic.onPractitionerSearch(index, value);
  }

  getPractitionersForAssignment(index: number): Practitioner[] {
    return this.logic.getPractitionersForAssignment(index);
  }

  selectPractitioner(index: number, practitioner: Practitioner): void {
    this.logic.selectPractitioner(index, practitioner);
  }

  // ============================================================
  // PRACTITIONER SCHEDULE
  // ============================================================

  shouldShowPractitionerSchedule(index: number): boolean {
    return this.logic.shouldShowPractitionerSchedule(index);
  }

  getBookedVisitCount(index: number): number {
    return this.logic.getBookedVisitCount(index);
  }

  getPractitionerSchedule(index: number): PractitionerScheduleItem[] {
    return this.logic.getPractitionerSchedule(index);
  }

  // ============================================================
  // DATE / TIME
  // ============================================================

  formatDate(assignmentDate: string | null | undefined): string {
    return this.logic.formatDate(assignmentDate);
  }

  formatTime(time: string | null | undefined): string {
    return this.logic.formatTime(time);
  }

  onAssignmentDateChange(index: number): void {
    this.logic.onAssignmentDateChange(index);
  }

  onTimeChange(index: number): void {
    this.logic.onTimeChange(index);
  }

  getTimeRangeError(index: number): string {
    return this.logic.getTimeRangeError(index);
  }

  hasPartialSchedule(assignment: VisitAssignmentForm): boolean {
    return this.logic.hasPartialSchedule(assignment);
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  submitVisit(): void {
    this.logic.submitVisit();
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  cancel(): void {
    this.logic.cancel();
  }
}
