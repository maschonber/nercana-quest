import { Component } from '@angular/core';

@Component({
  selector: 'app-standard-view',
  templateUrl: './standard-view.component.html',
  styleUrls: ['./standard-view.component.scss'],
  standalone: true,
  imports: []
})
export class StandardViewComponent {
  // This component provides the standard layout structure
  // with content projection slots for flexible content
}
