/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-standings-table',
  standalone: true,
  imports: [CommonModule, RouterLink], // 🌟 อย่าลืม RouterLink เพื่อให้กดไปหน้าทีมได้
  templateUrl: './standings-table.html',
  styleUrls: ['./standings-table.scss']
})
export class StandingsTableComponent {
  // 🌟 1. รับข้อมูลตารางคะแนนมา (อาจจะเป็น 4 ทีม หรือ 20 ทีมก็ได้)
  @Input() standings: any[] = [];
  
  // 🌟 2. สวิตช์เช็คว่าให้แสดงแบบ "ย่อ (Top 4)" หรือ "เต็ม (Standings)"
  @Input() isCompact= false;

  // =========================================
  // 🧠 Helper ดึงสถิติต่างๆ (ย้ายมาจากหน้า Home)
  // =========================================
  getStat(stats: any[], statName: string) {
    if (!stats) return '-';
    const stat = stats.find((s: any) => s.name === statName);
    return stat ? stat.displayValue : '-';
  }

  // ดึงโลโก้ทีม (กันเหนียวเผื่อ API ไม่มี)
  getTeamLogo(entry: any): string {
    return entry?.team?.logos?.[0]?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default.png';
  }
}