import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Area, PractitionerArea, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-manage-practitioner-areas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './merge-practitioner-areas.html',
  styleUrl: './merge-practitioner-areas.css',
})
export class MergePractitionerAreas implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // COMPONENT STATE
  // =========================

  practitionerId = '';

  practitionerName = '';

  allAreas: Area[] = [];

  assignedAreas: PractitionerArea[] = [];

  searchTerm = '';

  isLoading = true;

  isSaving = false;

  errorMessage = '';

  successMessage = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    const practitionerId = this.route.snapshot.paramMap.get('id');

    if (!practitionerId) {
      this.isLoading = false;
      this.errorMessage = 'Practitioner ID was not found.';
      return;
    }

    this.practitionerId = practitionerId;

    this.loadData();
  }

  // =========================
  // LOAD DATA
  // =========================

  private loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.practitionerService.getPractitionerById(this.practitionerId).subscribe({
      next: (practitioner) => {
        this.practitionerName = practitioner.name || 'Practitioner';

        this.loadAreas();
      },

      error: (error) => {
        console.error('Failed to load practitioner:', error);

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to load practitioner information. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // LOAD AREAS
  // =========================

  private loadAreas(): void {
    this.practitionerService.getAreas().subscribe({
      next: (areas) => {
        this.allAreas = Array.isArray(areas) ? areas : [];

        this.loadAssignedAreas();
      },

      error: (error) => {
        console.error('Failed to load areas:', error);

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to load available areas. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // LOAD ASSIGNED AREAS
  // =========================

  private loadAssignedAreas(): void {
    this.practitionerService.getPractitionerAreas(this.practitionerId).subscribe({
      next: (areas) => {
        this.assignedAreas = Array.isArray(areas) ? areas : [];

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load assigned areas:', error);

        this.isLoading = false;

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to load assigned areas. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // ASSIGNED AREA IDS
  // =========================

  get assignedAreaIds(): string[] {
    return this.assignedAreas.map((area) => area.id);
  }

  // =========================
  // CHECK AREA
  // =========================

  isAreaAssigned(areaId: string): boolean {
    return this.assignedAreaIds.includes(areaId);
  }

  // =========================
  // FILTER AVAILABLE AREAS
  // =========================

  get filteredAreas(): Area[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.allAreas;
    }

    return this.allAreas.filter((area) => {
      return (
        area.name.toLowerCase().includes(search) || area.cityName.toLowerCase().includes(search)
      );
    });
  }

  // =========================
  // ASSIGN AREA
  // =========================

  assignArea(area: Area): void {
    if (this.isSaving || this.isAreaAssigned(area.id)) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.practitionerService.assignArea(this.practitionerId, area.id).subscribe({
      next: () => {
        this.isSaving = false;

        this.successMessage = `${area.name} has been assigned successfully.`;

        this.loadAssignedAreas();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to assign area:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to assign this area. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // REMOVE AREA
  // =========================

  removeArea(area: PractitionerArea): void {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.practitionerService.removeArea(this.practitionerId, area.id).subscribe({
      next: () => {
        this.isSaving = false;

        this.successMessage = `${area.name} has been removed successfully.`;

        this.loadAssignedAreas();

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to remove area:', error);

        this.isSaving = false;

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to remove this area. Please try again.';

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // CLEAR SEARCH
  // =========================

  clearSearch(): void {
    this.searchTerm = '';
  }

  // =========================
  // BACK TO PROFILE
  // =========================

  backToProfile(): void {
    this.router.navigate(['/practitioners', this.practitionerId]);
  }

  // =========================
  // RETRY
  // =========================

  retry(): void {
    this.loadData();
  }
}
