import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-league-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './league-selector.html',
  styleUrls: ['./league-selector.scss']
})
export class LeagueSelectorComponent {
  // 🌟 รับค่า ID ลีกปัจจุบันที่กำลังเลือกอยู่
  @Input() selectedLeagueId = 'eng.1'; 
  
  // 🌟 ส่งสัญญาณออกไปบอกหน้าหลักว่ามีการกดเปลี่ยนลีก
  @Output() leagueChange = new EventEmitter<string>();

  availableLeagues = [
    { id: 'eng.1', name: 'Premier League' },
    { id: 'esp.1', name: 'La Liga' },
    { id: 'ger.1', name: 'Bundesliga' },
    { id: 'ita.1', name: 'Serie A' },
    { id: 'fra.1', name: 'Ligue 1' }
  ];

  onSelect(id: string) {
    this.leagueChange.emit(id);
  }
}