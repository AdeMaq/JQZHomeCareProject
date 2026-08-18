import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVisit } from './edit-visit';

describe('EditVisit', () => {
  let component: EditVisit;
  let fixture: ComponentFixture<EditVisit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditVisit],
    }).compileComponents();

    fixture = TestBed.createComponent(EditVisit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
