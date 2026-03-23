import { TestBed } from '@angular/core/testing';

import { espn } from './espn';

describe('espn', () => {
  let service: espn;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(espn);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
