import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { FacebookImagesPage } from '../facebook-images/facebook-images.page';
import { InstagramImagesPage } from '../instagram-images/instagram-images.page';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { CropperDialog } from '../onboarding/cropper-dialog';
import { LyDialog } from '@alyle/ui/dialog';
import { BASE64_STRING } from '../../../assets/icon/default-image';
import { MatSelect } from '@angular/material/select';
import { AddScheduleExceptionPage } from '../add-schedule-exception/add-schedule-exception.page';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.page.html',
  styleUrls: ['./add-person.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1
      })),
      state('closed', style({
        height: '0',
        opacity: 0
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class AddPersonPage implements OnInit {

  hours: string[] = [];
  days = [
    { name: 'Δευτέρα', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τρίτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τετάρτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Πέμπτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Παρασκευή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Σάββατο', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Κυριακή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] }
  ];
  personName = ""
  personSurName = ""

  customSchedule = false;
  businessSchedule: any;
  personSchedule: any;
  person: any;

  selectedImage = { imageLink: '', selected: false };
  currentAlbumPhotos: any;
  photos: { imageLink: string, selected: boolean }[] = [];

  togglesCounter: number = 0;
  @ViewChild('_fileInput') _fileInput: any;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  cropped?: string;
  image: string | undefined = BASE64_STRING
  new_image: string = "false";
  onboarding: boolean = false;
  scheduleExceptions: any[] = [];
  daysControl = new FormControl();
  isEditing: any = false;
  addedExceptions: boolean = false;
  defaultImage = true;
  isMobile=false
  constructor(private alertController: AlertController, private _cd: ChangeDetectorRef, private _dialog: LyDialog, private userService: UserService, private modalController: ModalController, private navParams: NavParams, private actionSheetController: ActionSheetController) {
    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));
    this.isMobile=this.userService.isMobile();
  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    if(this.navParams.get('defaultImage')==undefined){
      this.defaultImage=true
    }else{
      this.defaultImage = this.navParams.get('defaultImage');;

    }
    this.businessSchedule = this.navParams.get('data');
    this.personSchedule = this.navParams.get('personSchedule');
    this.customSchedule = this.navParams.get('toggled');
    this.personName = this.navParams.get('personName'); // Get the name of the person
    this.onboarding = this.navParams.get('onboarding');
    this.isEditing = this.navParams.get('isEditing');
  
    if (this.navParams.get('personImage') != undefined) {
      this.image = this.navParams.get('personImage');
    }
  
    if (!this.onboarding) {
      if (this.navParams.get('scheduleExceptions') != undefined) {
        this.scheduleExceptions = this.navParams.get('scheduleExceptions');
        
        
        this.scheduleExceptions = this.scheduleExceptions.map(this.formatException);
        
        
        this.daysControl.setValue(this.scheduleExceptions); // Set all exceptions as selected
      } else {
        this.scheduleExceptions = [];
      }
    }
  
    if (this.customSchedule) {
      this.applypersonSchedule();
    }
    
    this._cd.detectChanges();
  }
  



  applypersonSchedule() {
    // Transform personSchedule to a dictionary for easier access
    let personScheduleDict = this.personSchedule.reduce((acc: any, curr: any) => {
      acc[curr.day] = curr.intervals;
      return acc;
    }, {});

    // Map this.days to update the intervals based on personScheduleDict
    this.days = this.days.map((day: any) => {
      if (personScheduleDict[day.name]) {
        return {
          ...day,
          open: true, // Set open to true
          timeIntervals: personScheduleDict[day.name].map((interval: any) => {
            const [start, end] = interval.split('-');
            return { start, end };
          })
        };
      }
      return day;
    });
  }




  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  deleteTimeInterval(day: any, index: number) {
    day.timeIntervals.splice(index, 1);
  }


  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }



  dismiss() {
    this.modalController.dismiss();
  }

  addTimeInterval(day: any) {
    const previousInterval = day.timeIntervals[day.timeIntervals.length - 1];
    const defaultStart = previousInterval ? previousInterval.end : '9:00';
    const defaultEnd = previousInterval ? this.addHours(previousInterval.end, 2) : '11:00';

    day.timeIntervals.push({ start: defaultStart, end: defaultEnd });
  }

  public scheduleToReturn: any;


  async confirm() {
    if (!this.personName || this.personName.trim() === '') {
      this.userService.presentToast('Το όνομα του ατόμου δεν μπορεί να είναι κενό.', "danger");
      return;
    }

    this.scheduleToReturn = this.customSchedule ? this.days : this.businessSchedule;

    let deformattedSelectedExceptions = [];
    if (!this.onboarding) {
      // Fetch only the selected exceptions
      const selectedExceptions = this.daysControl.value;

      // Deformat only these selected exceptions
      
      
      if (selectedExceptions != null) {
        deformattedSelectedExceptions = this.deformatExceptions(selectedExceptions);

      }
    }

    if (!this.onboarding) {
      let body = {
        id: this.navParams.get('personId'),
        name: this.personName,
        surname: this.personSurName,
        image: (() => {
          const parts = this.image?.split(",");
          if (parts && parts.length === 2) {
            // If the image URL is properly split into two parts, return the second part
            return parts[1];
          } else if (this.image?.includes("http")) {
            // If the image string contains "http", assume it's a valid URL and return it
            return this.image;
          }
          // If none of the above conditions are met, return 'default'
          return 'default';
        })(),
        
        exceptions: deformattedSelectedExceptions,
        schedule: this.customSchedule
          ? this.scheduleToReturn
            .filter((day: { open: any; }) => day.open)
            .map(({ name, timeIntervals }: { name: string; timeIntervals: any[] }) => ({
              day: name,
              intervals: timeIntervals.map((interval: { start: any; end: any; }) => `${interval.start}-${interval.end}`)
            }))
          : this.businessSchedule.map((day: { name: any; timeIntervals: any[]; }) => {
            const mappedDay = day.name;
            return {
              day: mappedDay,
              intervals: day.timeIntervals.map(interval => `${interval.start}-${interval.end}`),
            };
          }),
      };
      
      
      this.saveEmployee(body)
    } else {
      if (this.customSchedule) {
        await this.modalController.dismiss({
          'personName': this.personName,
          'personSurName': this.personSurName,
          'scheduleExceptions': deformattedSelectedExceptions,
          'days': this.scheduleToReturn,
          'image': this.image,
          'defaultImage': this.defaultImage
        });
      } else {
        await this.modalController.dismiss({
          'personName': this.personName,
          'personSurName': this.personSurName,
          'scheduleExceptions': deformattedSelectedExceptions,
          'days': this.businessSchedule,
          'image': this.image,
          'defaultImage': this.defaultImage

        });
      }
    }


  }

  dismissModalAfterEdit() {
    this.modalController.dismiss({
      'edited': true,
      'new_image': this.new_image
    });
  }

  saveEmployee(body: any) {
    this.userService.saveEmployee(body, !this.addedExceptions, false, false).subscribe(data => {
      this.userService.presentToast("Το άτομο αποθηκεύτηκε επιτυχώς.", "success");
      this.dismissModalAfterEdit()
    }, err => {
      if (err.status === 409) {
        
        
        this.presentChoiceAlert(err.error, body);
      } else {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
      }
    });
  }

  async presentChoiceAlert(errorObj: any, body: any) {
    let message: string = "Unknown error";  // Set a default value
    let buttonText: string = "";
    let handlerFn;

    if (errorObj.deletedEmployee) {
      message = errorObj.deletedEmployee;
      buttonText = 'Ακυρωση ολων';
      handlerFn = () => {
        this.userService.saveEmployee(body, true, true, false).subscribe(
          data => {
            this.dismissModalAfterEdit()

            this.userService.presentToast("Το άτομο αποθηκεύτηκε επιτυχώς.", "success");

          },
          err => {
            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
          }
        );
      };
    } else if (errorObj.newException) {
      message = errorObj.newException;
      buttonText = 'Ακυρωση ολων';
      handlerFn = () => {
        this.userService.saveEmployee(body, true, false, true).subscribe(
          data => {
            this.dismissModalAfterEdit()

            this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς.", "success");
          },
          err => {
            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
          }
        );
      };
    }

    const alert = await this.alertController.create({
      header: 'Προσοχή!',
      message: message,
      buttons: [
        {
          text: buttonText,
          handler: handlerFn
        },
        {
          text: 'Καμια Ακυρωση',
          handler: () => {
            this.userService.saveEmployee(body, true, false, false).subscribe(
              data => {
                this.dismissModalAfterEdit()

                this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς χωρίς καμία ακύρωση.", "success");
              },
              err => {
                this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
              }
            );
          }
        },
        {
          text: 'πισω',
          role: 'cancel', // This makes it dismiss the dialog
          handler: () => {
            // Dismisses the dialog without any further action
          }
        },
      ]
    });

    await alert.present();
  }




  goBack() {
    this.modalController.dismiss();
  }

  firstDayTemplate: any[] = [];
  firstDayToggled: any = null;

  onDayToggle(day: any) {
    // Toggle the day
    day.open = !day.open;

    if (day.open) {
      // If this is the first day toggled, store it
      if (!this.firstDayToggled) {
        this.firstDayToggled = day;
      }
      // If another day is toggled and the template is empty, copy the first day's intervals to the template
      else if (this.firstDayToggled.name != day.name && this.firstDayTemplate.length == 0) {
        this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
        for (let d of this.days) {
          if (d.name !== this.firstDayToggled.name) {
            d.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
          }
        }
      }


      // If this is not the first day toggled and the day has no intervals yet, copy the template to the day
      if (this.firstDayToggled !== day && day.timeIntervals.length === 0) {
        day.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
      }
    }
  }

  onStartTimeChange(selectedStartTime: string, timeInterval: any, day: any) {
    

    const parsedSelectedStartTime = moment(selectedStartTime, 'HH:mm');

    for (let previousInterval of day.timeIntervals) {
      if (previousInterval === timeInterval) {
        continue; // Skip current interval
      }

      const parsedPreviousStartTime = moment(previousInterval.start, 'HH:mm');
      const parsedPreviousEndTime = moment(previousInterval.end, 'HH:mm');

      if (parsedSelectedStartTime.isBetween(parsedPreviousStartTime, parsedPreviousEndTime, undefined, '[]')) {
        this.userService.presentToast("Η ώρα έναρξης δεν μπορεί να είναι μέσα στο διάστημα άλλων χρονικών διαστημάτων της ίδιας μέρας", "danger")
        

        new Promise(resolve => setTimeout(resolve, 0)).then(() => {
          timeInterval.start = this.addHours(previousInterval.end, 1); // Suggesting next available time slot after last interval's end time
          selectedStartTime = timeInterval.start;
          
        });

        break;
      } else {
        timeInterval.start = selectedStartTime; // Only update start time if it's not within any other time intervals
      }
    }

    if (this.firstDayToggled.name == day.name) {
      
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }


  onEndTimeChange(selectedEndTime: string, timeInterval: any, day: any) {
    

    const parsedEndTime = moment(selectedEndTime, 'HH:mm');
    const parsedStartTime = moment(timeInterval.start, 'HH:mm');

    if (parsedEndTime.isBefore(parsedStartTime)) {
      this.userService.presentToast("Η ώρα τερματισμού πρέπει να είναι μετά την ώρα έναρξης", "danger")
      

      // delay setting the new value until next event loop to give the UI a chance to update
      new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        timeInterval.end = this.addHours(timeInterval.start, 2);
        selectedEndTime = timeInterval.end;
        
      });

    } else {
      timeInterval.end = selectedEndTime; // Only update end time if it's not before start time
    }

    if (this.firstDayToggled.name == day.name) {
      
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }

  addHours(time: string, hours: number): string {
    const parsedTime = moment(time, 'HH:mm');

    if (parsedTime.isValid()) {
      const newTime = parsedTime.clone().add(hours, 'hours'); // Use clone() to avoid mutating parsedTime

      // Check if the newTime has crossed over to the next day
      if (newTime.isSame(parsedTime, 'day')) {
        const formattedTime = newTime.format('HH:mm');
        return formattedTime;
      } else {
        // If the day of newTime is not the same as the day of parsedTime, then it has crossed over to the next day
        return '23:59';
      }
    } else {
      
      return '';
    }
  }

 



  openCropperDialog(imageURL: string | undefined) {
    
    this.cropped = null!;
    this._dialog.open(CropperDialog, {
      data: imageURL,
      width: 320,
      disableClose: true
    }).afterClosed.subscribe((result?: ImgCropperEvent) => {
      if (result) {
        this.cropped = result.dataURL;
        this.image = this.cropped
        this._cd.markForCheck();
        this.new_image = "true"
        this.defaultImage = false;

      }
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε πηγή εικόνας',
      buttons: [
        /*{
          text: 'Facebook',
          icon: 'logo-facebook',
          handler: () => {
            this.selectImageFromFacebook();
          }
        },
        {
          text: 'Instagram',
          icon: 'logo-instagram',
          handler: () => {
            this.selectImageFromInstagram();
          }
        },*/

        {
          text: 'Αποθηκευτικός Χώρος',
          icon: 'folder',
          handler: () => {
            this.importFromStorage();
          }
        },
        {
          text: 'Κάμερα',
          icon: 'camera',
          handler: () => {
            this.importFromCamera();
          }
        },
        {
          text: 'Άκυρο',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }



  importFromStorage() {
    this._fileInput.nativeElement.click();
  }

  importFromCamera() {
    this.takePicture()
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    
    // do something with the captured image
    this.openCropperDialog(image.webPath)
  }

  getFileUrl(input: HTMLInputElement): string {
    const file = input.files && input.files[0];
    if (file) {
      return URL.createObjectURL(file); // create a URL for the selected file
    }
    return '';
  }

  async selectImageFromFacebook() {
    const modal = await this.modalController.create({
      component: FacebookImagesPage,

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedImage = data.imageSelected; // Update the person's table types with the returned data
      this.openCropperDialog(this.selectedImage.imageLink)
      
    }
  }

  async selectImageFromInstagram() {
    const modal = await this.modalController.create({
      component: InstagramImagesPage,

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedImage = data.imageSelected; // Update the person's table types with the returned data
      this.openCropperDialog(this.selectedImage.imageLink)
      
    }
  }


  handleClick() {
    if (this.scheduleExceptions?.length === 0 || this.scheduleExceptions === null) {
      this.openDateTimePicker();
    }
  }

  @ViewChild('mySelect') mySelect!: MatSelect;



  async openDateTimePicker() {
    this.mySelect.close();
    const modal = await this.modalController.create({
      component: AddScheduleExceptionPage,
      componentProps: {
        // room: room, // Pass the entire room object
      }
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    
    
    if (data) {
      const formattedException = this.formatException(data);
      if (this.scheduleExceptions) {
        this.scheduleExceptions.push(formattedException);
        this.daysControl.setValue(this.scheduleExceptions);
        this.addedExceptions = true
      } else {
        console.error("scheduleExceptions is not initialized");
      }

      
      
    }
  }

  formatException(exception: { start: moment.MomentInput; end: moment.MomentInput; repeat: boolean }): any {
    const formattedStart = moment.utc(exception.start).locale('el').format('DD/MM/YY HH:mm');
    const formattedEnd = moment.utc(exception.end).locale('el').format('DD/MM/YY HH:mm');

    return {
      formatted: `${formattedStart} - ${formattedEnd}`,
      originalStart: exception.start,
      originalEnd: exception.end,
      repeat: exception.repeat ? "Επαναλαμβανόμενο" : "Μία φορά"
    };
  }

  deformatExceptions(exceptionsArray: Array<{
    formatted: string,
    originalStart: moment.MomentInput,
    originalEnd: moment.MomentInput,
    repeat: string
  }>): any[] {
    return exceptionsArray.map(exception => {
      

      const start = exception.originalStart;
      const end = exception.originalEnd;
      const repeat = exception.repeat === "Επαναλαμβανόμενο";

      
      
      

      return {
        start: start,
        end: end,
        repeat: repeat
      };
    });
  }


  disabledSaveButton(): boolean {
    return !this.personName?.trim() || !this.personSurName?.trim();
  }


  validateInput() {
    if (this.personName) {
      this.personName = this.personName.replace(/\s+/g, '');
    }
    if (this.personSurName) {
      this.personSurName = this.personSurName.replace(/\s+/g, '');
    }
  }



}
