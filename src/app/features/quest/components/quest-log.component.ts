import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';
import { QuestStepType } from '../models/quest.model';
import { CombatDetailsComponent } from './combat-details/combat-details.component';

@Component({
  selector: 'app-quest-log',
  templateUrl: './quest-log.component.html',
  styleUrl: './quest-log.component.scss',
  standalone: true,
  imports: [CommonModule, DatePipe, CombatDetailsComponent]
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
  
  // Check if a log entry has expandable details
  hasExpandableDetails(entry: LogEntry): boolean {
    return entry.stepType === 'encounter' && !!entry.combatResult;
  }

  // Toggle expanded details for any entry (renamed from toggleCombatDetails)
  toggleEntryDetails(index: number): void {
    if (this.expandedCombatEntries.has(index)) {
      this.expandedCombatEntries.delete(index);
    } else {
      this.expandedCombatEntries.add(index);
    }
  }
    // Check if entry details are expanded (renamed from isCombatExpanded)
  isEntryExpanded(index: number): boolean {
    return this.expandedCombatEntries.has(index);
  }

  // Add a method to format messages with monster name highlighting
  formatMessageWithMonsterHighlight(entry: LogEntry): string {
    if (!entry.message) return '';
    
    let message = entry.message;
    
    // List of monster names to highlight (should match monster configuration)
    const monsterNames = [
      'Goblin', 'Orc', 'Troll', 'Dragon', 'Skeleton', 'Zombie', 'Vampire', 'Werewolf',
      'Giant Spider', 'Cave Bear', 'Wild Boar', 'Dire Wolf', 'Ancient Dragon', 'Fire Elemental',
      'Ice Golem', 'Shadow Wraith', 'Bandit', 'Dark Mage'
    ];
    
    // First, check if this is an encounter entry and try to get monster name from the entry itself
    if (entry.stepType === 'encounter' && entry.monster?.name) {
      const monsterName = entry.monster.name;
      const regex = new RegExp(`\\b${monsterName}\\b`, 'gi');
      message = message.replace(regex, (match) => `<span class="monster-name-highlight">${match}</span>`);
    }
    
    // Then apply general monster name highlighting for any remaining monster names
    // But avoid double-highlighting by checking if the text is already wrapped
    monsterNames.forEach(monsterName => {
      const regex = new RegExp(`\\b${monsterName}\\b(?![^<]*<\/span>)`, 'gi');
      message = message.replace(regex, (match) => `<span class="monster-name-highlight">${match}</span>`);
    });
    
    return message;
  }
}
