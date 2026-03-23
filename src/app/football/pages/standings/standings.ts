/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EspnService, EspnStandingsEntry } from '../../services/espn';

import { LeagueSelectorComponent } from '../../component/league-selector/league-selector';
import { StandingsTableComponent } from '../../component/standings-table/standings-table';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule,LeagueSelectorComponent,StandingsTableComponent],
  templateUrl: './standings.html',
  styleUrls: ['./standings.scss']
})
export class StandingsComponent implements OnInit {
  public espnService = inject(EspnService);
  
  standings = signal<EspnStandingsEntry[]>([]);
  isLoading = signal<boolean>(true);

  // 🌟 เพิ่มรายการลีกที่สามารถเลือกได้
  availableLeagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'fra.1', name: 'Ligue 1' }
  ];

  ngOnInit() {
    this.fetchStandings();
  }

  fetchStandings() {
    this.isLoading.set(true);
    this.espnService.getStandings().subscribe({
      next: (res) => {
        if (res?.children?.[0]?.standings?.entries) {
          this.standings.set(res.children[0].standings.entries);
        } else {
          this.standings.set([]);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Standings error:', err);
        this.isLoading.set(false);
      }
    });
  }

  // 🌟 ฟังก์ชันเปลี่ยนลีกและโหลดข้อมูลใหม่
  changeLeague(leagueId: string) {
    this.espnService.setLeague(leagueId);
    this.fetchStandings();
  }

  // 🌟 Helper method ดึงค่าสถิติแบบระบุชื่อย่อ (ป้องกัน API ส่งข้อมูลสลับตำแหน่ง)
  // GP = แข่ง, W = ชนะ, D = เสมอ, L = แพ้, GD = ได้เสีย, P = แต้ม
  getStatValue(stats: any[], abrv: string): string | number {
    const stat = stats.find(s => s.abbreviation === abrv);
    return stat ? stat.displayValue || stat.value : 0;
  }
}