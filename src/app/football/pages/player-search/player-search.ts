/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// 🌟 เพิ่ม forkJoin และ map เข้ามา
import { Subject, Subscription, of, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { EspnService, PlayerSearchItem } from '../../services/espn';

@Component({
  selector: 'app-player-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './player-search.html',
  styleUrls: ['./player-search.scss']
})
export class PlayerSearchComponent implements OnInit, OnDestroy {
  private espnService = inject(EspnService);
  private router = inject(Router);

  searchQuery = signal<string>('');
  searchResults = signal<PlayerSearchItem[]>([]);
  isLoading = signal<boolean>(false);
  hasSearched = signal<boolean>(false);

  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;

  ngOnInit() {
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
        
        // 🌟 สเตป 1: ค้นหารายชื่อเพื่อเอา ID มาก่อน
        return this.espnService.searchPlayersBasic(trimmed).pipe(
          switchMap((res: any) => {
            const extractAthletes = (obj: any, found: any[] = []) => {
              if (!obj || typeof obj !== 'object') return found;
              if (obj.athlete && obj.athlete.uid && obj.athlete.displayName) {
                found.push(obj.athlete);
              } else if ((obj.type === 'athlete' || obj.type === 'player') && obj.uid && obj.displayName) {
                found.push(obj);
              } else {
                for (const key in obj) {
                  extractAthletes(obj[key], found);
                }
              }
              return found;
            };

            const rawAthletes = extractAthletes(res);
            
            // กรอง ID คนซ้ำออก
            const uniqueAthletes = rawAthletes.reduce((acc: any[], current: any) => {
              let realId = current.id;
              if (current.uid && current.uid.includes('~a:')) {
                realId = current.uid.split('~a:')[1];
              }
              const exists = acc.find(item => item.realId === realId);
              if (!exists && realId) {
                acc.push({ ...current, realId });
              }
              return acc;
            }, []);

            // ⚠️ สำคัญมาก: เราต้องจำกัดการดึงแค่ 12 คนแรก เพื่อไม่ให้เว็บค้างและโดน ESPN บล็อค
            const topAthletes = uniqueAthletes.slice(0, 12);

            if (topAthletes.length === 0) return of([]);

            // 🌟 สเตป 2: วนลูปเอา ID ทั้ง 12 คน ไปยิง API โปรไฟล์เพื่อดึงชื่อทีมและตำแหน่งมาประกอบร่าง!
            const detailedRequests = topAthletes.map((athlete: any) => {
              return this.espnService.getPlayerProfile(athlete.realId).pipe(
                map((profileRes: any) => {
                  const profile = profileRes.athlete || profileRes;
                  
                  // ดึงชื่อทีมจากหน้าโปรไฟล์
                  let teamName = 'ไม่มีสังกัดสโมสร';
                  if (profile.team?.displayName) teamName = profile.team.displayName;
                  else if (profile.team?.name) teamName = profile.team.name;

                  // ดึงตำแหน่งจากหน้าโปรไฟล์
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
                catchError(() => {
                  // ถ้ายิง API โปรไฟล์พัง ให้ส่งข้อมูลเท่าที่มีกลับไป
                  return of({
                    id: athlete.realId,
                    name: athlete.displayName || 'ไม่ทราบชื่อ',
                    image: `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${athlete.realId}.png&w=150&h=150`,
                    team: 'ไม่ระบุทีม',
                    position: '-'
                  });
                })
              );
            });

            // รอให้โหลดข้อมูลครบทุกคนแล้วค่อยส่งไปที่หน้าเว็บ
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