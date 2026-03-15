import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerSearch } from './player-search';

describe('PlayerSearch', () => {
  let component: PlayerSearch;
  let fixture: ComponentFixture<PlayerSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerSearch],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayerSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
