import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardFilter } from './dashboard-filter';

describe('DashboardFilter', () => {
  let component: DashboardFilter;
  let fixture: ComponentFixture<DashboardFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
