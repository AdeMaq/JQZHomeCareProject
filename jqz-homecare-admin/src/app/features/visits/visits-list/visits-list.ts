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
    this.visitsListService.getVisitsByDate(this.selectedDate).subscribe({
      next: (response) => {
        console.log('Visits received in frontend:', response);

        this.visits = response;

        console.log('Visits length:', this.visits.length);

        console.log('Visits assigned to component:', this.visits);

        this.changeDetectorRef.detectChanges();
      },

      error: (error) => {
        console.error('Error loading visits:', error);
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
    return this.visits.reduce((total, visit) => total + visit.amountReceived, 0);
  }

  // =========================
  // TODAY'S DATE
  // =========================

  private getTodayDate(): string {
    const today = new Date();

    return today.toISOString().split('T')[0];
  }
}
