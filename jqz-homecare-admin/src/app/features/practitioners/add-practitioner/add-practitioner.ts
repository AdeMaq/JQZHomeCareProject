import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import {
  Area,
  CreatePractitionerRequest,
  PractitionerService,
  Service,
} from '../../../core/services/practitioner';

@Component({
  selector: 'app-add-practitioner',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './add-practitioner.html',
  styleUrl: './add-practitioner.css',
})
export class AddPractitioner implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // FORM
  // =========================

  practitionerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],

    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],

    password: ['', [Validators.required, Validators.minLength(6)]],

    phone: ['', [Validators.required, Validators.maxLength(30)]],

    serviceId: ['', Validators.required],

    education: ['', [Validators.required, Validators.maxLength(200)]],

    priority: [0, [Validators.required, Validators.min(0)]],

    sharePercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  // =========================
  // DATA
  // =========================

  services: Service[] = [];

  areas: Area[] = [];

  /**
   * Contains only the IDs of areas selected
   * for the practitioner currently being created.
   *
   * This does NOT delete areas from the database.
   */
  selectedAreaIds: string[] = [];

  // =========================
  // AREA SEARCH
  // =========================

  areaSearchTerm = '';

  filteredAreas: Area[] = [];

  // =========================
  // AREA PAGINATION
  // =========================

  /**
   * Number of areas displayed on one page.
   */
  readonly areasPerPage = 10;

  /**
   * Current pagination page.
   */
  currentAreaPage = 1;

  // =========================
  // STATE
  // =========================

  isLoading = true;

  isSubmitting = false;

  errorMessage = '';

  successMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.loadFormData();
  }

  // =========================
  // LOAD SERVICES + AREAS
  // =========================

  loadFormData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      services: this.practitionerService.getServices(),
      areas: this.practitionerService.getAreas(),
    }).subscribe({
      next: ({ services, areas }) => {
        console.log('SERVICES LOADED:', services);
        console.log('AREAS LOADED:', areas);

        this.services = Array.isArray(services) ? services : [];

        this.areas = Array.isArray(areas) ? areas : [];

        // Show all areas initially.
        this.filteredAreas = [...this.areas];

        // Reset area selection when form data is loaded.
        this.selectedAreaIds = [];

        // Start from first page.
        this.currentAreaPage = 1;

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('FORM DATA LOADING COMPLETE');
        console.log('Services:', this.services.length);
        console.log('Areas:', this.areas.length);
        console.log('Selected areas:', this.selectedAreaIds.length);
        console.log('Total area pages:', this.totalAreaPages);
      },

      error: (error) => {
        console.error('Unable to load practitioner form data:', error);

        this.services = [];
        this.areas = [];
        this.filteredAreas = [];
        this.selectedAreaIds = [];

        this.currentAreaPage = 1;

        this.errorMessage =
          error?.error?.message ??
          error?.error?.title ??
          error?.message ??
          'Unable to load form data. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();

        console.log('FORM DATA LOADING FAILED');
        console.log('isLoading:', this.isLoading);
      },
    });
  }

  // =========================
  // AREA SEARCH
  // =========================

  filterAreas(): void {
    const searchTerm = this.areaSearchTerm.trim().toLowerCase();

    // If search is empty, show all areas.
    if (!searchTerm) {
      this.filteredAreas = [...this.areas];
    } else {
      this.filteredAreas = this.areas.filter((area) => {
        const areaName = area.name?.toLowerCase() ?? '';

        const cityName = area.cityName?.toLowerCase() ?? '';

        return areaName.includes(searchTerm) || cityName.includes(searchTerm);
      });
    }

    // Always return to page 1 after searching.
    this.currentAreaPage = 1;

    this.cdr.detectChanges();
  }

  // =========================
  // CLEAR AREA SEARCH
  // =========================

  clearAreaSearch(): void {
    this.areaSearchTerm = '';

    this.filteredAreas = [...this.areas];

    // Return to first page.
    this.currentAreaPage = 1;

    this.cdr.detectChanges();
  }

  // =========================
  // AREA SELECTION
  // =========================

  toggleArea(areaId: string): void {
    if (this.selectedAreaIds.includes(areaId)) {
      // Remove area from selection.
      this.selectedAreaIds = this.selectedAreaIds.filter((id) => id !== areaId);
    } else {
      // Add area to selection.
      this.selectedAreaIds = [...this.selectedAreaIds, areaId];
    }

    console.log('Selected area IDs:', this.selectedAreaIds);

    this.cdr.detectChanges();
  }

  // =========================
  // CHECK AREA SELECTION
  // =========================

  isAreaSelected(areaId: string): boolean {
    return this.selectedAreaIds.includes(areaId);
  }

  // =========================
  // SELECT ALL FILTERED AREAS
  // =========================

  selectAllAreas(): void {
    const filteredAreaIds = this.filteredAreas.map((area) => area.id);

    /**
     * Merge existing selections with filtered areas.
     *
     * Set prevents duplicate IDs.
     *
     * Important:
     * This selects all currently filtered areas,
     * not only the 10 areas visible on the current page.
     */
    this.selectedAreaIds = [...new Set([...this.selectedAreaIds, ...filteredAreaIds])];

    console.log('Selected all filtered areas:', this.selectedAreaIds);

    this.cdr.detectChanges();
  }

  // =========================
  // CLEAR ALL SELECTED AREAS
  // =========================

  clearAllAreas(): void {
    /**
     * IMPORTANT:
     *
     * This does NOT delete areas.
     *
     * It only clears the area IDs selected
     * for the practitioner currently being created.
     */
    this.selectedAreaIds = [];

    console.log('All selected areas cleared.');

    this.cdr.detectChanges();
  }

  // =========================
  // CHECK IF ALL FILTERED AREAS
  // ARE SELECTED
  // =========================

  areAllFilteredAreasSelected(): boolean {
    if (this.filteredAreas.length === 0) {
      return false;
    }

    return this.filteredAreas.every((area) => this.selectedAreaIds.includes(area.id));
  }

  // =========================
  // AREA COUNTS
  // =========================

  get selectedAreaCount(): number {
    return this.selectedAreaIds.length;
  }

  get filteredAreaCount(): number {
    return this.filteredAreas.length;
  }

  // =========================
  // AREA PAGINATION
  // =========================

  /**
   * Total number of pages based on
   * the number of filtered areas.
   *
   * Example:
   *
   * 14 areas / 10 = 2 pages
   * 50 areas / 10 = 5 pages
   * 51 areas / 10 = 6 pages
   */
  get totalAreaPages(): number {
    return Math.ceil(this.filteredAreas.length / this.areasPerPage);
  }

  /**
   * Returns only the areas that belong
   * to the current page.
   */
  get paginatedAreas(): Area[] {
    const startIndex = (this.currentAreaPage - 1) * this.areasPerPage;

    const endIndex = startIndex + this.areasPerPage;

    return this.filteredAreas.slice(startIndex, endIndex);
  }

  /**
   * Generates dynamic page numbers.
   *
   * Example:
   *
   * 14 areas:
   * [1, 2]
   *
   * 50 areas:
   * [1, 2, 3, 4, 5]
   */
  get areaPageNumbers(): number[] {
    return Array.from({ length: this.totalAreaPages }, (_, index) => index + 1);
  }

  /**
   * First visible area number.
   *
   * Example:
   * Page 1 -> 1
   * Page 2 -> 11
   */
  get areaStartIndex(): number {
    if (this.filteredAreas.length === 0) {
      return 0;
    }

    return (this.currentAreaPage - 1) * this.areasPerPage + 1;
  }

  /**
   * Last visible area number.
   *
   * Example:
   *
   * 14 areas:
   * Page 1 -> 10
   * Page 2 -> 14
   */
  get areaEndIndex(): number {
    return Math.min(this.currentAreaPage * this.areasPerPage, this.filteredAreas.length);
  }

  /**
   * Go directly to a specific page.
   */
  goToAreaPage(page: number): void {
    if (page < 1 || page > this.totalAreaPages || page === this.currentAreaPage) {
      return;
    }

    this.currentAreaPage = page;

    this.cdr.detectChanges();
  }

  /**
   * Go to previous page.
   */
  goToPreviousAreaPage(): void {
    if (this.currentAreaPage <= 1) {
      return;
    }

    this.currentAreaPage--;

    this.cdr.detectChanges();
  }

  /**
   * Go to next page.
   */
  goToNextAreaPage(): void {
    if (this.currentAreaPage >= this.totalAreaPages) {
      return;
    }

    this.currentAreaPage++;

    this.cdr.detectChanges();
  }

  // =========================
  // FORM HELPERS
  // =========================

  isInvalid(controlName: string): boolean {
    const control = this.practitionerForm.get(controlName);

    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getErrorMessage(controlName: string): string {
    const control = this.practitionerForm.get(controlName);

    if (!control || !control.errors) {
      return '';
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['email']) {
      return 'Please enter a valid email address.';
    }

    if (control.errors['minlength']) {
      return `Minimum ${control.errors['minlength'].requiredLength} characters required.`;
    }

    if (control.errors['maxlength']) {
      return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed.`;
    }

    if (control.errors['min']) {
      return `Value must be at least ${control.errors['min'].min}.`;
    }

    if (control.errors['max']) {
      return `Value cannot be greater than ${control.errors['max'].max}.`;
    }

    return 'Invalid value.';
  }

  // =========================
  // SUBMIT
  // =========================

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Mark all form fields as touched.
    this.practitionerForm.markAllAsTouched();

    // Stop submission if form is invalid.
    if (this.practitionerForm.invalid) {
      return;
    }

    const formValue = this.practitionerForm.getRawValue();

    const request: CreatePractitionerRequest = {
      name: formValue.name.trim(),

      email: formValue.email.trim(),

      password: formValue.password,

      phone: formValue.phone.trim(),

      serviceId: formValue.serviceId,

      education: formValue.education.trim(),

      priority: Number(formValue.priority),

      sharePercentage: Number(formValue.sharePercentage),

      // Only selected area IDs are sent to backend.
      areaIds: [...this.selectedAreaIds],
    };

    console.log('CREATE PRACTITIONER REQUEST:', request);

    this.isSubmitting = true;

    this.practitionerService.createPractitioner(request).subscribe({
      next: () => {
        this.isSubmitting = false;

        this.router.navigate(['/practitioners']);
      },

      error: (error) => {
        console.error('Unable to create practitioner:', error);

        this.errorMessage =
          error?.error?.message ??
          error?.error?.title ??
          error?.message ??
          'Unable to create practitioner. Please try again.';

        this.isSubmitting = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // CANCEL
  // =========================

  cancel(): void {
    this.router.navigate(['/practitioners']);
  }
}
