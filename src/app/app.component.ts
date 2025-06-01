import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeStore } from './shared/services/theme.store';
import { NavigationService } from './shared/services/navigation.service';
import { BreadcrumbComponent } from './shared/components/breadcrumb.component';
import { ResourceDisplayComponent } from './shared/components/resource-display.component';
import { ThemeToggleComponent } from './shared/components/theme-toggle.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',  standalone: true,
  imports: [
    RouterOutlet,
    BreadcrumbComponent,
    ResourceDisplayComponent,
    ThemeToggleComponent
  ]
})
export class AppComponent implements OnInit {
  private readonly themeStore = inject(ThemeStore);
  private readonly navigationService = inject(NavigationService);

  currentTitle = this.navigationService.currentTitle;
  breadcrumbs = this.navigationService.breadcrumbs;

  ngOnInit(): void {
    // Initialize theme on app startup
    this.themeStore.initializeTheme();
  }
}
