import { Component } from '@angular/core';
import { QuestStore } from './shared/services/quest.store';
import { Hero } from './features/hero/models/hero.model';
import { LogEntry } from './models/log-entry.model';
import { HeroDetailsComponent } from './features/hero/components/hero-details.component';
import { QuestLogComponent } from './features/quest/components/quest-log.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  standalone: true,
  imports: [HeroDetailsComponent, QuestLogComponent]
})
export class AppComponent {
  hero: () => Hero;
  log: () => LogEntry[];

  constructor(public questStore: QuestStore) {
    // Access the signals from the NgRx store
    this.hero = this.questStore.hero;
    this.log = this.questStore.log;
  }

  embarkOnQuest(): void {
    this.questStore.embarkOnQuest();
  }
}
