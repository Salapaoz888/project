/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

export interface EspnLogo {
  href: string;
  alt?: string;
}
export interface EspnVenue {
  fullName?: string;
  name?: string;
}

// 🌟 Interface สำหรับผลการค้นหานักเตะ
export interface PlayerSearchItem {
  id: string;
  name: string;
  image: string;
  team: string;
  position: string;
}

export interface EspnTeam {
  id: string;
  name: string;
  abbreviation: string;
  logos?: EspnLogo[];
  venue?: EspnVenue;
  franchise?: { venue?: EspnVenue };
  nickname?: string;
  color?: string;
  logo?: string;
}
export interface EspnTeamData {
  team: EspnTeam;
}

export interface EspnCompetitor {
  team: EspnTeam;
  score?: string;
  winner?: boolean;
}
export interface EspnStatusType {
  detail: string;
  state: string;
}
export interface EspnStatus {
  type: EspnStatusType;
}
export interface EspnCompetition {
  id: string;
  venue?: EspnVenue;
  competitors: EspnCompetitor[];
  status?: EspnStatus;
}
export interface EspnEvent {
  id: string;
  date: string;
  name?: string;
  shortName?: string;
  competitions?: EspnCompetition[];
  status?: EspnStatus;
}

export interface EspnStandingsStat {
  name: string;
  abbreviation: string;
  value: number | string;
}
export interface EspnStandingsEntry {
  team: EspnTeam;
  stats: EspnStandingsStat[];
}
export interface EspnStandingsResponse {
  children: { standings: { entries: EspnStandingsEntry[] } }[];
}

export interface EspnLeague {
  id?: string;
  name?: string;
  abbreviation?: string;
  teams?: EspnTeamData[];
  leaders?: unknown[]; // 🌟 ใช้ unknown แทน any สำหรับข้อมูลที่ไม่แน่นอน
}

export interface EspnResponse {
  sports: { leagues: EspnLeague[] }[];
  events?: EspnEvent[];
}
export interface GlobalTeam extends EspnTeam {
  leagueName: string;
  leagueId: string;
}
export interface EspnScoreboardResponse {
  events: EspnEvent[];
  leagues?: EspnLeague[];
}
export interface EspnTeamDetailResponse {
  team: EspnTeam;
}

export interface EspnAthlete {
  id: string;
  uid?: string;
  fullName: string;
  displayName?: string;
  shortName?: string;

  // รูปและสังกัด
  headshot?: { href: string; alt?: string };
  jersey?: string;
  position?: { name: string; displayName?: string; abbreviation?: string };
  team?: { name: string; displayName?: string };

  // Bio เชิงลึก
  age?: number;
  dateOfBirth?: string; // 🌟 เก็บวันเกิด
  displayHeight?: string;
  displayWeight?: string;
  birthPlace?: { city?: string; state?: string; country?: any };
  citizenship?: string;
  nationality?: string;

  // สถานะและประสบการณ์
  experience?: { years?: number }; // 🌟 ประสบการณ์กี่ปี
  status?: { type?: { state?: string } }; // 🌟 สถานะ active หรือ inactive
}
export interface EspnNewsArticle {
  headline: string;
  description?: string;
  links?: { web: { href: string } };
  images?: { url: string; alt?: string }[];
  published: string;
}
export interface EspnNewsResponse {
  articles: EspnNewsArticle[];
}

export interface EspnRosterResponse {
  timestamp?: string;
  status?: string;
  athletes?: EspnAthlete[];
}
export interface EspnScheduleResponse {
  timestamp?: string;
  status?: string;
  events?: EspnEvent[];
}

export interface EspnMatchSummaryResponse {
  header?: EspnEvent;
  boxscore?: { teams: { statistics: { name: string; label: string; displayValue: string }[] }[] };
  keyEvents?: {
    team?: EspnTeam;
    type?: { text: string };
    clock?: { displayValue: string };
    participants?: { athlete?: EspnAthlete }[];
  }[];
  headToHead?: {
    id: string;
    matchup?: { matchDate: string };
    homeTeamScore?: string;
    awayTeamScore?: string;
    homeTeam?: EspnTeam;
    awayTeam?: EspnTeam;
    competitors?: EspnCompetitor[];
  }[];
  rosters?: EspnMatchRoster[];
  [key: string]: unknown;
}
export interface EspnLeagueStatsResponse {
  sports?: { leagues?: EspnLeague[] }[];
  leaders?: unknown[];
  categories?: unknown[];
}

