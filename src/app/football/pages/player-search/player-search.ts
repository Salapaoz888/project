/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Subscription, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { EspnService, PlayerSearchItem } from '../../services/espn';
import { PlayerCardComponent } from '../../component/player-card/player-card';
import { LeagueSelectorComponent } from '../../component/league-selector/league-selector';

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [CommonModule, FormsModule,PlayerCardComponent,LeagueSelectorComponent],
  templateUrl: './player-search.html',
  styleUrls: ['./player-search.scss']
})
export class PlayerSearchComponent implements OnInit, OnDestroy {
  public espnService = inject(EspnService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  searchResults = signal<PlayerSearchItem[]>([]);
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  // 🌟 เพิ่มตัวแปรสำหรับนักเตะในลีก
  leaguePlayers = signal<PlayerSearchItem[]>([]);
  isLeagueLoading = signal<boolean>(false);
  availableLeagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'fra.1', name: 'Ligue 1' }
  ];

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  ngOnInit() {
    this.loadLeaguePlayers(); // 🌟 สั่งให้โหลดนักเตะในลีคทันทีที่เปิดหน้า

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((query) => {
        const trimmed = query.trim();
        if (!trimmed) {
          this.isLoading.set(false);
          this.hasSearched.set(false);
          this.searchResults.set([]);
          return of([]); 
        }
        
        this.isLoading.set(true);
        this.hasSearched.set(true);
        
        return this.espnService.searchPlayersBasic(trimmed).pipe(
          switchMap((res: any) => {
            const extractAthletes = (obj: any, found: any[] = []) => {
              if (!obj || typeof obj !== 'object') return found;
              if (obj.athlete && obj.athlete.uid && obj.athlete.displayName) {
                found.push(obj.athlete);
              } else if ((obj.type === 'athlete' || obj.type === 'player') && obj.uid && obj.displayName) {
                found.push(obj);
              } else {
                for (const key in obj) { extractAthletes(obj[key], found); }
              }
              return found;
            };

            const rawAthletes = extractAthletes(res);
            const uniqueAthletes = rawAthletes.reduce((acc: any[], current: any) => {
              let realId = current.id;
              if (current.uid && current.uid.includes('~a:')) realId = current.uid.split('~a:')[1];
              if (!acc.find(item => item.realId === realId) && realId) acc.push({ ...current, realId });
              return acc;
            }, []);

            const topAthletes = uniqueAthletes.slice(0, 12);
            if (topAthletes.length === 0) return of([]);

            const detailedRequests = topAthletes.map((athlete: any) => {
              return this.espnService.getPlayerProfile(athlete.realId).pipe(
                map((profileRes: any) => {
                  const profile = profileRes.athlete || profileRes;
                  let teamName = 'ไม่มีสังกัดสโมสร';
                  if (profile.team?.displayName) teamName = profile.team.displayName;
                  else if (profile.team?.name) teamName = profile.team.name;
                  let pos = '-';
                  if (profile.position?.displayName) pos = profile.position.displayName;
                  else if (profile.position?.name) pos = profile.position.name;
                  const imageUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${athlete.realId}.png&w=150&h=150`;

                  return {
                    id: athlete.realId,
                    name: profile.displayName || athlete.displayName || 'ไม่ทราบชื่อ',
                    image: imageUrl,
                    team: teamName,
                    position: pos
                  };
                }),
                catchError(() => of({
                  id: athlete.realId,
                  name: athlete.displayName || 'ไม่ทราบชื่อ',
                  image: `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${athlete.realId}.png&w=150&h=150`,
                  team: 'ไม่ระบุทีม',
                  position: '-'
                }))
              );
            });

            return forkJoin(detailedRequests);
          }),
          catchError((err) => {
            console.error('API Error:', err);
            return of([]);
          })
        );
      })
    ).subscribe((finalPlayers: PlayerSearchItem[]) => {
      this.searchResults.set(finalPlayers);
      this.isLoading.set(false);
    });
  }

  ngOnDestroy() {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }

  // 🌟 ฟังก์ชันโหลดรายชื่อนักเตะในลีก
  loadLeaguePlayers() {
    this.isLeagueLoading.set(true);
    this.espnService.getTeams().pipe(
      switchMap((data) => {
        const teams = data?.sports?.[0]?.leagues?.[0]?.teams?.map(t => t.team) || [];
        
        const rosterRequests = teams.map(team => 
          this.espnService.getTeamRoster(team.id).pipe(
            map(res => {
              const athletes = res.athletes || [];
              // ดึงมาแค่ 4 คนแรกของแต่ละทีม จะได้ประมาณ 80 คน กำลังสวยครับ
              return athletes.slice(0, 4).map(a => ({
                id: a.id,
                name: a.fullName || a.displayName || 'ไม่ทราบชื่อ',
                image: a.headshot?.href || `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${a.id}.png&w=150&h=150`,
                team: team.name,
                position: a.position?.displayName || a.position?.name || '-'
              }));
            }),
            catchError(() => of([]))
          )
        );

        if (rosterRequests.length === 0) return of([]);
        return forkJoin(rosterRequests);
      })
    ).subscribe({
      next: (rosters) => {
        let allPlayers = rosters.flat();
        // สุ่มลำดับนักเตะให้น่าสนใจ
        allPlayers = allPlayers.sort(() => 0.5 - Math.random());
        this.leaguePlayers.set(allPlayers);
        this.isLeagueLoading.set(false);
      },
      error: (err) => {
        console.error('League Players Error:', err);
        this.isLeagueLoading.set(false);
      }
    });
  }

  // 🌟 ฟังก์ชันเปลี่ยนลีก
  changeLeague(leagueId: string) {
    this.espnService.setLeague(leagueId);
    this.loadLeaguePlayers();
  }

  onSearchInput(query: string) {
    this.searchQuery.set(query);
    this.searchSubject.next(query);
  }

  viewPlayer(id: string) {
    this.router.navigate(['/player', id]);
  }

  onImageError(event: any) {
    event.target.src = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png';
  }
}