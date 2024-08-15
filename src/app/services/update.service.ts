import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoadingController, ToastController } from '@ionic/angular';
import { CapacitorUpdater } from '@capgo/capacitor-updater'; // Correct import
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class UpdateService {
  private currentVersion = '';

  constructor(
    private http: HttpClient,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private userService: UserService
  ) {}

  async initialize() {
    this.currentVersion = '1.0.13';
  }

  async checkForUpdates() {
  
    try {
      // Check for updates via UserService
      await this.checkForBackendUpdates();
    } catch (error) {
      await this.showErrorToast('Error checking for updates');
    }
  }

  private checkForBackendUpdates(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.userService
        .checkForUpdates(this.currentVersion)
        .pipe(catchError((error) => this.handleError(error)))
        .subscribe(
          async (response: any) => {
            if (response.newVersionAvailable) {
              const loading = await this.loadingController.create({
                message: 'Ενημέρωση σε εξέλιξη...',
              });
              await loading.present();

              try {
                // Download the update
                const data = await CapacitorUpdater.download({
                  version: response.latestVersion,
                  url: response.downloadUrl,
                });


                if (data ) {
                  // Verify checksum or other integrity checks here if necessary

                  // Apply the update
                  await CapacitorUpdater.set(data);

                  // Update the current version after successful apply
                  this.currentVersion = response.latestVersion;
                
                } else {
                  throw new Error('Download data is invalid or incomplete');
                }
              } catch (error) {
                await this.showErrorToast('Error applying update');
              } finally {
                await loading.dismiss();
              }

              resolve();
            } else {
              resolve();
            }
          },
          (error) => {
            reject(error);
          }
        );
    });
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
    });
    toast.present();
  }

  private handleError(error: any): Observable<never> {
    return throwError('Something bad happened; please try again later.');
  }
}
