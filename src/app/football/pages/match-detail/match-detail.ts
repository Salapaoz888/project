import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { 
  EspnService, EspnEvent, EspnMatchSummaryResponse, 
  EspnAthlete, EspnTeam, EspnMatchRoster, EspnMatchRosterPlayer 
} from '../../services/espn';

export interface EspnBoxscore {
  teams: { statistics: { name: string; label: string; displayValue: string; }[] }[];
}

export interface EspnKeyEvent {
  type?: { text: string; };
  participants?: { athlete?: EspnAthlete }[];
  athlete?: EspnAthlete;
  athletes?: EspnAthlete[];
  shortText?: string;
  text?: string;
  team?: { id: string; };
  clock?: { displayValue: string; };
  [key: string]: unknown;
}

// 🌟 อัปเดต Interface รองรับการสร้างแถวไดนามิก
export interface ProcessedLineup {
  team: EspnTeam;
  formation: string;
  lineupRows: EspnMatchRosterPlayer[][]; 
  substitutes: EspnMatchRosterPlayer[];
}

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-detail.html',
  styleUrls: ['./match-detail.scss']
})
export class MatchDetailComponent implements OnInit {
  private espnService = inject(EspnService);
  private route = inject(ActivatedRoute);

  header = signal<EspnEvent | null>(null);
  boxscore = signal<EspnBoxscore | null>(null);
  keyEvents = signal<EspnKeyEvent[]>([]);
  isLoading = signal<boolean>(true);

  homeLineup = signal<ProcessedLineup | null>(null);
  awayLineup = signal<ProcessedLineup | null>(null);

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.espnService.getMatchSummary(eventId).subscribe({
        next: (data: EspnMatchSummaryResponse) => {
          if (data) {
            this.header.set(data.header as EspnEvent);
            this.boxscore.set(data.boxscore as EspnBoxscore);
            
            if (data.keyEvents) {
              const filtered = (data.keyEvents as EspnKeyEvent[]).filter((e: EspnKeyEvent) => {
                const t = e.type?.text?.toLowerCase() || '';
                return t.includes('goal') || t.includes('card') || t.includes('penalty');
              });
              this.keyEvents.set(filtered);
            }

            // จัดการข้อมูล Lineups 11 ตัวจริง
            if (data.rosters && data.rosters.length >= 2) {
              this.homeLineup.set(this.processRoster(data.rosters[0]));
              this.awayLineup.set(this.processRoster(data.rosters[1]));
            }
          }
          this.isLoading.set(false);
        },
        error: (err: unknown) => {
          console.error(err);
          this.isLoading.set(false);
        }
      });
    }
  }
// 🌟 ฟังก์ชันสลับฝั่งให้ทีมเยือน (ยังคงไว้เหมือนเดิม)
getReversedRows(rows: EspnMatchRosterPlayer[][]): EspnMatchRosterPlayer[][] {
  return [...rows].reverse().map(row => [...row]);
}

