import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MergePractitionerAreas } from './merge-practitioner-areas';

describe('MergePractitionerAreas', () => {
  let component: MergePractitionerAreas;
  let fixture: ComponentFixture<MergePractitionerAreas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MergePractitionerAreas],
    }).compileComponents();

    fixture = TestBed.createComponent(MergePractitionerAreas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
