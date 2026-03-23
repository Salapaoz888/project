import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingsTable } from './standings-table';

describe('StandingsTable', () => {
  let component: StandingsTable;
  let fixture: ComponentFixture<StandingsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StandingsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(StandingsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
