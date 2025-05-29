import { Injectable, inject, computed } from '@angular/core';
import { QuestStore } from '../../../shared/stores/quest.store';
import { LogStore } from '../../../shared/stores/log.store';
import { LogEntry } from '../../../models/log-entry.model';

/**
 * Facade service for quest-related operations
 * Provides a clean API for quest management and log access
 */
@Injectable({
  providedIn: 'root'
})
export class QuestFacadeService {
  private readonly questStore = inject(QuestStore);
  private readonly logStore = inject(LogStore);

  // Expose quest state
  questInProgress = this.questStore.questInProgress;

  // Expose log state
  log = this.logStore.entries;

  // Computed values
  recentLogEntries = computed(() => this.logStore.getRecentEntries(15));

  hasLogEntries = computed(() => this.log().length > 0);

  // Quest management methods
  embarkOnQuest(): void {
    this.questStore.embarkOnQuest();
  }

  // Log management methods
  addLogEntry(entry: LogEntry): void {
    this.logStore.addEntry(entry);
  }

  clearLog(): void {
    this.logStore.clearLog();
  }
}