// 🌟 โค้ดใหม่ล่าสุด: ระบบพิกัด X, Y จัดตำแหน่งเป๊ะ 100% ทะลวงทุกบั๊กของ API!
processRoster(rosterData: EspnMatchRoster): ProcessedLineup {
  const starters = rosterData.roster.filter(p => p.starter);
  const subs = rosterData.roster.filter(p => p.substitute);
  const formation = rosterData.formation;
  let lineupRows: EspnMatchRosterPlayer[][] = [];

  // 🌟 1. สร้างตารางพิกัด ให้นักเตะทุกคนมีแกน Y (หลังไปหน้า) และแกน X (ขวาไปซ้าย)
  const getGrid = (p: EspnMatchRosterPlayer): { y: number, x: number } => {
    const abbr = p.position?.abbreviation?.toUpperCase() || '';
    const name = p.position?.name?.toLowerCase() || '';

    // ผู้รักษาประตู
    if (['G', 'GK'].includes(abbr) || name.includes('goal')) return { y: 10, x: 50 };

    // กองหลัง (เรียง ขวา -> ซ้าย)
    if (['RB', 'RWB', 'DR'].includes(abbr) || name.includes('right back')) return { y: 20, x: 10 };
    if (['RCB'].includes(abbr)) return { y: 20, x: 30 };
    if (['CB', 'DC', 'D', 'SW'].includes(abbr) || name.includes('defend')) return { y: 20, x: 50 };
    if (['LCB'].includes(abbr)) return { y: 20, x: 70 };
    if (['LB', 'LWB', 'DL'].includes(abbr) || name.includes('left back')) return { y: 20, x: 90 };

    // กองกลางตัวรับ (เรียง ขวา -> ซ้าย)
    if (['RDM'].includes(abbr)) return { y: 30, x: 20 };
    if (['CDM', 'DMC'].includes(abbr) || name.includes('defensive mid')) return { y: 30, x: 50 };
    if (['LDM'].includes(abbr)) return { y: 30, x: 80 };

    // กองกลาง (เรียง ขวา -> ซ้าย)
    if (['RM', 'MR'].includes(abbr) || name.includes('right mid')) return { y: 40, x: 10 };
    if (['RCM'].includes(abbr)) return { y: 40, x: 30 };
    if (['CM', 'MC', 'M'].includes(abbr) || name === 'midfielder') return { y: 40, x: 50 };
    if (['LCM'].includes(abbr)) return { y: 40, x: 70 };
    if (['LM', 'ML'].includes(abbr) || name.includes('left mid')) return { y: 40, x: 90 };

    // กองกลางตัวรุก (เรียง ขวา -> ซ้าย)
    if (['RAM'].includes(abbr)) return { y: 50, x: 20 };
    if (['CAM', 'AMC'].includes(abbr) || name.includes('attacking mid')) return { y: 50, x: 50 };
    if (['LAM'].includes(abbr)) return { y: 50, x: 80 };

    // ปีก (เรียง ขวา -> ซ้าย)
    if (['RW', 'RF'].includes(abbr) || name.includes('right wing')) return { y: 60, x: 10 };
    if (['LW', 'LF'].includes(abbr) || name.includes('left wing')) return { y: 60, x: 90 };

    // กองหน้า
    if (['ST', 'CF', 'F', 'A', 'FC'].includes(abbr) || name.includes('strik') || name.includes('forward')) return { y: 70, x: 50 };

    // กันเหนียวกรณี API ส่งข้อมูลประหลาด
    return { y: 99, x: 50 };
  };

  // 🌟 2. เรียงนักเตะทั้ง 11 คนตามแนวลึก (หลัง ไป หน้า) ด้วยแกน Y
  starters.sort((a, b) => {
    const posA = getGrid(a);
    const posB = getGrid(b);
    if (posA.y !== posB.y) return posA.y - posB.y;
    return (a.formationPosition || 0) - (b.formationPosition || 0); // กรณี Y เท่ากัน ให้รักษาลำดับเดิมไว้
  });

  // 🌟 3. หั่นนักเตะที่เรียงสวยแล้ว ใส่เข้าไปในแต่ละแถวตามแผนการเล่น
  if (formation && starters.length === 11) {
    const lines = formation.split('-').map(Number); // เช่น "4-2-3-1"
    let currentIndex = 0;

    // แถวที่ 1: ผู้รักษาประตู
    lineupRows.push(starters.slice(currentIndex, currentIndex + 1));
    currentIndex += 1;

    // แถวต่อๆ ไป: หั่นตามตัวเลขแผน
    lines.forEach(count => {
      lineupRows.push(starters.slice(currentIndex, currentIndex + count));
      currentIndex += count;
    });
  } else {
    // Fallback
    lineupRows = [
      starters.filter(p => getGrid(p).y === 10),
      starters.filter(p => getGrid(p).y === 20),
      starters.filter(p => getGrid(p).y === 30 || getGrid(p).y === 40),
      starters.filter(p => getGrid(p).y >= 50)
    ];
  }

  // 🌟 4. ขั้นตอนที่พลาดไปในรอบก่อน: เรียงนักเตะ "ภายในแถวเดียวกัน" จาก ขวา ไป ซ้าย ด้วยแกน X!
  lineupRows = lineupRows.map(row => {
    return row.sort((a, b) => getGrid(a).x - getGrid(b).x);
  });

  return {
    team: rosterData.team,
    formation: formation || '-',
    lineupRows: lineupRows,
    substitutes: subs
  };
}
  // ==========================================
  // 🌟 ฟังก์ชันช่วยเหลือสำหรับไทม์ไลน์และสถิติ
  // ==========================================

  getEventIcon(typeText: string): string {
    const text = typeText?.toLowerCase() || '';
    if (text.includes('missed') || text.includes('saved')) return '❌';
    if (text.includes('goal') || text.includes('penalty')) return '⚽';
    if (text.includes('yellow')) return '🟨';
    if (text.includes('red')) return '🟥';
    return '•';
  }

  getPlayerName(event: EspnKeyEvent): string {
    const athlete = event?.participants?.[0]?.athlete || event?.athlete || event?.athletes?.[0];
    if (athlete) {
      return athlete.shortName || athlete.displayName || athlete.fullName || 'ผู้เล่น';
    }

    let rawText = event?.shortText || event?.text || '';
    if (rawText) {
      if (rawText.includes('-')) {
        rawText = rawText.split('-')[0];
      }
      const name = rawText.split('(')[0]
        .replace(/Own Goal/ig, '')
        .replace(/Goal/ig, '')
        .replace(/Penalty/ig, '')
        .replace(/Yellow Card/ig, '')
        .replace(/Red Card/ig, '')
        .trim();
      return name !== '' ? name : 'ผู้เล่น';
    }
    return 'ผู้เล่น';
  }

  getEventSuffix(typeText: string): string {
    const text = typeText?.toLowerCase() || '';
    if (text.includes('own goal')) return '(OG)';
    if (text.includes('penalty')) return '(จุดโทษ)';
    return '';
  }

  compareStats(homeValue: string, awayValue: string): 'home' | 'away' | 'tie' {
    if (!homeValue || !awayValue) return 'tie';
    const homeNum = parseFloat(homeValue.replace(/[^0-9.]/g, ''));
    const awayNum = parseFloat(awayValue.replace(/[^0-9.]/g, ''));

    if (homeNum > awayNum) return 'home';
    if (awayNum > homeNum) return 'away';
    return 'tie';
  }
}