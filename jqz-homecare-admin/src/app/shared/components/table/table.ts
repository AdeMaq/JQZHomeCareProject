import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VisitStatus } from '../../enums/visit-status';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table {
  @Input() columns: string[] = [];

  @Input() rows: any[] = [];

  @Output() rowClicked = new EventEmitter<any>();

  onRowClick(row: any): void {
    this.rowClicked.emit(row);
  }

  getColumnLabel(column: string): string {
    const labels: Record<string, string> = {
      patientName: 'Patient Name',
      practitionerName: 'Practitioner Name',
      areaName: 'Area Name',
      serviceName: 'Service Name',
      packageName: 'Package Name',
      scheduledDate: 'Scheduled Date',
      timeSlot: 'Time Slot',
      status: 'Status',
      amountDue: 'Amount Due',
    };

    return labels[column] ?? column;
  }

  formatDate(value: string): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  formatCurrency(value: number): string {
    if (value === null || value === undefined) {
      return 'Rs. 0';
    }

    return `Rs. ${value.toLocaleString('en-PK')}`;
  }

  getStatusLabel(status: VisitStatus | number): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'Scheduled';

      case VisitStatus.Accepted:
        return 'Accepted';

      case VisitStatus.Completed:
        return 'Completed';

      case VisitStatus.Cancelled:
        return 'Cancelled';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: VisitStatus | number): string {
    switch (status) {
      case VisitStatus.Scheduled:
        return 'status-scheduled';

      case VisitStatus.Accepted:
        return 'status-accepted';

      case VisitStatus.Completed:
        return 'status-completed';

      case VisitStatus.Cancelled:
        return 'status-cancelled';

      default:
        return 'status-default';
    }
  }
}
