import { TestBed } from '@angular/core/testing';

import { Espn } from './espn';

describe('Espn', () => {
  let service: Espn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Espn);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
