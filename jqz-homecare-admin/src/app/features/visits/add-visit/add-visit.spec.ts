import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVisit } from './add-visit';

describe('AddVisit', () => {
  let component: AddVisit;
  let fixture: ComponentFixture<AddVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddVisit],
    }).compileComponents();

    fixture = TestBed.createComponent(AddVisit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
