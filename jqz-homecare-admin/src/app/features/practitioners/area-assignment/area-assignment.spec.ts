import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaAssignment } from './area-assignment';

describe('AreaAssignment', () => {
  let component: AreaAssignment;
  let fixture: ComponentFixture<AreaAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaAssignment],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
