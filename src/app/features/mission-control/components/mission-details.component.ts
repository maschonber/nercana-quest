import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NavigationService } from '../../../shared/services/navigation.service';
import { MissionStore } from '../stores/mission.store';
import { MissionOutline, MissionType } from '../models/mission-outline.model';
import { StandardViewComponent } from '../../../shared/components/standard-view.component';
import { MissionPathVisualizationComponent } from './mission-path-visualization.component';

@Component({
  selector: 'app-mission-details',
  templateUrl: './mission-details.component.html',
  styleUrl: './mission-details.component.scss',
  standalone: true,
  imports: [CommonModule, StandardViewComponent, MissionPathVisualizationComponent]
})
export class MissionDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly navigationService = inject(NavigationService);
  private readonly missionStore = inject(MissionStore);

  mission: MissionOutline | null = null;

  ngOnInit(): void {
    const missionId = this.route.snapshot.paramMap.get('missionId');

    if (!missionId) {
      this.router.navigate(['/mission-control']);
      return;
    }

    this.mission = this.missionStore.getMissionById(missionId) || null;

    if (!this.mission) {
      this.router.navigate(['/mission-control']);
      return;
    }

    this.setupNavigation();
  }

  private setupNavigation(): void {
    if (!this.mission) return;

    this.navigationService.setCurrentTitle(this.mission.title);
    this.navigationService.setBreadcrumbs([
      { label: 'Station Overview', route: '/' },
      { label: 'Mission Control', route: '/mission-control' },
      { label: this.mission.title }
    ]);
  }

  onDeployClones(): void {
    // Future implementation - deployment system
    console.log(
      'Deploy clones functionality will be implemented in future update'
    );
  }

  onBackToOverview(): void {
    this.router.navigate(['/mission-control']);
  }

  formatTravelTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds} seconds`;
    } else if (remainingSeconds === 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      return `${minutes} minute${minutes === 1 ? '' : 's'} ${remainingSeconds} second${remainingSeconds === 1 ? '' : 's'}`;
    }
  }

  getDifficultyText(challengeRating: number): string {
    if (challengeRating <= 2) return 'Easy';
    if (challengeRating <= 3) return 'Medium';
    if (challengeRating <= 4) return 'Hard';
    return 'Extreme';
  }

  getDifficultyClass(challengeRating: number): string {
    if (challengeRating <= 2) return 'difficulty-easy';
    if (challengeRating <= 3) return 'difficulty-medium';
    if (challengeRating <= 4) return 'difficulty-hard';
    return 'difficulty-extreme';
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

  getMissionTypeName(missionType: MissionType): string {
    switch (missionType) {
      case MissionType.EXPLORATION:
        return 'Exploration';
      case MissionType.MINING:
        return 'Mining';
      case MissionType.RESCUE:
        return 'Rescue';
      case MissionType.COMBAT:
        return 'Combat';
      default:
        return 'Unknown';
    }
  }

  missionJson(): string {
    return JSON.stringify(
      this.mission,
      function replacer(key, value) {
        if (value instanceof Map) {
          return {
            dataType: 'Map',
            value: Array.from(value.entries()) // or with spread: value: [...value]
          };
        } else {
          return value;
        }
      },
      2
    );
  }
}
