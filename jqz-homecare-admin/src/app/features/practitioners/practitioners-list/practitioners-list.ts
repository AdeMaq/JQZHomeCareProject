import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Practitioner, PractitionerService } from '../../../core/services/practitioner';

@Component({
  selector: 'app-practitioners-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './practitioners-list.html',
  styleUrl: './practitioners-list.css',
})
export class PractitionersList implements OnInit {
  private readonly practitionerService = inject(PractitionerService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  // =========================
  // COMPONENT STATE
  // =========================

  practitioners: Practitioner[] = [];

  isLoading = true;

  errorMessage = '';

  searchTerm = '';

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.loadPractitioners();
  }

  // =========================
  // LOAD PRACTITIONERS
  // =========================

  loadPractitioners(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.practitionerService.getPractitioners().subscribe({
      // =========================
      // SUCCESS
      // =========================

      next: (response) => {
        this.practitioners = Array.isArray(response) ? response : [];

        this.isLoading = false;

        this.cdr.detectChanges();
      },

      // =========================
      // ERROR
      // =========================

      error: (error) => {
        console.error('Unable to load practitioners:', error);

        this.practitioners = [];

        this.errorMessage =
          error?.error?.message ??
          error?.message ??
          'Unable to load practitioners. Please try again.';

        this.isLoading = false;

        this.cdr.detectChanges();
      },
    });
  }

  // =========================
  // SEARCH
  // =========================

  get filteredPractitioners(): Practitioner[] {
    const search = this.searchTerm.trim().toLowerCase();

    if (!search) {
      return this.practitioners;
    }

    return this.practitioners.filter((practitioner) => {
      return (
        practitioner.name.toLowerCase().includes(search) ||
        practitioner.email.toLowerCase().includes(search) ||
        practitioner.phone.toLowerCase().includes(search) ||
        practitioner.serviceName.toLowerCase().includes(search)
      );
    });
  }

  // =========================
  // ADD PRACTITIONER
  // =========================

  addPractitioner(): void {
    this.router.navigate(['/practitioners/add']);
  }

  // =========================
  // VIEW PROFILE
  // =========================

  viewProfile(id: string): void {
    this.router.navigate(['/practitioners', id]);
  }

  // =========================
  // RETRY
  // =========================

  retry(): void {
    this.loadPractitioners();
  }
}
