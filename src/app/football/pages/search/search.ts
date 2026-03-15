import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EspnService, GlobalTeam } from '../../services/espn'; // 🌟 Import GlobalTeam เข้ามา

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class SearchComponent implements OnInit {
  private espnService = inject(EspnService);
  private router = inject(Router);

  // 🌟 แก้ไข: ใช้ GlobalTeam แทน any
  allTeams = signal<GlobalTeam[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = signal<string>('');

  filteredTeams = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const teams = this.allTeams();
    
    if (!query) return teams; 
    
    return teams.filter(team => 
      team.name?.toLowerCase().includes(query) || 
      team.abbreviation?.toLowerCase().includes(query)
    );
  });

  ngOnInit() {
    this.espnService.getAllTeamsGlobally().subscribe({
      // 🌟 แก้ไข: กำหนด Type เป็น GlobalTeam[]
      next: (data: GlobalTeam[]) => {
        this.allTeams.set(data);
        this.isLoading.set(false);
      },
      // 🌟 แก้ไข: ใช้ unknown แทน any
      error: (err: unknown) => {
        console.error('ดึงข้อมูลล้มเหลว', err);
        this.isLoading.set(false);
      }
    });
  }

  // ==========================================
  // 🌟 3. พระเอกของเราที่หายไป นำกลับมาแล้วครับ!
  // ==========================================
  
  // 🌟 แก้ไข: ระบุประเภทของ parameter เป็น GlobalTeam
  goToTeam(team: GlobalTeam) {
    if (team.leagueId) {
      this.espnService.setLeague(team.leagueId); // สลับสถานะลีคให้ตรงกับทีม
    }
    this.router.navigate(['/team', team.id]); // กระโดดไปหน้า Detail
  }
  getLogo(team: GlobalTeam): string {
    return team.logos?.[0]?.href || '';
  }
}