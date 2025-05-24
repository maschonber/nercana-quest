import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';
import { QuestStepType } from '../models/quest.model';

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
}
