import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { FacebookImagesPage } from '../facebook-images/facebook-images.page';
import { InstagramImagesPage } from '../instagram-images/instagram-images.page';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { CropperDialog } from '../onboarding/cropper-dialog';
import { LyDialog } from '@alyle/ui/dialog';
import { BASE64_STRING } from '../../../assets/icon/default-image';

@Component({
  selector: 'app-add-person',
  templateUrl: './add-person.page.html',
  styleUrls: ['./add-person.page.scss'],
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
personName=""
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
  

  constructor(private _cd: ChangeDetectorRef,private _dialog: LyDialog,private userService:UserService,private modalController:ModalController,private navParams: NavParams,private actionSheetController:ActionSheetController) { 
    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));
  }

  ngOnInit() {

  }

  ionViewWillEnter(){
    console.log(this.navParams)
    this.businessSchedule = this.navParams.get('data');
    this.personSchedule = this.navParams.get('personSchedule');
    this.customSchedule = this.navParams.get('toggled');
    this.personName = this.navParams.get('personName'); // Get the name of the person
    if (this.customSchedule) {
      this.applypersonSchedule();
    }
    console.log(this.personName)
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

  
  async confirm(){
    if (!this.personName || this.personName.trim() === '') {
      this.userService.presentToast('Το όνομα του ατόμου δεν μπορεί να είναι κενό.',"danger");
      return;
    }
    this.scheduleToReturn = this.customSchedule ? this.days : this.businessSchedule;
    if(this.customSchedule){
      await this.modalController.dismiss({
        'personName': this.personName,
        'days': this.scheduleToReturn,
        'image': this.image,
      });
    }else{
      await this.modalController.dismiss({
        'personName': this.personName,
        'days': this.businessSchedule,
        'image': this.image,

      });
    }

    
   
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
      console.log('Selected start time: ', selectedStartTime);
    
      const parsedSelectedStartTime = moment(selectedStartTime, 'HH:mm');
    
      for (let previousInterval of day.timeIntervals) {
        if (previousInterval === timeInterval) {
          continue; // Skip current interval
        }
    
        const parsedPreviousStartTime = moment(previousInterval.start, 'HH:mm');
        const parsedPreviousEndTime = moment(previousInterval.end, 'HH:mm');
    
        if (parsedSelectedStartTime.isBetween(parsedPreviousStartTime, parsedPreviousEndTime, undefined, '[]')) {
          this.userService.presentToast("Η ώρα έναρξης δεν μπορεί να είναι μέσα στο διάστημα άλλων χρονικών διαστημάτων της ίδιας μέρας", "danger")
          console.log(timeInterval.start)
    
          new Promise(resolve => setTimeout(resolve, 0)).then(() => {
            timeInterval.start = this.addHours(previousInterval.end, 1); // Suggesting next available time slot after last interval's end time
            selectedStartTime = timeInterval.start;
            console.log(this.days);
          });
    
          break;
        } else {
          timeInterval.start = selectedStartTime; // Only update start time if it's not within any other time intervals
        }
      }
      
      if (this.firstDayToggled.name == day.name ) {
        console.log("MPIKA")
        this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
      }
    }
    
    
    onEndTimeChange(selectedEndTime: string, timeInterval: any, day: any) {
      console.log('Selected end time: ', selectedEndTime);
    
      const parsedEndTime = moment(selectedEndTime, 'HH:mm');
      const parsedStartTime = moment(timeInterval.start, 'HH:mm');
    
      if (parsedEndTime.isBefore(parsedStartTime)) {
        this.userService.presentToast("Η ώρα τερματισμού πρέπει να είναι μετά την ώρα έναρξης", "danger")
        console.log(timeInterval.start)
    
        // delay setting the new value until next event loop to give the UI a chance to update
        new Promise(resolve => setTimeout(resolve, 0)).then(() => {
          timeInterval.end = this.addHours(timeInterval.start, 2);
          selectedEndTime = timeInterval.end;
          console.log(this.days);
        });
    
      } else {
        timeInterval.end = selectedEndTime; // Only update end time if it's not before start time
      }
    
      if (this.firstDayToggled.name == day.name ) {
        console.log("MPIKA")
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
        console.log('Invalid time format');
        return '';
      }
    }
          
    isMobile(){
      return this.userService.isMobile()
    }




  openCropperDialog(imageURL: string | undefined) {
    console.log(imageURL)
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
      }
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε πηγή εικόνας',
      buttons: [
        {
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
        },

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
    console.log(image)
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
      console.log(data)
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
      console.log(data)
    }
  }

  
}
