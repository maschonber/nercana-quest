import { Component, OnInit, inject } from '@angular/core';
import { ThemeStore } from './shared/services/theme.store';
import { QuestFacadeService } from './features/quest/services/quest-facade.service';
import { HeroDetailsComponent } from './features/hero/components/hero-details.component';
import { QuestLogComponent } from './features/quest/components/quest-log.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [HeroDetailsComponent, QuestLogComponent, ThemeToggleComponent]
})
export class AppComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);
  private readonly questFacade = inject(QuestFacadeService);

  // Expose log for quest-log component
  log = this.questFacade.log;

  ngOnInit(): void {
    // Initialize theme on app startup
    this.themeStore.initializeTheme();
  }

  embarkOnQuest(): void {
    this.questFacade.embarkOnQuest();
  }
}
