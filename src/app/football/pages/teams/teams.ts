import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { EspnService, EspnTeam, EspnResponse, EspnTeamData } from '../../services/espn';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './teams.html',
  styleUrls: ['./teams.scss']
})
export class TeamsComponent implements OnInit {
  public espnService = inject(EspnService); 

  // 🌟 1. เปลี่ยน any[] เป็น EspnTeam[]
  teams = signal<EspnTeam[]>([]);
  isLoading = signal<boolean>(true);

  availableLeagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'fra.1', name: 'Ligue 1' }
  ];

  ngOnInit() {
    this.fetchTeams();
  }

  fetchTeams() {
    this.isLoading.set(true);
    
    this.espnService.getTeams().subscribe({
      // 🌟 2. ระบุ Type ของ data เป็น EspnResponse
      next: (data: EspnResponse) => {
        if (data?.sports?.[0]?.leagues?.[0]?.teams) {
          // 🌟 3. ระบุ Type ของ t ใน map เป็น EspnTeamData
          const teamList = data.sports[0].leagues[0].teams.map((t: EspnTeamData) => t.team);
          this.teams.set(teamList);
        } else {
          this.teams.set([]); 
        }
        this.isLoading.set(false);
      },
      // 🌟 4. เปลี่ยน error เป็น unknown
      error: (err: unknown) => {
        console.error('ดึงข้อมูลทีมล้มเหลว:', err);
        this.isLoading.set(false);
      }
    });
  }

  changeLeague(leagueId: string) {
    this.espnService.setLeague(leagueId);
    this.fetchTeams(); 
  }
}