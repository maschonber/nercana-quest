import { Component, OnInit, inject } from '@angular/core';
import { StandardViewComponent } from '../../../shared/components/standard-view.component';
import { NavigationService } from '../../../shared/services/navigation.service';
import { ThemeStore } from '../../../shared/services/theme.store';
import { QuestFacadeService } from '../../quest/services/quest-facade.service';
import { HeroDetailsComponent } from '../../hero/components/hero-details.component';
import { HeroActionsComponent } from '../../hero/components/hero-actions.component';
import { QuestLogComponent } from '../../quest/components/quest-log.component';

@Component({
  selector: 'app-mission-control',
  templateUrl: './mission-control.component.html',
  styleUrl: './mission-control.component.scss',
  standalone: true,  imports: [
    StandardViewComponent,
    HeroDetailsComponent,
    HeroActionsComponent,
    QuestLogComponent
  ]
})
export class MissionControlComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);
  private readonly questFacade = inject(QuestFacadeService);
  private readonly navigationService = inject(NavigationService);

  // Expose log for quest-log component
  log = this.questFacade.log;
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
