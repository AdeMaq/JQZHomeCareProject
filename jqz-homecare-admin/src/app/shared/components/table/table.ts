import { Component, Input } from '@angular/core';
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

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'status-completed';

      case 'pending':
        return 'status-pending';

      case 'scheduled':
        return 'status-scheduled';

      case 'cancelled':
        return 'status-cancelled';

      default:
        return 'status-default';
    }
  }
}
