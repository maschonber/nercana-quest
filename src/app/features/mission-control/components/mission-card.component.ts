import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MissionOutline, MissionType } from '../models/mission-outline.model';

@Component({
  selector: 'app-mission-card',
  templateUrl: './mission-card.component.html',
  styleUrl: './mission-card.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class MissionCardComponent {
  @Input({ required: true }) mission!: MissionOutline;
  @Output() scrapMission = new EventEmitter<string>();

  constructor(private router: Router) {}

  onCardClick(): void {
    this.router.navigate(['/mission-control/missions', this.mission.id]);
  }

  onScrapMission(event: Event): void {
    event.stopPropagation(); // Prevent card click navigation
    this.scrapMission.emit(this.mission.id);
  }

  formatTravelTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds}s`;
    } else if (remainingSeconds === 0) {
      return `${minutes}m`;
    } else {
      return `${minutes}m ${remainingSeconds}s`;
    }
  }

  getDifficultyClass(challengeRating: number): string {
    if (challengeRating <= 2) return 'difficulty-easy';
    if (challengeRating <= 3) return 'difficulty-medium';
    if (challengeRating <= 4) return 'difficulty-hard';
    return 'difficulty-extreme';
  }

  getDifficultyText(challengeRating: number): string {
    if (challengeRating <= 2) return 'Easy';
    if (challengeRating <= 3) return 'Medium';
    if (challengeRating <= 4) return 'Hard';
    return 'Extreme';
  }

  getMissionTypeIcon(missionType: MissionType): string {
    switch (missionType) {
      case MissionType.EXPLORATION:
        return '🔍';
      case MissionType.MINING:
        return '⛏️';
      case MissionType.RESCUE:
        return '🚑';
      case MissionType.COMBAT:
        return '⚔️';
      default:
        return '🚀';
    }
  }
}
