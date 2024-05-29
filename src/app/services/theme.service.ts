import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeDark = new BehaviorSubject<boolean>(false);
  public themeDark$ = this.themeDark.asObservable();

  constructor() {
    this.loadThemePreference();
   }

   toggleDarkTheme(shouldAdd: boolean): void {
    
    document.body.classList.toggle('dark', shouldAdd);
    localStorage.setItem('darkMode', shouldAdd ? 'true' : 'false');
    

    this.themeDark.next(shouldAdd);
  }

  private loadThemePreference(): void {
    const themePreference = localStorage.getItem('darkMode');
    const isDarkMode = themePreference === 'true';
    this.toggleDarkTheme(isDarkMode);
  }
}
