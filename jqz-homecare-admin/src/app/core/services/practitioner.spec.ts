import { TestBed } from '@angular/core/testing';

import { Practitioner } from './practitioner';

describe('Practitioner', () => {
  let service: Practitioner;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Practitioner);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
