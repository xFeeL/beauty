import { trigger, state, style, transition, animate } from "@angular/animations";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { AlertController, ModalController, ToastController } from "@ionic/angular";
import { UserService } from "src/app/services/user.service";
import { AddScheduleExceptionPage } from "../add-schedule-exception/add-schedule-exception.page";
import { OverlayEventDetail } from '@ionic/core';
@Component({
  selector: 'app-closures',
  templateUrl: './closures.page.html',
  styleUrls: ['./closures.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class ClosuresPage implements OnInit {
  hours: string[] = [];
  @ViewChild('mySelect') mySelect!: any; // Adjusted to 'any' to avoid Angular Material dependency
  scheduleExceptions: any[] = [];
  addedExceptions: boolean = false;
  changesHaveBeenMade: boolean = false; // Track unsaved changes
  constructor(
    private alertController: AlertController,
    private modalController: ModalController,
    private userService: UserService,
    private toastController: ToastController,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize hours in half-hour increments
    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));
  }

  ngOnInit() {
    // Load exceptions when the component initializes
    this.loadExceptions();
  }

  /**
   * Loads schedule exceptions from the API and formats them for display.
   */
   loadExceptions(objectId: string | null = null) {
    this.userService.getScheduledExceptions(objectId).subscribe(
      (data: any[]) => {
        // Map the received exceptions to a format usable by the UI
        this.scheduleExceptions = data.map((exception: any) => this.formatException(exception));
        this.cdr.markForCheck(); // Notify Angular of the changes
      },
      (err: any) => {
        console.error('Error fetching exceptions:', err);
        this.userService.presentToast('Σφάλμα κατά τη φόρτωση των εξαιρέσεων.', 'danger');
      }
    );
  }
  




  /**
   * Formats an exception range into a display-friendly object.
   *
   * @param exception - The exception object from the API.
   * @returns A formatted exception object.
   */
  private formatException(exception: any): any {
    const startDate = new Date(exception.startDatetime);
    const endDate = new Date(exception.endDatetime);
  
    const formattedStartDate = this.formatDate(startDate);
    const formattedEndDate = this.formatDate(endDate);
  
    const formattedStartTime = this.formatTime(startDate);
    const formattedEndTime = this.formatTime(endDate);
  
    const formatted = `${formattedStartDate} από ${formattedStartTime} έως ${formattedEndDate} ${formattedEndTime}`;
  
    // Determine the status based on 'isAvailable'
    const status = exception.available ? 'Ανοιχτό' : 'Κλειστό';
  
    // Determine the repeat property
    const repeat = exception.repeatable ? 'Επαναλαμβανόμενη' : 'Μία φορά';
  
    return {
      formatted,
      status,
      repeat,
      original: exception, // Keep the original exception object for editing or deleting
    };
  }
  
  
  

  /**
   * Formats a Date object into a date string.
   *
   * @param date - The Date object.
   * @returns A formatted date string in 'DD/MM/YYYY'.
   */
  private formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Formats a Date object into a time string.
   *
   * @param date - The Date object.
   * @returns A formatted time string in 'HH:mm'.
   */
  private formatTime(date: Date): string {
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    return `${hours}:${minutes}`;
  }


  
  async openAddExceptionModal() {
    const modal = await this.modalController.create({
      component: AddScheduleExceptionPage,
      componentProps: {
        objectId: null,
      },
    });
  
    modal.onDidDismiss().then((result: OverlayEventDetail<any>) => {
      if (result.data) {
        const newException = {
          objectId: null,
          startDatetime: result.data.start,
          endDatetime: result.data.end,
          available: result.data.isAvailable,
          repeatable: result.data.isRepeatable,
          safeToSave: false,  // initial call does not override overlap check
          cancelAllFutureOverlappingAppointments: false
        };
  
        this.userService.createException(newException).subscribe(
          (response: any) => {
            this.scheduleExceptions.push(this.formatException(response));
            this.userService.presentToast('Η εξαίρεση δημιουργήθηκε επιτυχώς.', 'success');
            this.cdr.markForCheck();
            this.changesHaveBeenMade = true;
          },
          (error: any) => {
            if (error.status === 406 && error.error.overlaps) {
              // Present alert options if overlapping appointments are detected.
              const overlappingDates = error.error.overlaps;
              this.presentAlertWithChoices(overlappingDates, newException);
            } else {
              console.error('Error creating exception:', error);
              this.userService.presentToast('Σφάλμα κατά τη δημιουργία της εξαίρεσης.', 'danger');
            }
          }
        );
      }
    });
  
    return await modal.present();
  }
  
  
  
  
  async editException(exception: any, index: number) {
    const modal = await this.modalController.create({
      component: AddScheduleExceptionPage,
      componentProps: {
        objectId: exception.original.objectId, // or pass null if it's a general exception
        firstDateTime: exception.original.startDatetime,
        endDateTime: exception.original.endDatetime,
        isAvailable: exception.original.available,
        isRepeatable: exception.original.repeatable // Pass current repeatable status
      },
    });
  
    modal.onDidDismiss().then((result: OverlayEventDetail<any>) => {
      if (result.data) {
        // Prepare the update payload, initially setting safeToSave false
        const payload = {
          id: exception.original.id,
          objectId: exception.original.objectId, // or result data if changed
          startDatetime: result.data.start,
          endDatetime: result.data.end,
          available: result.data.isAvailable,
          repeatable: result.data.isRepeatable,
          safeToSave: false, // initial flag - pre-check will decide
          cancelAllFutureOverlappedAppointments: false // default value
        };
  
        this.userService.updateException(payload).subscribe(
          (response: any) => {
            this.scheduleExceptions[index] = this.formatException(response);
            this.userService.presentToast('Η εξαίρεση ενημερώθηκε επιτυχώς.', 'success');
            this.cdr.markForCheck();
            this.changesHaveBeenMade = true;
          },
          (error: any) => {
            if (error.status === 406 && error.error.overlaps) {
              // If the backend returns an overlap conflict, prompt the user.
              const overlappingDates = error.error.overlaps;
              this.presentAlertWithChoicesForUpdate(overlappingDates, payload, index);
            } else {
              console.error('Error updating exception:', error);
              this.userService.presentToast('Σφάλμα κατά την ενημέρωση της εξαίρεσης.', 'danger');
            }
          }
        );
      }
    });
  
    return await modal.present();
  }
  
  /**
   * Presents an alert prompting the user how to handle overlapping appointments.
   */
  async presentAlertWithChoicesForUpdate(overlappingDates: string, payload: any, index: number) {
    const alert = await this.alertController.create({
      header: 'Προσοχή!',
      message: 'Υπάρχουν κρατήσεις στις ημερομηνίες: ' + overlappingDates + '. Επιθυμείτε να ακυρωθούν;',
      buttons: [
        {
          text: 'Ακύρωση Όλων',
          handler: () => {
            payload.safeToSave = true;
            payload.cancelAllFutureOverlappedAppointments = true;
            this.sendUpdateRequest(payload, index);
          }
        },
        {
          text: 'Παράβλεψη',
          handler: () => {
            payload.safeToSave = true;
            payload.cancelAllFutureOverlappedAppointments = false;
            this.sendUpdateRequest(payload, index);
          }
        },
        {
          text: 'Ακύρωση',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }
  
  /**
   * Helper method to retry the update request with updated flags.
   */
  sendUpdateRequest(payload: any, index: number) {
    this.userService.updateException(payload).subscribe(
      (response: any) => {
        this.scheduleExceptions[index] = this.formatException(response);
        this.userService.presentToast('Η εξαίρεση ενημερώθηκε επιτυχώς.', 'success');
        this.cdr.markForCheck();
        this.changesHaveBeenMade = true;
      },
      (error: any) => {
        console.error('Error updating exception with new flags:', error);
        this.userService.presentToast('Σφάλμα κατά την ενημέρωση της εξαίρεσης.', 'danger');
      }
    );
  }
  
  
  
  
  
  onDeleteException(index: number, event: Event) {
    event.stopPropagation(); // Prevents the ion-item's click event from firing
    this.deleteException(index); // Calls your existing delete logic
  }

  /**
   * Deletes an exception from the list with confirmation.
   *
   * @param index - The index of the exception to delete.
   */
  async confirmDeletion(index: number, event: Event) {
    event.stopPropagation(); // Prevents the ion-item's click event from firing
  
    const alert = await this.alertController.create({
      header: 'Επιβεβαίωση Διαγραφής',
      message: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτήν την εξαίρεση;',
      buttons: [
        {
          text: 'Ακύρωση',
          role: 'cancel',
        },
        {
          text: 'Διαγραφή',
          handler: () => {
            this.deleteException(index);
          }
        }
      ]
    });
  
    await alert.present();
  }
  
  async deleteException(index: number) {
    const exceptionId = this.scheduleExceptions[index].original.id;
  
    this.userService.deleteException(exceptionId).subscribe(
      () => {
        this.scheduleExceptions.splice(index, 1);
        this.userService.presentToast('Η εξαίρεση διαγράφηκε επιτυχώς.', 'success');
        this.cdr.markForCheck();
        this.changesHaveBeenMade = true; // Mark as having unsaved changes
      },
      (error: any) => {
        console.error('Error deleting exception:', error);
        this.userService.presentToast('Σφάλμα κατά τη διαγραφή της εξαίρεσης.', 'danger');
      }
    );
  }
  
  



  /**
   * Presents an alert with choices when overlapping appointments are detected.
   *
   * @param overlappingDates - A string listing the overlapping dates.
   */
  async presentAlertWithChoices(overlappingDates: string, exceptionPayload: any) {
    const alert = await this.alertController.create({
      header: 'Προσοχή!',
      message: 'Υπάρχουν κρατήσεις για τις εξής ημερομηνίες: ' + overlappingDates + '. Επιθυμείτε να ακυρωθούν;',
      buttons: [
        {
          text: 'Ακύρωση Όλων',
          handler: () => {
            // Set flags to cancel overlapping appointments and safe to save
            exceptionPayload.safeToSave = true;
            exceptionPayload.cancelAllFutureOverlappingAppointments = true;
            this.createExceptionWithPayload(exceptionPayload);
          }
        },
        {
          text: 'Παράβλεψη',
          handler: () => {
            // Set flags to safe-to-save without cancellation
            exceptionPayload.safeToSave = true;
            exceptionPayload.cancelAllFutureOverlappingAppointments = false;
            this.createExceptionWithPayload(exceptionPayload);
          }
        },
        {
          text: 'Ακύρωση',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }
  
  /**
   * Helper method to (re)attempt the createException API call with updated flags.
   */
  createExceptionWithPayload(payload: any) {
    this.userService.createException(payload).subscribe(
      (response: any) => {
        this.scheduleExceptions.push(this.formatException(response));
        this.userService.presentToast('Η εξαίρεση δημιουργήθηκε επιτυχώς.', 'success');
        this.cdr.markForCheck();
        this.changesHaveBeenMade = true;
      },
      (error: any) => {
        console.error('Error creating exception with updated flags:', error);
        this.userService.presentToast('Σφάλμα κατά τη δημιουργία της εξαίρεσης.', 'danger');
      }
    );
  }
  

  /**
   * Saves wrario data with options to cancel overlapping appointments.
   *
   * @param safeToSave - Whether it's safe to save.
   * @param cancelAllFutureOverlappedAppointments - Whether to cancel all overlapping appointments.
   */
  private saveAllWithOptions(safeToSave: boolean, cancelAllFutureOverlappedAppointments: boolean) {
    

    // Extract the original exception objects
    const updatedExceptions = this.scheduleExceptions.map(exc => exc.original);

    

    this.userService.saveWrario([],updatedExceptions, safeToSave, cancelAllFutureOverlappedAppointments).subscribe(
      (response: any) => {
        this.userService.presentToast('Όλες οι αλλαγές αποθηκεύτηκαν επιτυχώς.', 'success');
        this.modalController.dismiss(true);
      },
      (error: any) => {
        console.error('Error saving wrario data:', error);
        this.userService.presentToast('Σφάλμα κατά την αποθήκευση των εξαιρέσεων.', 'danger');
      }
    );
  }


  /**
   * Navigates back to the previous page or dismisses the modal.
   */
  goBack() {
    this.modalController.dismiss(this.changesHaveBeenMade)
  }

  /**
   * Helper method to format hours.
   *
   * @param hour - The hour in number (0-23).
   * @param minutes - The minutes as a string ('00', '30', etc.).
   * @returns A formatted hour string ('HH:mm').
   */
  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  /**
   * Pads a number with a leading zero if necessary.
   *
   * @param num - The number to pad.
   * @returns A string with at least two digits.
   */
  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
