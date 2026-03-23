/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './player-card.html',
  styleUrls: ['./player-card.scss']
})
export class PlayerCardComponent {
  // 🌟 เปิดรับข้อมูลนักเตะจากหน้าอื่นๆ (หน้าไหนเรียกใช้ ต้องส่งข้อมูลมาให้ด้วย)
  @Input() player: any; 

  private router = inject(Router);

  // 🌟 พอกดปุ๊บ ให้พาไปหน้าโปรไฟล์เลย
  viewPlayer() {
    if (this.player && this.player.id) {
      this.router.navigate(['/player', this.player.id]);
    }
  }

  // 🌟 Helper ดึงชื่อ (ดักจับ API ทุกรูปแบบ)
  getName(): string {
    return this.player?.fullName || this.player?.displayName || this.player?.name || 'ไม่ทราบชื่อ';
  }

  // 🌟 Helper ดึงรูปภาพ
  getImageUrl(): string {
    return this.player?.headshot?.href || 
           this.player?.image || 
           `https://a.espncdn.com/combiner/i?img=/i/headshots/soccer/players/full/${this.player?.id}.png&w=150&h=150`;
  }

  // 🌟 Helper ดึงข้อมูลรอง (เช่น สัญชาติ หรือ ตำแหน่ง)
  getSecondaryInfo(): string {
    if (!this.player) return 'ไม่ระบุ';
    return this.player.birthPlace?.country?.name || 
           this.player.birthPlace?.country || 
           this.player.flag?.alt || 
           this.player.citizenship || 
           this.player.nationality || 
           this.player.position?.name || 
           this.player.position || 
           'ไม่ระบุ';
  }
}