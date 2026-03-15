/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EspnService } from '../../services/espn';

@Component({
  selector: 'app-player-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-profile.html',
  styleUrls: ['./player-profile.scss'],
})
export class PlayerProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private espnService = inject(EspnService);

  playerData = signal<any>(null);

  playerStats = signal<any[]>([]);
  playerAwards = signal<any[]>([]);
  playerBio = signal<string>('');

  // 🌟 เพิ่ม Signal สำหรับเก็บประวัติการค้าแข้ง
  playerCareer = signal<any[]>([]);

  isLoading = signal<boolean>(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPlayerInfo(id);
    } else {
      this.goBack();
    }
  }

  loadPlayerInfo(id: string) {
    this.isLoading.set(true);
    this.espnService.getPlayerProfile(id).subscribe({
      next: (res) => {
        const athleteData = res.athlete || res; 
        
        let imageUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${id}.png&w=300&h=300`;
        if (athleteData.headshot?.href) imageUrl = athleteData.headshot.href;
        
        athleteData.imageUrl = imageUrl;
        athleteData.teamName = athleteData.team?.displayName || athleteData.team?.name || 'ไม่มีสังกัดสโมสร';
        athleteData.positionName = athleteData.position?.displayName || athleteData.position?.name || '-';

        // 🌟 1. ดึงข้อมูลสถิติ
        let stats: any[] = [];
        if (athleteData.statsSummary && athleteData.statsSummary.statistics) {
          stats = athleteData.statsSummary.statistics;
        } else if (athleteData.statistics && Array.isArray(athleteData.statistics)) {
          stats = athleteData.statistics;
        }
        this.playerStats.set(stats);

        // 🌟 2. ดึงข้อมูลรางวัล
        const rawAwards = athleteData.honors || athleteData.awards || res.honors || res.awards;
        let awards: any[] = [];
        if (Array.isArray(rawAwards)) awards = rawAwards;
        else if (rawAwards && Array.isArray(rawAwards.items)) awards = rawAwards.items;
        else if (rawAwards && Array.isArray(rawAwards.entries)) awards = rawAwards.entries;
        this.playerAwards.set(awards.map(a => typeof a === 'string' ? { name: a } : a));

        // 🌟 3. ดึงประวัติการค้าแข้ง
        let career: any[] = [];
        const teamsHistory = athleteData.teams || res.teams;
        if (teamsHistory && Array.isArray(teamsHistory)) {
          career = teamsHistory.map((t: any) => ({
            name: t.team?.displayName || t.displayName || t.name || 'ไม่ทราบสโมสร',
            season: t.season?.displayName || t.season?.year || t.year || ''
          }));
        }
        this.playerCareer.set(career);

        // 🌟 4. ดึงประวัติย่อ
        this.playerBio.set(athleteData.notes || res.notes || athleteData.biography || '');

      
        // 🌟 ส่งข้อมูลที่ประกอบร่างเสร็จแล้วทั้งหมดขึ้นหน้าจอ!
        this.playerData.set(athleteData);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Profile Error:', err);
        this.isLoading.set(false);
      }
    });
  }

  onImageError(event: any) {
    event.target.src = 'https://a.espncdn.com/combiner/i?img=/i/headshots/nophoto.png';
  }

  goBack() {
    this.router.navigate(['/player']);
  }
}
