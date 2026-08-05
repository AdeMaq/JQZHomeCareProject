import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-practitioner-profile',
  imports: [],
  templateUrl: './practitioner-profile.html',
  styleUrl: './practitioner-profile.css',
})
export class PractitionerProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly practitionerService = inject(PractitionerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  practitioner: Practitioner | null = null;

  isLoading = true;
  hasError = false;

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    const practitionerId = this.route.snapshot.paramMap.get('id');

    console.log('Practitioner profile ID:', practitionerId);

    if (!practitionerId) {
      this.isLoading = false;
      this.hasError = true;

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.loadPractitioner(practitionerId);
  }

  // =========================
  // LOAD PRACTITIONER
  // =========================

  private loadPractitioner(id: string): void {
    this.isLoading = true;
    this.hasError = false;
    this.practitioner = null;

    console.log('Loading practitioner:', id);

    this.practitionerService.getPractitionerById(id).subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: (practitioner) => {
        console.log('Practitioner loaded successfully:', practitioner);

        this.practitioner = {
          ...practitioner,

          areas: Array.isArray(practitioner.areas) ? practitioner.areas : [],
        };

        this.isLoading = false;
        this.hasError = false;

        console.log('isLoading:', this.isLoading);
        console.log('practitioner:', this.practitioner);

        this.changeDetectorRef.detectChanges();
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('Failed to load practitioner profile:', error);

        this.practitioner = null;
        this.isLoading = false;
        this.hasError = true;

        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // =========================
  // GO BACK
  // =========================

  goBack(): void {
    this.router.navigate(['/practitioners']);
  }

  // =========================
  // EDIT PRACTITIONER
  // =========================

  editPractitioner(): void {
    if (!this.practitioner?.id) {
      return;
    }

    this.router.navigate(['/practitioners', this.practitioner.id, 'edit']);
  }

  // =========================
  // MANAGE PRACTITIONER AREAS
  // =========================

  manageAreas(): void {
    if (!this.practitioner?.id) {
      return;
    }

    this.router.navigate(['/practitioners', this.practitioner.id, 'areas']);
  }

  // =========================
  // RETRY
  // =========================

  retry(): void {
    const practitionerId = this.route.snapshot.paramMap.get('id');

    if (!practitionerId) {
      this.isLoading = false;
      this.hasError = true;

      this.changeDetectorRef.detectChanges();

      return;
    }

    this.loadPractitioner(practitionerId);
  }
}
