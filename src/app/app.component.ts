import { Component, OnInit, inject } from '@angular/core';
import { QuestStore } from './shared/services/quest.store';
import { ThemeStore } from './shared/services/theme.store';
import { Hero } from './features/hero/models/hero.model';
import { LogEntry } from './models/log-entry.model';
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
  hero: () => Hero;
  log: () => LogEntry[];
  
  private themeStore = inject(ThemeStore);

  constructor(public questStore: QuestStore) {
    // Access the signals from the NgRx store
    this.hero = this.questStore.hero;
    this.log = this.questStore.log;
  }

  ngOnInit(): void {
    // Initialize theme on app startup
    this.themeStore.initializeTheme();
  }

  embarkOnQuest(): void {
    this.questStore.embarkOnQuest();
  }
}
