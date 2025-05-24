import { Injectable, computed } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

export interface ThemeState {
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  isDarkMode: false
};

@Injectable({
  providedIn: 'root'
})
export class ThemeStore extends signalStore(
  withState(initialState),
  withMethods((store) => ({
    /**
     * Toggles between light and dark mode
     */
    toggleTheme(): void {
      const currentMode = store.isDarkMode();
      patchState(store, { isDarkMode: !currentMode });
      
      // Persist theme preference to localStorage
      localStorage.setItem('nercana-theme', !currentMode ? 'dark' : 'light');
      
      // Apply theme class to body
      this.applyThemeToBody(!currentMode);
    },

    /**
     * Sets the theme to dark or light mode
     */
    setTheme(isDark: boolean): void {
      patchState(store, { isDarkMode: isDark });
      
      // Persist theme preference to localStorage
      localStorage.setItem('nercana-theme', isDark ? 'dark' : 'light');
      
      // Apply theme class to body
      this.applyThemeToBody(isDark);
    },

    /**
     * Initializes theme from localStorage or system preference
     */
    initializeTheme(): void {
      const savedTheme = localStorage.getItem('nercana-theme');
      let isDark = false;

      if (savedTheme) {
        isDark = savedTheme === 'dark';
      } else {
        // Check system preference
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      this.setTheme(isDark);
    },

    /**
     * Applies theme class to document body
     */
    applyThemeToBody(isDark: boolean): void {
      if (isDark) {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    }
  }))
) {}
