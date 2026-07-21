import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';

import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { Table } from '../../../shared/components/table/table';

import { DashboardStat, DashboardSummary, Refusal } from './dashboard.interface';

import { DashboardService } from './dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [CommonModule, StatCard, Table],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private dashboardService = inject(DashboardService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  /* ========================= */
  /* DATE FILTER */
  /* ========================= */

  selectedFilter = 'Today';

  filters = ['Today', 'This Week', 'This Month'];

  fromDate!: string;
  toDate!: string;

  /* ========================= */
  /* DASHBOARD DATA */
  /* ========================= */

  summary: DashboardSummary = {
    expectedVisits: 0,
    actualVisitsDone: 0,
    paymentReceived: 0,
  };

  refusals: Refusal[] = [];

  /* ========================= */
  /* KPI STATISTICS */
  /* ========================= */

  stats: DashboardStat[] = [];

  /* ========================= */
  /* REFUSAL STATISTICS */
  /* ========================= */

  refusalStats: DashboardStat[] = [];

  /* ========================= */
  /* RECENT VISITS */
  /* ========================= */

  columns = ['patient', 'therapist', 'date', 'status'];

  recentVisits: any[] = [];

  /* ========================= */
  /* INITIALIZATION */
  /* ========================= */

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.selectFilter('Today');
    }
  }

  /* ========================= */
  /* FILTER SELECTION */
  /* ========================= */

  selectFilter(filter: string): void {
    this.selectedFilter = filter;

    const today = new Date();

    let from = new Date(today);
    const to = new Date(today);

    if (filter === 'This Week') {
      from = new Date(today);

      from.setDate(today.getDate() - today.getDay());
    }

    if (filter === 'This Month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    this.fromDate = this.formatDate(from);
    this.toDate = this.formatDate(to);

    this.loadDashboardData();
  }

  /* ========================= */
  /* LOAD DASHBOARD DATA */
  /* ========================= */

  loadDashboardData(): void {
    /* ========================= */
    /* LOAD SUMMARY */
    /* ========================= */

    this.dashboardService.getSummary(this.fromDate, this.toDate).subscribe({
      next: (response: DashboardSummary) => {
        console.log('SUMMARY API RESPONSE:', response);

        this.summary = response;

        this.buildStats();

        console.log('STATS AFTER BUILD:', this.stats);
      },

      error: (error) => {
        console.error('ERROR LOADING SUMMARY:', error);
      },
    });

    /* ========================= */
    /* LOAD REFUSALS */
    /* ========================= */

    this.dashboardService.getRefusals(this.fromDate, this.toDate).subscribe({
      next: (response: Refusal[]) => {
        console.log('REFUSALS API RESPONSE:', response);

        this.refusals = response;

        this.buildRefusalStats();

        console.log('REFUSAL STATS AFTER BUILD:', this.refusalStats);
      },

      error: (error) => {
        console.error('ERROR LOADING REFUSALS:', error);
      },
    });
  }

  /* ========================= */
  /* BUILD KPI CARDS */
  /* ========================= */

  buildStats(): void {
    this.stats = [
      {
        title: 'Expected Visits',

        value: this.summary.expectedVisits,

        icon: 'fa-calendar-day',

        color: '#14b8a6',
      },

      {
        title: 'Completed Visits',

        value: this.summary.actualVisitsDone,

        icon: 'fa-circle-check',

        color: '#22c55e',
      },

      {
        title: 'Revenue',

        value: `Rs. ${this.summary.paymentReceived.toLocaleString()}`,

        icon: 'fa-sack-dollar',

        color: '#f59e0b',
      },
    ];
  }

  /* ========================= */
  /* BUILD REFUSAL CARDS */
  /* ========================= */

  buildRefusalStats(): void {
    const patientRefusals = this.refusals.filter(
      (refusal) => refusal.refusedBy === 'Patient',
    ).length;

    const practitionerRefusals = this.refusals.filter(
      (refusal) => refusal.refusedBy === 'Practitioner',
    ).length;

    this.refusalStats = [
      {
        title: 'Patient Refusals',

        value: patientRefusals,

        icon: 'fa-user-xmark',

        color: '#ef4444',
      },

      {
        title: 'Practitioner Refusals',

        value: practitionerRefusals,

        icon: 'fa-user-slash',

        color: '#dc2626',
      },
    ];
  }

  /* ========================= */
  /* DATE FORMAT */
  /* ========================= */

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /* ========================= */
  /* ADD VISIT */
  /* ========================= */

  addVisit(): void {
    this.router.navigate(['/visits/add']);
  }
}
