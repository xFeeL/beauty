import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeDark = new BehaviorSubject<boolean>(false);
  public themeDark$ = this.themeDark.asObservable();

  constructor() {
    this.initializeTheme();
  }

  initializeTheme(): void {
    const themePreference = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (themePreference) {
      this.toggleDarkTheme(themePreference === 'true');
    } else {
      this.toggleDarkTheme(prefersDark.matches);
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => {
      const userPreference = localStorage.getItem('darkMode');
      if (!userPreference) {
        this.toggleDarkTheme(mediaQuery.matches);
      }
    });
  }

  enableDarkMode(): void {
    this.toggleDarkTheme(true);
  }

  enableLightMode(): void {
    this.toggleDarkTheme(false);
  }

  toggleDarkTheme(shouldAdd: boolean): void {
    document.body.classList.toggle('dark', shouldAdd);
    localStorage.setItem('darkMode', shouldAdd ? 'true' : 'false');
    this.themeDark.next(shouldAdd);
  }
}
