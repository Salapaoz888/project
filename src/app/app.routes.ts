import { Routes } from '@angular/router';

import { HomeComponent } from './football/pages/home/home'; 
import { StandingsComponent } from './football/pages/standings/standings';
import { TeamsComponent } from './football/pages/teams/teams';
import { SearchComponent } from './football/pages/search/search';
import { AboutComponent } from './football/pages/about/about';
import { TeamDetailComponent } from './football/pages/team-detail/team-detail'; 
import { MatchDetailComponent } from './football/pages/match-detail/match-detail';
import { PlayerSearchComponent } from './football/pages/player-search/player-search';
import { PlayerProfileComponent } from './football/pages/player-profile/player-profile';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'standings', component: StandingsComponent },
  { path: 'teams', component: TeamsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'about', component: AboutComponent },
  { path: 'team/:id', component: TeamDetailComponent },
  { path: 'player', component:PlayerSearchComponent },
  { path: 'match/:id', component: MatchDetailComponent },
  { path: 'player/:id', component: PlayerProfileComponent },
 
  { path: 'team/:id', component: TeamDetailComponent }, 
  

  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }

];