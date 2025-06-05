import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MissionStore } from '../stores/mission.store';
import { MissionCardComponent } from './mission-card.component';

@Component({
  selector: 'app-mission-control-overview',
  templateUrl: './mission-control-overview.component.html',
  styleUrl: './mission-control-overview.component.scss',
  standalone: true,
  imports: [CommonModule, MissionCardComponent]
})
export class MissionControlOverviewComponent implements OnInit {
  private readonly missionStore = inject(MissionStore);

  // Expose store signals to template
  missions = this.missionStore.missions;
  isScanning = this.missionStore.isScanning;
  error = this.missionStore.error;

  ngOnInit(): void {
    // Clear any existing errors when component initializes
    this.missionStore.clearError();
  }
  onScrapMission(missionId: string): void {
    this.missionStore.removeMission(missionId);
  }

  onRetryAfterError(): void {
    this.missionStore.clearError();
  }
}
