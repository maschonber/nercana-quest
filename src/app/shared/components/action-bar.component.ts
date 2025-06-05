import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-action-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="action-bar" [class.visible]="visible">
      <div class="action-bar-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './action-bar.component.scss'
})
export class ActionBarComponent {
  @Input() visible: boolean = true;
}