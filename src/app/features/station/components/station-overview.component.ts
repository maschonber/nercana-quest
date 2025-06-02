
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StandardViewComponent } from '../../../shared/components/standard-view.component';
import { TabViewComponent, TabComponent } from '../../../shared/components/tab-view.component';
import { NavigationService, StationSystem } from '../../../shared/services/navigation.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-station-overview',
  templateUrl: './station-overview.component.html',
  styleUrl: './station-overview.component.scss',
  standalone: true,
  imports: [StandardViewComponent, TabViewComponent, TabComponent, CommonModule]
})
export class StationOverviewComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  stationSystems = this.navigationService.getStationSystems();
  aiCollapsed = false;

  ngOnInit(): void {
    this.navigationService.setCurrentTitle('Space Station Overview');
    this.navigationService.clearBreadcrumbs();
  }

  navigateToSystem(system: StationSystem): void {
    if (system.isActive) {
      this.router.navigate([system.route]);
    }
  }

  getSystemIconPath(system: StationSystem): string {
    const iconMap: Record<string, string> = {
      'mission-control': 'mission-control.png',
      'engineering': 'engineering.png',
      'medical-bay': 'medical-bay.png',
      'cloning-facility': 'cloning-facilities.png',
      'combat-simulator': 'combat-simulator.png',
      'research-lab': 'research-lab.png'
    };
    const filename = iconMap[system.id] || 'placeholder.png';
    return `assets/station-systems/${filename}`;
  }
}
