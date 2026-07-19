import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
})
export class StatCard {
  @Input() title = '';

  @Input() value: any;

  @Input() icon = '';

  @Input() color = '#2563eb';

  @Input() trend = '';

  @Input() trendPositive = true;

  @Input() footer = 'Compared to last week';
}
