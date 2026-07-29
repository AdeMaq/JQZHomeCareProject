import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditArea } from './edit-area';

describe('EditArea', () => {
  let component: EditArea;
  let fixture: ComponentFixture<EditArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditArea],
    }).compileComponents();

    fixture = TestBed.createComponent(EditArea);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
