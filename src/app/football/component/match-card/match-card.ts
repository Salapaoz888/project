/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-card.html',
  styleUrls: ['./match-card.scss']
})
export class MatchCardComponent {
  @Input() match: any;

  // =========================================
  // 🏠 Helper สำหรับทีมเหย้า (Home Team - index 0)
  // =========================================
  getHomeTeamId(): string {
    return this.match?.competitions?.[0]?.competitors?.[0]?.team?.id || '';
  }
  getHomeTeamName(): string {
    return this.match?.competitions?.[0]?.competitors?.[0]?.team?.name || 'ไม่ทราบชื่อ';
  }
  getHomeTeamLogo(): string {
    const team = this.match?.competitions?.[0]?.competitors?.[0]?.team;
    return team?.logo || team?.logos?.[0]?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default.png';
  }
  getHomeScore(): string {
    return this.match?.competitions?.[0]?.competitors?.[0]?.score || '0';
  }

  // =========================================
  // ✈️ Helper สำหรับทีมเยือน (Away Team - index 1)
  // =========================================
  getAwayTeamId(): string {
    return this.match?.competitions?.[0]?.competitors?.[1]?.team?.id || '';
  }
  getAwayTeamName(): string {
    return this.match?.competitions?.[0]?.competitors?.[1]?.team?.name || 'ไม่ทราบชื่อ';
  }
  getAwayTeamLogo(): string {
    const team = this.match?.competitions?.[0]?.competitors?.[1]?.team;
    return team?.logo || team?.logos?.[0]?.href || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/default.png';
  }
  getAwayScore(): string {
    return this.match?.competitions?.[0]?.competitors?.[1]?.score || '0';
  }

  // =========================================
  // 📊 Helper สำหรับข้อมูลแมตช์
  // =========================================
  getMatchVenue(): string {
    return this.match?.competitions?.[0]?.venue?.fullName || 'ไม่ระบุสนาม';
  }
  getMatchStatus(): string {
    return this.match?.status?.type?.detail || '-';
  }
  isMatchFinished(): boolean {
    // ถ้าสถานะไม่ใช่ 'pre' (ยังไม่เริ่ม) ถือว่าแข่งขันแล้วหรือกำลังแข่ง
    return this.match?.status?.type?.state !== 'pre';
  }
}