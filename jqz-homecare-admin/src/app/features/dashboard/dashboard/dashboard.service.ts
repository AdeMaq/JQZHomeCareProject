import { Injectable } from '@angular/core';

import { DashboardSummary, Refusal } from './dashboard.interface';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly summaryData: DashboardSummary = {
    expectedVisits: 24,
    actualVisitsDone: 18,
    paymentReceived: 125000,
  };

  private readonly refusalsData: Refusal[] = [
    {
      id: 1,
      visitId: 101,
      patientName: 'Ali Khan',
      practitionerName: 'Dr. Sarah Ahmed',
      refusedBy: 'Patient',
      reason: 'Patient was unavailable',
      date: '2026-07-25',
    },

    {
      id: 2,
      visitId: 102,
      patientName: 'Usman Tariq',
      practitionerName: 'Dr. Ahmed Raza',
      refusedBy: 'Patient',
      reason: 'Patient cancelled the visit',
      date: '2026-07-25',
    },

    {
      id: 3,
      visitId: 103,
      patientName: 'Hamza Ali',
      practitionerName: 'Dr. Sara Khan',
      refusedBy: 'Practitioner',
      reason: 'Practitioner was unavailable',
      date: '2026-07-25',
    },

    {
      id: 4,
      visitId: 104,
      patientName: 'Bilal Ahmed',
      practitionerName: 'Dr. Ayesha Malik',
      refusedBy: 'Practitioner',
      reason: 'Schedule conflict',
      date: '2026-07-25',
    },

    {
      id: 5,
      visitId: 105,
      patientName: 'Hassan Raza',
      practitionerName: 'Dr. Fatima Noor',
      refusedBy: 'Patient',
      reason: 'Patient requested cancellation',
      date: '2026-07-25',
    },

    {
      id: 6,
      visitId: 106,
      patientName: 'Omar Farooq',
      practitionerName: 'Dr. Zainab Ali',
      refusedBy: 'Practitioner',
      reason: 'Practitioner was sick',
      date: '2026-07-25',
    },

    {
      id: 7,
      visitId: 107,
      patientName: 'Ahmed Hassan',
      practitionerName: 'Dr. Maria Khan',
      refusedBy: 'Patient',
      reason: 'Patient was not available',
      date: '2026-07-25',
    },
  ];

  getSummary(): DashboardSummary {
    return this.summaryData;
  }

  getRefusals(): Refusal[] {
    return this.refusalsData;
  }
}
