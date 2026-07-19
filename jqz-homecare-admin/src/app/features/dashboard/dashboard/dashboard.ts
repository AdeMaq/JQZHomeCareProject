import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { PageHeader } from '../../../shared/components/page-header/page-header';
import { StatCard } from '../../../shared/components/stat-card/stat-card';
import { Table } from '../../../shared/components/table/table';

import { DashboardStat, RecentVisit } from '../../../shared/interfaces/dashboard.interface';

@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [CommonModule, StatCard, Table],

  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  /* ========================= */
  /* KPI STATISTICS */
  /* ========================= */

  stats: DashboardStat[] = [
    {
      title: 'Total Visits',
      value: 245,
      icon: 'fa-calendar-check',
      color: '#2563eb',
      trend: '+8%',
      trendPositive: true,
    },

    {
      title: 'Expected Visits',
      value: 260,
      icon: 'fa-calendar-day',
      color: '#14b8a6',
      trend: '+12%',
      trendPositive: true,
    },

    {
      title: 'Completed Visits',
      value: 220,
      icon: 'fa-circle-check',
      color: '#22c55e',
      trend: '+5%',
      trendPositive: true,
    },

    {
      title: 'Revenue',
      value: 'Rs. 450K',
      icon: 'fa-sack-dollar',
      color: '#f59e0b',
      trend: '+18%',
      trendPositive: true,
    },
  ];

  /* ========================= */
  /* REFUSALS */
  /* ========================= */

  refusals: DashboardStat[] = [
    {
      title: 'Patient Refusals',
      value: 12,
      icon: 'fa-user-xmark',
      color: '#ef4444',
      trend: '-2%',
      trendPositive: false,
    },

    {
      title: 'Therapist Refusals',
      value: 5,
      icon: 'fa-user-slash',
      color: '#dc2626',
      trend: '-1%',
      trendPositive: false,
    },
  ];

  /* ========================= */
  /* RECENT VISITS TABLE */
  /* ========================= */

  columns = ['patient', 'therapist', 'date', 'status'];

  recentVisits: RecentVisit[] = [
    {
      patient: 'Ali Raza',
      therapist: 'Dr Ahmed',
      date: '17 Jul 2026',
      status: 'Completed',
    },

    {
      patient: 'Sara Khan',
      therapist: 'Dr Bilal',
      date: '17 Jul 2026',
      status: 'Pending',
    },

    {
      patient: 'Hassan Ali',
      therapist: 'Dr Ayesha',
      date: '18 Jul 2026',
      status: 'Scheduled',
    },
  ];
  selectedFilter = 'Today';

  filters = ['Today', 'This Week', 'This Month'];

  selectFilter(filter: string): void {
    this.selectedFilter = filter;

    console.log('Selected Filter:', filter);
  }

  addVisit(): void {
    console.log('Navigate to Add Visit page');

    // Later:
    // this.router.navigate(['/visits/add']);
  }
}
