import 'hammerjs';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => {
    // Register Angular service worker (ngsw-worker.js) for PWA functionality
    if ('serviceWorker' in navigator && environment.production) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(registration => {
          console.log('Angular Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('Angular Service Worker registration failed:', err);
        });
    }

    // Register OneSignal service worker if it's a web platform and production environment
    if ('serviceWorker' in navigator && environment.production && Capacitor.getPlatform() === 'web') {
      navigator.serviceWorker.register('/OneSignal/OneSignalSDKWorker.js') 
        .then(registration => {
          console.log('OneSignal Service Worker registered with scope:', registration.scope);
        })
        .catch(err => {
          console.error('OneSignal Service Worker registration failed:', err);
        });
    }

    // Notify app ready to CapacitorUpdater if on a native platform (iOS/Android)
    const platform = Capacitor.getPlatform();
    if (platform === 'ios' || platform === 'android') {
      CapacitorUpdater.notifyAppReady()
        .then(() => {
          console.log('App ready notified to CapacitorUpdater.');
        })
        .catch(err => {
          console.error('Error notifying app ready:', err);
        });
    } else {
      console.log('Running on web platform; skipping CapacitorUpdater.notifyAppReady().');
    }
  })
  .catch(err => console.error('Angular bootstrap error:', err));
