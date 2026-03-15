import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // 🌟 1. นำเข้า RouterLink
import { EspnService, EspnStandingsEntry } from '../../services/espn';

@Component({
  selector: 'app-standings',
  standalone: true,
  imports: [CommonModule, RouterLink], // 🌟 2. เพิ่มเข้า imports
  templateUrl: './standings.html', 
  styleUrls: ['./standings.scss']
})
export class StandingsComponent implements OnInit {
  private espnService = inject(EspnService);
  standings = signal<EspnStandingsEntry[]>([]);

  ngOnInit() {
    this.espnService.getStandings().subscribe({
      next: (data) => {
        if (data && data.children && data.children[0].standings.entries) {
          this.standings.set(data.children[0].standings.entries);
        }
      },
      error: (err) => console.error('ดึงข้อมูลตารางคะแนนล้มเหลว:', err)
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStat(stats: any[], abbreviation: string): string {
    if (!stats) return '-';
    // บางที API ใช้ F (For) / A (Against) บางทีใช้ GF / GA เราเลยดักไว้ทั้งสองแบบ
    const stat = stats.find(s => s.abbreviation === abbreviation || s.abbreviation === abbreviation + 'F' || s.abbreviation === abbreviation + 'A');
    return stat ? stat.value : '-';
  }

  // 🌟 3. ฟังก์ชันคำนวณสีแถบด้านซ้ายตามอันดับ (อิงจากพรีเมียร์ลีก)
  getZoneColor(index: number): string {
    if (index < 4) return '#00529f'; // อันดับ 1-4 (ยูฟ่าแชมเปียนส์ลีก - สีน้ำเงิน)
    if (index === 4) return '#d65100'; // อันดับ 5 (ยูโรปาลีก - สีส้ม)
    if (index >= 17) return '#d9534f'; // อันดับ 18-20 (ตกชั้น - สีแดง)
    return 'transparent'; // อันดับอื่นๆ ไม่มีสี
  }
}