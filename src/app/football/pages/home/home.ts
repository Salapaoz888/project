import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { MatchCardComponent } from '../../component/match-card/match-card';
import { 
  EspnService, 
  EspnEvent, 
  EspnStandingsEntry, 
  EspnScoreboardResponse, 
  EspnStandingsResponse,
 
  EspnNewsArticle // 🌟 1. นำเข้า Interface ข่าวมาด้วย
} from '../../services/espn';
import { LeagueSelectorComponent } from '../../component/league-selector/league-selector';
import { NewsCardComponent } from '../../component/news-card/news-card';
import { StandingsTableComponent } from '../../component/standings-table/standings-table';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,MatchCardComponent,LeagueSelectorComponent,NewsCardComponent,StandingsTableComponent],
  providers: [DatePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  public espnService = inject(EspnService);
  private datePipe = inject(DatePipe);

  activeTab = signal<'matches' | 'standings'>('matches');

  matches = signal<EspnEvent[]>([]);
  isLoading = signal<boolean>(false);
  startDate = signal<Date>(new Date());
  endDate = signal<Date>(new Date());

  standings = signal<EspnStandingsEntry[]>([]);
  isStandingsLoading = signal<boolean>(false);
  
  topStandings = computed(() => this.standings().slice(0, 4));

  // 🌟 2. เพิ่ม Signal สำหรับเก็บข้อมูลข่าว
  newsList = signal<EspnNewsArticle[]>([]);
  isNewsLoading = signal<boolean>(true);

  availableLeagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'fra.1', name: 'Ligue 1' }
  ];

  ngOnInit() {
    this.setWeek(new Date()); 
    this.fetchStandings(); 
    this.fetchNews(); // 🌟 โหลดข่าวตอนเปิดหน้าแรก
  }

  switchTab(tab: 'matches' | 'standings') {
    this.activeTab.set(tab);
  }

  changeLeague(leagueId: string) {
    this.espnService.setLeague(leagueId);
    this.matches.set([]);
    this.standings.set([]);
    this.newsList.set([]); // 🌟 ล้างข่าวเก่าออกก่อน

    this.fetchMatches();
    this.fetchStandings();
    this.fetchNews(); // 🌟 โหลดข่าวของลีกใหม่
  }

  // ==================== ส่วนวันที่และแมตช์ ====================
  setWeek(date: Date) {
    const current = new Date(date);
    const day = current.getDay();
    const diff = current.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(current.setDate(diff));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    this.startDate.set(start);
    this.endDate.set(end);
    this.fetchMatches();
  }

  changeWeek(weeks: number) {
    const newDate = new Date(this.startDate());
    newDate.setDate(newDate.getDate() + (weeks * 7));
    this.setWeek(newDate);
  }
  
  goToThisWeek() {
    this.setWeek(new Date());
  }

  fetchMatches() {
    this.isLoading.set(true);
    const startStr = this.datePipe.transform(this.startDate(), 'yyyyMMdd') || '';
    const endStr = this.datePipe.transform(this.endDate(), 'yyyyMMdd') || '';
    
    this.espnService.getMatches(`${startStr}-${endStr}`).subscribe({
      next: (data: EspnScoreboardResponse) => {
        if (data?.events) {
          const sorted = data.events.sort((a: EspnEvent, b: EspnEvent) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          this.matches.set(sorted);
        } else {
          this.matches.set([]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  // ==================== ส่วนตารางคะแนน ====================
  fetchStandings() {
    this.isStandingsLoading.set(true);
    this.espnService.getStandings().subscribe({
      next: (data: EspnStandingsResponse) => {
        if (data?.children?.[0]?.standings?.entries) {
          this.standings.set(data.children[0].standings.entries);
        } else {
          this.standings.set([]);
        }
        this.isStandingsLoading.set(false);
      },
      error: () => this.isStandingsLoading.set(false)
    });
  }

  

  // ==================== ส่วนข่าวล่าสุด (News) ====================
  // 🌟 3. ฟังก์ชันดึงข้อมูลข่าวล่าสุด
  fetchNews() {
    this.isNewsLoading.set(true);
    this.espnService.getLeagueNews().subscribe({
      next: (res) => {
        this.newsList.set(res.articles || []);
        this.isNewsLoading.set(false);
      },
      error: (err) => {
        console.error('News Error:', err);
        this.newsList.set([]);
        this.isNewsLoading.set(false);
      }
    });
  }
}