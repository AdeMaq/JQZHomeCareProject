import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArea } from './add-area';

describe('AddArea', () => {
  let component: AddArea;
  let fixture: ComponentFixture<AddArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArea],
    }).compileComponents();

    fixture = TestBed.createComponent(AddArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
