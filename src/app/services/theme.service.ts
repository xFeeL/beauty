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
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    console.log('Initial prefers-color-scheme matches:', prefersDark.matches);

    // Use system preference first
    this.toggleDarkTheme(prefersDark.matches);

    // Override with local storage preference if it exists
   

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (event) => {
      console.log('prefers-color-scheme changed:', event.matches);
      const userPreference = localStorage.getItem('darkMode');
      if (!userPreference) {
        this.toggleDarkTheme(event.matches);
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
    console.log('Dark mode set to:', shouldAdd);
  }
}
