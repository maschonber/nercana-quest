import { Component } from '@angular/core';
import { StandardViewComponent } from '../shared/components/standard-view.component';

@Component({
  selector: 'app-example-page',
  template: `
    <app-standard-view>
      <!-- Custom title for this page -->
      <h1 slot="title" class="page-title">Combat Arena</h1>
      
      <!-- Additional header action -->
      <button slot="header-actions" class="btn-secondary">
        Settings
      </button>
      
      <!-- Combat log on the left -->
      <div slot="main-left" class="combat-log">
        <h2>Combat Log</h2>
        <div class="log-entries">
          <p>Turn 1: Hero attacks for 15 damage</p>
          <p>Turn 2: Monster retaliates for 8 damage</p>
          <p>Turn 3: Hero uses special ability</p>
        </div>
      </div>
      
      <!-- Combat status on the right -->
      <div slot="main-right" class="combat-status">
        <h2>Battle Status</h2>
        <div class="combatant">
          <h3>Hero</h3>
          <div class="health-bar">
            <div class="health-fill" style="width: 75%"></div>
          </div>
          <p>HP: 75/100</p>
        </div>
        <div class="combatant">
          <h3>Ancient Slug</h3>
          <div class="health-bar">
            <div class="health-fill enemy" style="width: 40%"></div>
          </div>
          <p>HP: 40/100</p>
        </div>
      </div>
      
      <!-- Combat actions -->
      <div slot="floating-actions" class="combat-actions">
        <button class="action-btn attack">⚔️ Attack</button>
        <button class="action-btn defend">🛡️ Defend</button>
        <button class="action-btn special">✨ Special</button>
        <button class="action-btn flee">🏃 Flee</button>
      </div>
    </app-standard-view>
  `,
  styles: [`
    .page-title {
      color: var(--accent-secondary);
      font-size: 1.5rem;
      margin: 0;
    }
    
    .combat-log, .combat-status {
      background: var(--background-secondary);
      padding: 1rem;
      border-radius: 0.5rem;
      height: 100%;
    }
    
    .log-entries {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 300px;
      overflow-y: auto;
    }
    
    .combatant {
      margin-bottom: 1rem;
    }
    
    .health-bar {
      width: 100%;
      height: 20px;
      background: var(--background-primary);
      border-radius: 10px;
      overflow: hidden;
      margin: 0.5rem 0;
    }
    
    .health-fill {
      height: 100%;
      background: var(--accent-primary);
      transition: width 0.3s ease;
    }
    
    .health-fill.enemy {
      background: var(--accent-secondary);
    }
    
    .combat-actions {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      justify-content: center;
    }
    
    .action-btn {
      flex: 1;
      max-width: 120px;
      padding: 0.75rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--accent-primary);
      color: white;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
    
    .action-btn:hover {
      background: var(--accent-primary-hover);
    }
  `],
  standalone: true,
  imports: [StandardViewComponent]
})
export class ExamplePageComponent {
  // This demonstrates how to create a new page using StandardViewComponent
  // with completely different content while maintaining the same layout structure
}
