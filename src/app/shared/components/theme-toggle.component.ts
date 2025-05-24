import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeStore } from '../services/theme.store';

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
  standalone: true,
  imports: [CommonModule]
})
export class ThemeToggleComponent {
  private readonly themeStore = inject(ThemeStore);

  // Access theme state
  isDarkMode = this.themeStore.isDarkMode;

  /**
   * Toggles between light and dark theme
   */
  onToggleTheme(): void {
    this.themeStore.toggleTheme();
  }
}
