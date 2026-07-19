import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-filter.html',
  styleUrl: './dashboard-filter.css',
})
export class DashboardFilter {
  @Output()
  filterChanged = new EventEmitter<string>();

  selectedFilter = 'Today';

  filters = ['Today', 'This Week', 'This Month'];

  selectFilter(filter: string) {
    this.selectedFilter = filter;

    this.filterChanged.emit(filter);
  }
}
