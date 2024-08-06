// src/app/services/update.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { Filesystem, FilesystemDirectory } from '@capacitor/filesystem';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import * as JSZip from 'jszip';



@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private currentVersion="";

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController,
  ) {}

  async initialize() {
    this.currentVersion = "1.0.0"
  }

  async checkForUpdates() {
    try {
      // Check for app update from Play Store
      const playStoreVersion = await this.getPlayStoreVersion();

      if (this.isNewVersionAvailable(this.currentVersion, playStoreVersion)) {
        await this.promptUserToUpdate();
        return;
      }

      // Check for updates from Google Cloud Storage
      const response: any = await this.http.get('https://storage.googleapis.com/public-fyx/updates/version.json').toPromise();

      if (response.version !== this.currentVersion) {
        const loading = await this.loadingController.create({
          message: 'Downloading update...',
        });
        await loading.present();
        await this.downloadUpdate(response.url);
        await loading.dismiss();
        CapacitorUpdater.reload();
      } else {
        console.log('No updates available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      await this.showErrorToast('Error checking for updates');
    }
  }

  private async getPlayStoreVersion(): Promise<string> {
    try {
      const response = await this.http.get('https://play.google.com/store/apps/details?id=com.fyx.beauty&hl=en&gl=US', { responseType: 'text' }).toPromise();
      const parser = new DOMParser();
      const doc = parser.parseFromString(response as string, 'text/html');
  
      // Select the appropriate element for version info
      const versionElement = doc.querySelector('.htlgb');
      
      // Use optional chaining and nullish coalescing to handle potential null values
      const version = versionElement?.textContent?.trim() ?? this.currentVersion;
  
      if (version === this.currentVersion) {
        console.warn('Version element not found or version text is empty');
      }
  
      return version;
    } catch (error) {
      console.error('Error fetching Play Store version:', error);
      return this.currentVersion; // Return current version if there's an error
    }
  }
  
  

  private isNewVersionAvailable(currentVersion: string, playStoreVersion: string): boolean {
    return currentVersion !== playStoreVersion;
  }

  private async promptUserToUpdate() {
    const alert = await this.alertController.create({
      header: 'Update Available',
      message: 'A new version is available on the Play Store. Please update to continue.',
      buttons: [
        {
          text: 'Update Now',
          handler: () => {
            window.open('https://play.google.com/store/apps/details?id=com.fyx.beauty', '_system');
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  private async downloadUpdate(url: string) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64String = dataUrl.split(',')[1];

        await Filesystem.writeFile({
          path: 'update.zip',
          data: base64String,
          directory: FilesystemDirectory.Data,
        });

        await this.unzipUpdate();
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error downloading update:', error);
      await this.showErrorToast('Error downloading update');
    }
  }

  private async unzipUpdate() {
    const zip = new JSZip();
    const content = await Filesystem.readFile({ path: 'update.zip', directory: FilesystemDirectory.Data });
    const zipContent = await zip.loadAsync(content.data, { base64: true });

    for (const filename in zipContent.files) {
      if (zipContent.files[filename].dir) {
        await Filesystem.mkdir({ path: filename, directory: FilesystemDirectory.Data, recursive: true });
      } else {
        const fileContent = await zipContent.files[filename].async('base64');
        await Filesystem.writeFile({
          path: filename,
          data: fileContent,
          directory: FilesystemDirectory.Data,
        });
      }
    }
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }
}