import { Component, ContentChildren, QueryList, AfterContentInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-tab',
  template: `
    <div class="tab-content" [style.display]="active ? 'block' : 'none'">
      <ng-content></ng-content>
    </div>
  `,
  standalone: true
})
export class TabComponent {
  @Input() id!: string;
  @Input() label!: string;
  @Input() disabled: boolean = false;
  @Input() active: boolean = false;
}

@Component({
  selector: 'app-tab-view',
  template: `
    <div class="tab-view">
      <!-- Tab headers -->
      <div class="tab-header">
        <button
          *ngFor="let tab of tabs"
          class="tab-button"
          [class.active]="activeTabId === tab.id"
          [disabled]="tab.disabled"
          (click)="selectTab(tab.id)"
          type="button">
          {{ tab.label }}
        </button>
      </div>
      
      <!-- Tab content -->
      <div class="tab-content-container">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .tab-view {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    
    .tab-header {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      background: var(--background-secondary);
      padding: 0;
      margin-bottom: 1rem;
      border-radius: 0.5rem 0.5rem 0 0;
    }
    
    .tab-button {
      background: none;
      border: none;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      position: relative;
    }
    
    .tab-button:first-child {
      border-radius: 0.5rem 0 0 0;
    }
    
    .tab-button:last-child {
      border-radius: 0 0.5rem 0 0;
    }
    
    .tab-button:hover:not(:disabled) {
      background: var(--background-tertiary);
      color: var(--text-primary);
    }
    
    .tab-button.active {
      color: var(--accent-primary);
      background: var(--background-primary);
      border-bottom-color: var(--accent-primary);
    }
    
    .tab-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .tab-content-container {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    
    .tab-content-container :ng-deep .tab-content {
      height: 100%;
      overflow: auto;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class TabViewComponent implements AfterContentInit {
  @Input() activeTabId: string = '';
  @ContentChildren(TabComponent) tabComponents!: QueryList<TabComponent>;
  
  tabs: TabItem[] = [];

  ngAfterContentInit() {
    // Extract tab information from child components
    this.tabs = this.tabComponents.map(tab => ({
      id: tab.id,
      label: tab.label,
      disabled: tab.disabled
    }));
    
    // Set first tab as active if none specified
    if (!this.activeTabId && this.tabs.length > 0) {
      this.activeTabId = this.tabs[0].id;
    }
    
    this.updateActiveTab();
  }
  
  selectTab(tabId: string) {
    this.activeTabId = tabId;
    this.updateActiveTab();
  }
  
  private updateActiveTab() {
    this.tabComponents.forEach(tab => {
      tab.active = tab.id === this.activeTabId;
    });
  }
}
