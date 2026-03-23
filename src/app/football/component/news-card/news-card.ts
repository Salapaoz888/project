/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news-card.html',
  styleUrls: ['./news-card.scss']
})
export class NewsCardComponent {
  // 🌟 รับข้อมูลข่าว 1 ข่าว ที่ถูกส่งมาจากหน้า Home
  @Input() news: any;

  // =========================================
  // 🧠 Helper Methods ช่วยจัดการข้อมูลก่อนแสดงผล
  // =========================================
  getHeadline(): string {
    return this.news?.headline || 'ไม่มีหัวข้อข่าว';
  }

  getNewsLink(): string {
    return this.news?.links?.web?.href || '#';
  }

  getImageUrl(): string {
    return this.news?.images?.[0]?.url || 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/default-team-logo-500.png';
  }

  getPublishedDate(): string {
    // ส่งวันที่ออกไปให้ Pipe ใน HTML แปลงฟอร์แมตอีกที
    return this.news?.published || '';
  }
}