import { Component, OnInit, inject } from '@angular/core';
import { StandardViewComponent } from '../../../shared/components/standard-view.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { ThemeStore } from '../../../shared/services/theme.store';
import { MissionScanActionsComponent } from './mission-scan-actions.component';
import { MissionControlOverviewComponent } from './mission-control-overview.component';

@Component({
  selector: 'app-mission-control',
  templateUrl: './mission-control.component.html',
  styleUrl: './mission-control.component.scss',
  standalone: true,
  imports: [
    StandardViewComponent,
    MissionScanActionsComponent,
    MissionControlOverviewComponent
  ]
})
export class MissionControlComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);
  private readonly navigationService = inject(NavigationService);

  ngOnInit(): void {
    // Initialize theme on component startup
    this.themeStore.initializeTheme();
    
    // Set the page title for mission control
    this.navigationService.setCurrentTitle('Mission Control');
    
    // Set breadcrumbs for mission control
    this.navigationService.setBreadcrumbs([
      { label: 'Station Overview', route: '/' },
      { label: 'Mission Control' }
    ]);
  }
}
