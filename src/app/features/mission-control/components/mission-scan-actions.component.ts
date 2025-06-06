import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionBarComponent } from '../../../shared/components/action-bar.component';
import { MissionStore } from '../stores/mission.store';
import { MissionService } from '../services/mission.service';

@Component({
  selector: 'app-mission-scan-actions',
  templateUrl: './mission-scan-actions.component.html',
  styleUrl: './mission-scan-actions.component.scss',
  standalone: true,
  imports: [CommonModule, ActionBarComponent]
})
export class MissionScanActionsComponent {
  private readonly missionStore = inject(MissionStore);
  private readonly missionService = inject(MissionService);

  // Expose store signals to template
  isScanning = this.missionStore.isScanning;
  canScanNewMission = this.missionStore.canScanNewMission;

  async onScanForMissions(): Promise<void> {
    if (!this.canScanNewMission()) {
      return;
    }

    this.missionStore.startScanning();

    try {
      // Simulate scanning delay
      // await new Promise(resolve => setTimeout(resolve, 5000));
      
      const newMission = this.missionService.generateMissionOutline();

      this.missionStore.addMission(newMission);
    } catch (error) {
      this.missionStore.setScanningError('Failed to scan for missions. Please try again.');
    }
  }
}
