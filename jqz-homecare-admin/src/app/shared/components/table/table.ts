import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  // =========================
  // STATUS
  // =========================

  getStatusText(status: number): string {
    switch (status) {
      case 0:
        return 'Scheduled';

      case 1:
        return 'Completed';

      case 2:
        return 'Cancelled';

      case 3:
        return 'Pending';

      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0:
        return 'status-scheduled';

      case 1:
        return 'status-completed';

      case 2:
        return 'status-cancelled';

      case 3:
        return 'status-pending';

      default:
        return 'status-default';
    }
  }

  // =========================
  // DATE
  // =========================

  formatDate(date: string): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // =========================
  // CURRENCY
  // =========================

  formatAmount(amount: number): string {
    if (amount === null || amount === undefined) {
      return 'Rs. 0';
    }

    return `Rs. ${amount.toLocaleString('en-PK')}`;
  }

  // =========================
  // COLUMN HEADERS
  // =========================

  getColumnHeader(column: string): string {
    const headers: Record<string, string> = {
      patientName: 'Patient Name',
      practitionerName: 'Practitioner Name',
      areaName: 'Area',
      serviceName: 'Service',
      packageName: 'Package',
      scheduledDate: 'Scheduled Date',
      timeSlot: 'Time Slot',
      status: 'Status',
      amountDue: 'Amount Due',
    };

    return headers[column] ?? column;
  }
}
