import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { Table } from '../../../shared/components/table/table';

import { Visit } from './visits-list.interface';
import { VisitsListService } from './visits-list.service';

import { VisitStatus } from '../../../shared/enums/visit-status';

@Component({
  selector: 'app-visits-list',

  standalone: true,

  imports: [CommonModule, Table],

  templateUrl: './visit-list.html',

  styleUrl: './visits-list.css',
})
export class VisitsList implements OnInit {
  // =========================
  // DEPENDENCIES
  // =========================

  private visitsListService = inject(VisitsListService);

  private platformId = inject(PLATFORM_ID);

  private router = inject(Router);

  private changeDetectorRef = inject(ChangeDetectorRef);

  // =========================
  // DATE
  // =========================

  selectedDate = '';

  // =========================
  // UI STATE
  // =========================

  isLoading = false;

  errorMessage = '';

  // =========================
  // TABLE COLUMNS
  // =========================

  columns = [
    'patientName',
    'practitionerName',
    'areaName',
    'serviceName',
    'packageName',
    'scheduledDate',
    'timeSlot',
    'status',
    'amountDue',
  ];

  // =========================
  // VISITS
  // =========================

  visits: Visit[] = [];

  // =========================
  // INITIALIZATION
  // =========================

  ngOnInit(): void {
    this.selectedDate = this.getTodayDate();

    if (isPlatformBrowser(this.platformId)) {
      this.loadVisits();
    }
  }

  // =========================
  // DATE CHANGE
  // =========================

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.selectedDate = input.value;

    this.loadVisits();
  }

  // =========================
  // LOAD VISITS
  // =========================

  loadVisits(): void {
    this.isLoading = true;

    this.errorMessage = '';

    this.visits = [];

    this.visitsListService.getVisitsByDate(this.selectedDate).subscribe({
      next: (response) => {
        this.visits = response;

        this.isLoading = false;

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error('Error loading visits:', error);

        this.visits = [];

        this.isLoading = false;

        this.errorMessage = 'Unable to load visits. Please try again.';

        this.changeDetectorRef.detectChanges();
      },
    });
  }

  // =========================
  // ADD VISIT
  // =========================

  addVisit(): void {
    this.router.navigate(['/visits/add']);
  }

  // =========================
  // VISIT DETAILS
  // =========================

  onVisitClicked(visit: Visit): void {
    this.router.navigate(['/visits', visit.id]);
  }

  // =========================
  // SUMMARY STATISTICS
  // =========================

  getCompletedVisitsCount(): number {
    return this.visits.filter((visit) => visit.status === VisitStatus.Completed).length;
  }

  getCancelledVisitsCount(): number {
    return this.visits.filter((visit) => visit.status === VisitStatus.Cancelled).length;
  }

  getTotalRevenue(): number {
    return this.visits.reduce((total, visit) => total + (visit.amountReceived ?? 0), 0);
  }

  // =========================
  // DEFAULT DATE
  // =========================

  private getTodayDate(): string {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, '0');

    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
