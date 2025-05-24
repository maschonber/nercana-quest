import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { LogEntry } from '../../../models/log-entry.model';

@Component({
  selector: 'app-quest-log',
  templateUrl: './quest-log.component.html',
  styleUrl: './quest-log.component.scss',
  standalone: true,
  imports: [CommonModule, DatePipe]
})
export class QuestLogComponent {
  @Input() log!: LogEntry[];
}
