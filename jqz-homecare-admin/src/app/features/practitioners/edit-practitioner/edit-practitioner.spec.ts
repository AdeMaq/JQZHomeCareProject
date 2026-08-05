import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPractitioner } from './edit-practitioner';

describe('EditPractitioner', () => {
  let component: EditPractitioner;
  let fixture: ComponentFixture<EditPractitioner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPractitioner],
    }).compileComponents();

    fixture = TestBed.createComponent(EditPractitioner);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
