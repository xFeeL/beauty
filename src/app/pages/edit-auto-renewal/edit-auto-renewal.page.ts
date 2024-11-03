// src/app/pages/edit-auto-renewal/edit-auto-renewal.page.ts

import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-auto-renewal',
  templateUrl: './edit-auto-renewal.page.html',
  styleUrls: ['./edit-auto-renewal.page.scss'],
})
export class EditAutoRenewalPage implements OnInit {
  autoRenewalEnabled: boolean = false;
  smsAmount: number = 200;
  threshold: number = 10;
  isProcessing: boolean = false;

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    // Load current settings from the server or parent component
    this.loadCurrentSettings();
  }

  // Load the user's current auto-renewal settings
  loadCurrentSettings() {
    this.userService.getAutoRenewalSettings().subscribe(
      (data) => {
        this.autoRenewalEnabled = data.autoRenewalEnabled;
        this.smsAmount = Number(data.smsAmount);
        this.threshold = Number(data.threshold);
      },
      (err) => {
        console.error('Error loading settings:', err);
      }
    );
  }

  // Show confirmation alert before disabling auto-renewal
  async confirmDisableAutoRenewal() {
    const alert = await this.alertController.create({
      header: 'Επιβεβαίωση',
      message: 'Είστε βέβαιοι ότι θέλετε να απενεργοποιήσετε την αυτόματη ανανέωση SMS;',
      buttons: [
        {
          text: 'Ακύρωση',
          role: 'cancel'
        },
        {
          text: 'Απενεργοποίηση',
          handler: () => {
            this.disableAutoRenewal();
          }
        }
      ]
    });

    await alert.present();
  }

  // Method to disable auto-renewal
  // After successfully disabling auto-renewal
  disableAutoRenewal() {
    this.isProcessing = true;
    this.userService.disableAutoRenewal().subscribe(
      () => {
        this.autoRenewalEnabled = false;
        this.isProcessing = false;
        this.userService.presentToast('Η αυτόματη ανανέωση απενεργοποιήθηκε με επιτυχία.', 'success');
        this.modalController.dismiss({ success: true }); // Dismiss with success
      },
      (error) => {
        this.isProcessing = false;
        console.error('Error disabling auto-renewal:', error);
        this.userService.presentToast('Σφάλμα κατά την απενεργοποίηση της αυτόματης ανανέωσης. Παρακαλώ δοκιμάστε ξανά.', 'danger');
      }
    );
  }

  // After successfully saving settings
  saveSettings() {
    if (!this.isValidSettings()) {
      this.userService.presentToast('Το όριο ανεναέωσης δεν μπορεί να είναι μικρότερο του αριθμού SMS ανανέωσης.', 'warning');
      return;
    }

    const smsAmountNumber = Number(this.smsAmount);
    const thresholdNumber = Number(this.threshold);

    this.isProcessing = true;

    this.userService
      .updateAutoRenewalSettings(this.autoRenewalEnabled, smsAmountNumber, thresholdNumber)
      .subscribe(
        () => {
          this.isProcessing = false;
          this.userService.presentToast('Οι ρυθμίσεις αποθηκεύτηκαν επιτυχώς.', 'success');
          this.modalController.dismiss({ success: true }); // Dismiss with success
        },
        (error) => {
          this.isProcessing = false;
          console.error('Error saving settings:', error);
          this.userService.presentToast('Σφάλμα κατά την αποθήκευση των ρυθμίσεων. Παρακαλώ δοκιμάστε ξανά.', 'danger');
        }
      );
  }

  // When closing without saving
  closeModal() {
    this.modalController.dismiss({ success: false });
  }

  // Validate settings before saving
  isValidSettings(): boolean {
    return this.smsAmount > 0 && this.threshold > 0 && this.threshold < this.smsAmount;
  }



  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Προσοχή',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
