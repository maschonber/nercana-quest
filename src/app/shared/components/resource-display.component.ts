import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StationStore } from '../stores/station.store';

@Component({
  selector: 'app-resource-display',
  templateUrl: './resource-display.component.html',
  styleUrl: './resource-display.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class ResourceDisplayComponent {
  private readonly stationStore = inject(StationStore);

  // Expose store signals for template
  resources = this.stationStore.resources;
  hasResources = this.stationStore.hasResources;
}
