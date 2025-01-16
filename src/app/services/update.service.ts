// src/app/services/update.service.ts

import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Platform, AlertController, ToastController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private currentVersion: string = '1.0.0'; // Default version; will be fetched dynamically

  constructor(
    private userService: UserService,
    private platform: Platform,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  /**
   * Initialize the UpdateService by fetching the current app version.
   */
  async initialize() {
    try {
      const info = await App.getInfo();
      this.currentVersion = info.version;
      console.log(`Current app version: ${this.currentVersion}`);
    } catch (error) {
      console.error('Error fetching app info:', error);
      this.currentVersion = '0.0.0';
    }
  }

  /**
   * Check for app updates by communicating with the backend.
   */
  async checkForUpdates() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Not a native platform. Skipping update check.');
      return;
    }
    let platform = ""
    if (!this.platform.is('android')) {
      platform = "iOS"
    } else {
      platform = "android"

    }

    this.userService.checkAppVersion(this.currentVersion, platform).subscribe(
      async (response) => {
        if (response.newVersionAvailable) {
          const latestVersion = response.latestVersion;
          const downloadUrl = response.downloadUrl;
          const mandatoryUpdate = response.mandatoryUpdate;
          const releaseNotes = response.releaseNotes || '';

          if (mandatoryUpdate) {
            await this.promptMandatoryUpdate(latestVersion, downloadUrl, releaseNotes, platform);
          } else {
            await this.promptOptionalUpdate(latestVersion, downloadUrl, releaseNotes, platform);
          }
        } else {
          console.log('The app is up-to-date.');
        }
      },
      async (error) => {
        console.error('Error during update check:', error);
        await this.showErrorToast('Unable to check for updates at this time.');
      }
    );
  }

  /**
   * Prompt the user for a mandatory update.
   */
  private async promptMandatoryUpdate(latestVersion: string, downloadUrl: string, releaseNotes: string, platform: string) {
    const alert = await this.alertController.create({
      header: 'Υποχρεωτικό Update',
      message: releaseNotes
        ? `${releaseNotes}<br><br>Μία νέα έκδοση (${latestVersion}) είναι διαθέσιμη και απαραίτητη για να συνεχίσετε να χρησιμοποιείτε την εφαρμογή.`
        : `Μία νέα έκδοση (${latestVersion}) είναι διαθέσιμη και απαραίτητη για να συνεχίσετε να χρησιμοποιείτε την εφαρμογή.`,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Update τώρα',
          handler: () => {
            if (platform = "android") {
              this.redirectToPlayStore(downloadUrl);

            } else {
              this.redirectToAppleStore(downloadUrl)
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Prompt the user for an optional update.
   */
  private async promptOptionalUpdate(latestVersion: string, downloadUrl: string, releaseNotes: string, platform: string) {
    const alert = await this.alertController.create({
      header: 'Update Available',
      message: releaseNotes
        ? `${releaseNotes}<br><br>A new version (${latestVersion}) is available. Would you like to update now?`
        : `A new version (${latestVersion}) is available. Would you like to update now?`,
      backdropDismiss: true,
      buttons: [
        {
          text: 'Later',
          role: 'cancel',
        },
        {
          text: 'Update Now',
          handler: () => {
            if (platform = "android") {
              this.redirectToPlayStore(downloadUrl);

            } else {
              this.redirectToAppleStore(downloadUrl)
            }
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Redirect the user to the Play Store to update the app.
   */
  private redirectToPlayStore(url: string) {
    const packageId = this.extractPackageId(url);
    if (!packageId) {
      console.error('Invalid Play Store URL:', url);
      this.showErrorToast('Unable to redirect to Play Store for updates.');
      return;
    }

    const intentUrl = `intent://details?id=${packageId}#Intent;scheme=market;package=com.android.vending;end`;
    const fallbackUrl = `https://play.google.com/store/apps/details?id=${packageId}`;

    // Attempt to open the Play Store app using the intent scheme
    window.open(intentUrl, '_system');

    // Fallback to opening the Play Store page in the browser after a short delay
    setTimeout(() => {
      window.open(fallbackUrl, '_system');
    }, 2000);
  }

  private redirectToAppleStore(url: string) {
    // Basic validation: Apple Store URL should start with itms-apps://
    if (!url.startsWith('itms-apps://')) {
      console.error('Invalid Apple Store URL:', url);
      this.showErrorToast('Unable to redirect to the Apple Store for updates.');
      return;
    }

    // Attempt to open the Apple Store app
    window.open(url, '_system');

    // Optional fallback: open the same store page in the browser after a brief delay
    setTimeout(() => {
      // Convert the "itms-apps://" URL to a regular HTTPS-based Apple Store URL
      // For example: itms-apps://apps.apple.com/app/id6739831765 --> https://apps.apple.com/app/id6739831765
      const fallbackUrl = url.replace('itms-apps://', 'https://');
      window.open(fallbackUrl, '_system');
    }, 2000);
  }


  /**
   * Extract the package ID from the Play Store URL.
   * This method ensures that only the package ID is extracted, ignoring any additional query parameters.
   */
  private extractPackageId(url: string): string | null {
    try {
      const parsedUrl = new URL(url);
      let idParam = parsedUrl.searchParams.get('id');
      if (idParam) {
        // Handle cases where 'id' parameter includes additional query parameters
        // e.g., id=com.fyx.beauty?timestamp=1234567890
        const questionMarkIndex = idParam.indexOf('?');
        if (questionMarkIndex !== -1) {
          idParam = idParam.substring(0, questionMarkIndex);
        }

        // Validate package ID format (basic validation)
        const packageIdRegex = /^[a-zA-Z0-9_.]+$/;
        if (packageIdRegex.test(idParam)) {
          return idParam;
        } else {
          console.error('Invalid package ID format:', idParam);
          return null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing Play Store URL:', error);
      return null;
    }
  }

  /**
   * Show an error toast message.
   */
  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }
}