export interface EspnMatchRosterPlayer {
  athlete: EspnAthlete;
  starter: boolean;
  substitute: boolean;
  position?: { name?: string; abbreviation?: string };
  jersey?: string;
  formationPosition?: number;
}

export interface EspnMatchRoster {
  team: EspnTeam;
  formation?: string;
  roster: EspnMatchRosterPlayer[];
}
// ==========================================
// 🌟 2. Service Class
// ==========================================
@Injectable({
  providedIn: 'root',
})
export class EspnService {
  private http = inject(HttpClient);

  selectedLeague = signal<string>('eng.1');

  setLeague(leagueId: string) {
    this.selectedLeague.set(leagueId);
  }

  getMatches(dateStr: string): Observable<EspnScoreboardResponse> {
    const league = this.selectedLeague();
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?dates=${dateStr}`;
    return this.http.get<EspnScoreboardResponse>(url);
  }

  getStandings(): Observable<EspnStandingsResponse> {
    const league = this.selectedLeague();
    const url = `https://site.web.api.espn.com/apis/v2/sports/soccer/${league}/standings?season=2025`;
    return this.http.get<EspnStandingsResponse>(url);
  }

  getTeams(): Observable<EspnResponse> {
    const league = this.selectedLeague();
    return this.http.get<EspnResponse>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams`,
    );
  }

  getAllTeamsGlobally(): Observable<GlobalTeam[]> {
    const leagues = [
      { id: 'eng.1', name: 'Premier League' },
      { id: 'esp.1', name: 'La Liga' },
      { id: 'ger.1', name: 'Bundesliga' },
      { id: 'ita.1', name: 'Serie A' },
      { id: 'fra.1', name: 'Ligue 1' },
    ];
    const requests = leagues.map((l) =>
      this.http
        .get<EspnResponse>(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.id}/teams`)
        .pipe(
          map((res) => {
            if (res?.sports?.[0]?.leagues?.[0]?.teams) {
              return res.sports[0].leagues[0].teams.map(
                (t: EspnTeamData) =>
                  ({
                    ...t.team,
                    leagueName: l.name,
                    leagueId: l.id,
                  }) as GlobalTeam,
              );
            }
            return [];
          }),
        ),
    );
    return forkJoin(requests).pipe(map((results) => results.flat()));
  }

  getTeamDetail(teamId: string): Observable<EspnTeamDetailResponse> {
    const league = this.selectedLeague();
    return this.http.get<EspnTeamDetailResponse>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${teamId}`,
    );
  }

  getTeamRoster(teamId: string): Observable<EspnRosterResponse> {
    const league = this.selectedLeague();
    return this.http.get<EspnRosterResponse>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${teamId}/roster`,
    );
  }

  getTeamSchedule(teamId: string): Observable<EspnScheduleResponse> {
    const league = this.selectedLeague();
    return this.http.get<EspnScheduleResponse>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${teamId}/schedule`,
    );
  }

  getMatchSummary(eventId: string): Observable<EspnMatchSummaryResponse> {
    const league = this.selectedLeague();
    return this.http.get<EspnMatchSummaryResponse>(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${eventId}`,
    );
  }

  getLeagueStats(): Observable<EspnLeagueStatsResponse> {
    const league = this.selectedLeague();
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/statistics`;
    return this.http.get<EspnLeagueStatsResponse>(url);
  }

  getLeagueLeaders(): Observable<EspnScoreboardResponse> {
    const league = this.selectedLeague();
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard`;
    return this.http.get<EspnScoreboardResponse>(url);
  }
  // 🌟 ฟังก์ชันค้นหานักเตะ
  searchPlayersBasic(query: string) {
    // ใช้ API V2 ดั้งเดิมที่เสถียรที่สุด
    const url = `https://site.api.espn.com/apis/search/v2?query=${query}&limit=20`;
    return this.http.get<any>(url);
  }
  // 🌟 ฟังก์ชันดึงข้อมูลโปรไฟล์นักเตะ (ใช้ V3 Global API ทะลวงได้ทุกลีก)
  getPlayerProfile(id: string) {
    const url = `https://site.web.api.espn.com/apis/common/v3/sports/soccer/athletes/${id}`;
    return this.http.get<any>(url);
  }
  getLeagueNews(): Observable<EspnNewsResponse> {
    const league = this.selectedLeague();
    // ดึงข่าวฟุตบอล (Soccer) ตามลีกที่เลือกไว้แบบไดนามิก!
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/news`;
    return this.http.get<EspnNewsResponse>(url);
  }
}
