import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from '../models/log-entry.model';

@Component({
  selector: 'app-quest-log',
  template: `
    <div class="log-view">
      <h2>Quest Log</h2>
      <ul>
        <li *ngFor="let entry of log">
          <span [class.success]="entry.success" [class.fail]="!entry.success">
            [{{ entry.timestamp | date:'shortTime' }}] {{ entry.message }}
          </span>
        </li>
      </ul>
    </div>
  `,
  styleUrl: './quest-log.component.scss',
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class QuestLogComponent {
  @Input() log!: LogEntry[];
}
