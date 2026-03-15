import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { 
  EspnService, 
  EspnTeam, 
  EspnAthlete, 
  EspnEvent, 
  EspnTeamDetailResponse, 
  EspnRosterResponse, 
  EspnScheduleResponse,
  EspnCompetitor
} from '../../services/espn';

// 🌟 สร้าง Interface เสริมสำหรับจัดการโครงสร้าง Roster ที่ถูกจัดกลุ่ม (เช่น Attackers, Defenders)
export interface EspnRosterGroup {
  items: EspnAthlete[];
}

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './team-detail.html',
  styleUrls: ['./team-detail.scss']
})
export class TeamDetailComponent implements OnInit {
  private espnService = inject(EspnService);
  private route = inject(ActivatedRoute);

  // 🌟 แก้ไข: แทนที่ any ด้วย Interface ที่ถูกต้อง
  teamInfo = signal<EspnTeam | null>(null);
  players = signal<EspnAthlete[]>([]);
  pastMatches = signal<EspnEvent[]>([]); 
  isLoading = signal<boolean>(true);

 // 🌟 สร้าง Type ชั่วคราวเพื่อบอกว่า position มี abbreviation
  // 🌟 สร้าง Type ชั่วคราวเพื่อบอกว่า position มี abbreviation
  goalkeepers = computed(() => this.players().filter(p => (p.position as {abbreviation?: string})?.abbreviation === 'G'));
  defenders = computed(() => this.players().filter(p => (p.position as {abbreviation?: string})?.abbreviation === 'D'));
  midfielders = computed(() => this.players().filter(p => (p.position as {abbreviation?: string})?.abbreviation === 'M'));
  forwards = computed(() => this.players().filter(p => (p.position as {abbreviation?: string})?.abbreviation === 'F' || (p.position as {abbreviation?: string})?.abbreviation === 'A'));

  ngOnInit() {
    const teamId = this.route.snapshot.paramMap.get('id');
    
    if (teamId) {
      // 1. ดึงข้อมูลทีม
      this.espnService.getTeamDetail(teamId).subscribe({
        next: (data: EspnTeamDetailResponse) => { 
          if (data && data.team) this.teamInfo.set(data.team); 
        },
        error: (err: unknown) => console.error('Error team details:', err)
      });

      // 2. ดึงรายชื่อนักเตะ
      this.espnService.getTeamRoster(teamId).subscribe({
        next: (data: EspnRosterResponse) => {
          if (data && Array.isArray(data.athletes)) {
            // 🌟 ใช้ 'in' operator และ Type Assertion ตรวจสอบว่ามี items หรือไม่
            if (data.athletes[0] && 'items' in data.athletes[0] && Array.isArray((data.athletes[0] as EspnRosterGroup).items)) {
               this.players.set(data.athletes.flatMap((group: unknown) => (group as EspnRosterGroup).items));
            } else {
               this.players.set(data.athletes as EspnAthlete[]);
            }
          }
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error('Error team roster:', err);
          this.isLoading.set(false);
        }
      });

      // 3. ดึงตารางแข่ง
      this.espnService.getTeamSchedule(teamId).subscribe({
        next: (data: EspnScheduleResponse) => {
          if (data && Array.isArray(data.events)) {
            
            // 🌟 ระบุชนิดข้อมูลให้ชัดเจนว่าเป็น EspnEvent[]
            const finishedMatches: EspnEvent[] = data.events.filter((e: EspnEvent) => 
              e.competitions?.[0]?.status?.type?.state === 'post'
            );
            
            finishedMatches.sort((a: EspnEvent, b: EspnEvent) => {
              const dateA = a.date ? new Date(a.date).getTime() : 0;
              const dateB = b.date ? new Date(b.date).getTime() : 0;
              return dateB - dateA;
            });
            
            this.pastMatches.set(finishedMatches.slice(0, 5));
          }
        },
        error: (err: unknown) => console.error('Error team schedule:', err)
      });
    } else {
      this.isLoading.set(false);
    }
  }

  // 🌟 ฟังก์ชันดึงคะแนน
  getScore(competitor: EspnCompetitor | undefined): string {
    if (!competitor || competitor.score == null) return '0';
    
    // 🌟 ดักจับโครงสร้างของ Score ที่อาจจะเป็น Object (มี displayValue/value) หรือ String ธรรมดา
    const scoreObj = competitor.score as unknown as { displayValue?: string; value?: string | number };
    
    if (typeof scoreObj === 'object' && scoreObj !== null) {
      if (scoreObj.displayValue !== undefined) return String(scoreObj.displayValue);
      if (scoreObj.value !== undefined) return String(scoreObj.value);
    }
    
    return String(competitor.score);
  }
}