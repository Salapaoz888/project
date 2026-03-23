import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeagueSelector } from './league-selector';

describe('LeagueSelector', () => {
  let component: LeagueSelector;
  let fixture: ComponentFixture<LeagueSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeagueSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(LeagueSelector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
