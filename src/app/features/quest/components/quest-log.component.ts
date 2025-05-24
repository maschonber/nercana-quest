import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';
import { QuestStepType } from '../models/quest.model';
import { CombatOutcome } from '../models/combat.model';

@Component({
  selector: 'app-quest-log',
  templateUrl: './quest-log.component.html',
  styleUrl: './quest-log.component.scss',
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class QuestLogComponent implements OnChanges {
  @Input() log!: LogEntry[];
  
  // Track the previous log length to identify new entries
  private previousLogLength: number = 0;
  private newEntryTimestamp: Date | null = null;
  
  // Track expanded combat details
  expandedCombatEntries: Set<number> = new Set<number>();
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['log'] && this.log && this.log.length > this.previousLogLength) {
      // New entries are added at the beginning of the array
      // Mark the timestamp of the newest entry
      if (this.log.length > 0) {
        this.newEntryTimestamp = this.log[0].timestamp;
        
        // Scroll to the top to show the new entry
        setTimeout(() => {
          const logContainer = document.querySelector('.log-view ul');
          if (logContainer) {
            logContainer.scrollTop = 0;
          }
        }, 100);
        
        // Reset new entry indicator after 3 seconds
        setTimeout(() => {
          this.newEntryTimestamp = null;
          this.previousLogLength = this.log.length;
        }, 3000);
      }
    } else {
      this.previousLogLength = this.log ? this.log.length : 0;
    }
  }
  
  // Check if an entry is new based on its timestamp
  isNewEntry(index: number): boolean {
    if (!this.newEntryTimestamp || !this.log[index]) return false;
    return this.log[index].timestamp.getTime() === this.newEntryTimestamp.getTime();
  }
  
  // Get the appropriate icon for each step type
  getStepIcon(stepType?: QuestStepType): string {
    if (!stepType) return '';
    
    switch (stepType) {
      case QuestStepType.EXPLORATION:
        return '🧭';
      case QuestStepType.ENCOUNTER:
        return '⚔️';
      case QuestStepType.TREASURE:
        return '💰';
      default:
        return '';
    }
  }
  
  // Check if a log entry has any rewards to display
  hasRewards(entry: LogEntry): boolean {
    return (entry.experienceGained !== undefined && entry.experienceGained > 0) || 
           (entry.goldGained !== undefined && entry.goldGained > 0);
  }

  // Get experience gained from a log entry
  getExperienceFromEntry(entry: LogEntry): number {
    return entry.experienceGained || 0;
  }

  // Get gold gained from a log entry
  getGoldFromEntry(entry: LogEntry): number {
    return entry.goldGained || 0;
  }
  
  // Toggle expanded combat details
  toggleCombatDetails(index: number): void {
    if (this.expandedCombatEntries.has(index)) {
      this.expandedCombatEntries.delete(index);
    } else {
      this.expandedCombatEntries.add(index);
    }
  }
  
  // Check if combat details are expanded
  isCombatExpanded(index: number): boolean {
    return this.expandedCombatEntries.has(index);
  }
  
  // Get combat outcome text
  getCombatOutcomeText(outcome: CombatOutcome): string {
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return 'Victory!';
      case CombatOutcome.HERO_DEFEAT:
        return 'Defeat';
      case CombatOutcome.HERO_FLED:
        return 'Fled';
      default:
        return 'Unknown';
    }
  }
  
  // Get combat outcome CSS class
  getCombatOutcomeClass(outcome: CombatOutcome): string {
    switch (outcome) {
      case CombatOutcome.HERO_VICTORY:
        return 'outcome-victory';
      case CombatOutcome.HERO_DEFEAT:
        return 'outcome-defeat';
      case CombatOutcome.HERO_FLED:
        return 'outcome-fled';
      default:
        return '';
    }
  }
  
  // Get health percentage for health bars
  getHealthPercentage(current: number, max: number): number {
    return Math.max(0, Math.min(100, (current / max) * 100));
  }
}
