import { Component } from '@angular/core';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ResourceDisplayComponent } from './resource-display.component';

@Component({
  selector: 'app-standard-view',
  templateUrl: './standard-view.component.html',
  styleUrls: ['./standard-view.component.scss'],
  standalone: true,
  imports: [
    ThemeToggleComponent,
    ResourceDisplayComponent
  ]
})
export class StandardViewComponent {
  // This component provides the standard layout structure
  // with content projection slots for flexible content
}
