import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StandardViewComponent } from '../../../shared/components/standard-view.component';
import { NavigationService, StationSystem } from '../../../shared/services/navigation.service';

@Component({
  selector: 'app-station-overview',
  templateUrl: './station-overview.component.html',
  styleUrl: './station-overview.component.scss',
  standalone: true,  imports: [StandardViewComponent]
})
export class StationOverviewComponent implements OnInit {
  private readonly navigationService = inject(NavigationService);
  private readonly router = inject(Router);

  stationSystems = this.navigationService.getStationSystems();

  ngOnInit(): void {
    // Set the page title for the station overview
    this.navigationService.setCurrentTitle('Nercana Station');
    // Clear breadcrumbs for the station overview (it's the root)
    this.navigationService.clearBreadcrumbs();
  }

  navigateToSystem(system: StationSystem): void {
    if (system.isActive) {
      this.router.navigate([system.route]);
    }
  }
}
