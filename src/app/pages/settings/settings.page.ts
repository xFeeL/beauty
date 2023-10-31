import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonAlert, IonDatetime, IonModal, IonPopover, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatSelect } from '@angular/material/select';
import { AddScheduleExceptionPage } from '../add-schedule-exception/add-schedule-exception.page';
import { FacebookLogin, FacebookLoginPlugin } from '@capacitor-community/facebook-login';
import { GuidePage } from '../guide/guide.page';
import { ExternalService } from 'src/app/services/external.service';
import { ChangePasswordPage } from '../change-password/change-password.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
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
export class SettingsPage implements OnInit {

  hours: string[] = [];
  scheduleExceptions: any = new Array<any>;
  facebookAccessGranted: boolean = false;
  facebookPageToEdit: any;
  currentPageDescription: any = "Δεν υπάρχει υπάρχουσα εισαγωγική κάρτα.";
  latestActiveCTA: any;
  currentCTAtext: string = "Άγνωστη Ενέργεια";
  currentMenuCallToActions: any = [];
  expertSlug: any = "";
  proposedMenuCallToActions: any;
  expertReservationLink: string = "";
  hideCTA: boolean = false;
  hidePageDescription: boolean = false;
  facebookPageAccessToken: any = "";
  facebookPageId: any;
  needRefresh: boolean=false;

  constructor(private alertController:AlertController,private modalController: ModalController, private userService: UserService, private externalService: ExternalService) {

    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));
  }
  daysWrario = [
    { name: 'Δευτέρα', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τρίτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τετάρτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Πέμπτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Παρασκευή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Σάββατο', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Κυριακή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] }
  ];
  firstDayTemplate: any[] = [];
  firstDayToggled: any = null; selectedSegment: string = 'general';  // Default selected segment
  @ViewChild('deleteAlert') deleteAlert!: IonAlert;
  daysControl = new FormControl();
  days = ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  saveButtonText = "Αποθήκευση ρυθμίσεων"
  ngOnInit() {
    this.loadKrathseisSettings();
  }
  ionViewWillEnter() {


  }
  loadWrarioData() {
    this.getScheduleExceptions();
    this.saveButtonText = "Αποθήκευση ωραρίου"
    this.userService.getWrario().subscribe(data => {
      // Create a mapping from Greek to English days
      const dayMapping: { [key: string]: string } = {
        'Δευτέρα': 'monday',
        'Τρίτη': 'tuesday',
        'Τετάρτη': 'wednesday',
        'Πέμπτη': 'thursday',
        'Παρασκευή': 'friday',
        'Σάββατο': 'saturday',
        'Κυριακή': 'sunday',
      };

      this.daysWrario.forEach(day => {
        // Get the corresponding day in English
        const englishDay = dayMapping[day.name];

        // If there are working hours for that day, set the open property to true and fill the timeIntervals array
        if (data[englishDay] !== null) {
          day.open = true;
          day.timeIntervals = data[englishDay].workingHours.map((wh: { start: string; end: string; }) => ({
            start: wh.start.substring(0, 5), // Convert 'HH:MM:SS' to 'HH:MM'
            end: wh.end.substring(0, 5), // Convert 'HH:MM:SS' to 'HH:MM'
          }));
        } else {
          // If there are no working hours for that day, set the open property to false and keep the default 9-5 interval
          day.open = false;
          day.timeIntervals = [{ start: '09:00', end: '17:00' }];
        }
      });

    }, err => {
      // Handle error here
    });

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
      this.scheduleExceptions.push(formattedException);

      console.log("NEW EXCEPTIONs");
      console.log(this.scheduleExceptions);
    }
}



  onDelete(day: string) {
    console.log('Delete', day);
    // Implement your deletion logic here
  }


  goBack() {
    console.log("going back with:"+this.needRefresh)
    this.modalController.dismiss(this.needRefresh)
  }

  get hasScheduleExceptions(): boolean {
    return this.scheduleExceptions && this.scheduleExceptions.length > 0;
  }

  handleClickExceptions() {
    if (this.scheduleExceptions.length === 0) {
      this.openDateTimePicker();
    }
  }


  getScheduleExceptions() {
    this.userService.getScheduleExceptions().subscribe(
      data => {
        this.scheduleExceptions = data.map(this.formatException);
        this.daysControl.setValue(this.scheduleExceptions); // Set all exceptions as selected
      },
      err => {
        console.error('Error fetching schedule exceptions', err);
      }
    );
}

formatException(exception: { start: moment.MomentInput; end: moment.MomentInput; repeat: boolean }): any {
    const formattedStart = moment(exception.start).locale('el').format('DD/MM/YY HH:mm');
    const formattedEnd = moment(exception.end).locale('el').format('DD/MM/YY HH:mm');

    return {
      formatted: `${formattedStart} - ${formattedEnd}`,
      originalStart: exception.start,
      originalEnd: exception.end,
      repeat: exception.repeat ? "Επαναλαμβανόμενο" : "Μία φορά"
    };
}




  onDayToggle(day: any) {
    // Toggle the day
    //day.open = event.detail.checked;
    day.open = !day.open
    if (day.open) {
      // If this is the first day toggled, store it
      if (!this.firstDayToggled) {
        this.firstDayToggled = day;
      }
      // If another day is toggled and the template is empty, copy the first day's intervals to the template
      else if (this.firstDayToggled.name != day.name && this.firstDayTemplate.length == 0) {
        this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
        for (let d of this.daysWrario) {
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

  addTimeInterval(day: any) {
    const previousInterval = day.timeIntervals[day.timeIntervals.length - 1];
    const defaultStart = previousInterval ? previousInterval.end : '9:00';
    const defaultEnd = previousInterval ? this.addHours(previousInterval.end, 2) : '11:00';

    day.timeIntervals.push({ start: defaultStart, end: defaultEnd });
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



  deleteTimeInterval(day: any, index: number) {
    day.timeIntervals.splice(index, 1);
  }


  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  saveWrario() {
    this.userService.saveWrario(this.daysWrario).subscribe(data => {
      this.userService.presentToast("Το ωράριο αποθηκεύτηκε με επιτυχία.", "success");

      // Get only selected exceptions
      const selectedExceptions = this.daysControl.value;

      // Map them to the desired format
      const exceptionsToSend = selectedExceptions.map((exception: { originalStart: any; originalEnd: any; repeat: string }) => ({
        start: exception.originalStart,
        end: exception.originalEnd,
        repeat: exception.repeat === "Επαναλαμβανόμενο" // This will return true if the condition is met, otherwise false
    }));
    
    this.saveScheduleExceptions(exceptionsToSend)
    

    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά στην αποθήκευση του ωραρίου.", "danger");
    });
  }



  saveScheduleExceptions(exceptionsToSend: any) {
    this.userService.saveScheduleExceptions(exceptionsToSend, false, false).subscribe(data => {
      this.userService.presentToast("Οι εξαιρέσεις αποθηκεύτηκαν με επιτυχία.", "success");
      this.scheduleExceptions = [];
      this.getScheduleExceptions();
    }, err => {
      if (err.status === 406 && err.error && err.error["Overlapping appointments"]) { 
        this.presentAlertWithChoices(exceptionsToSend, err.error["Overlapping appointments"]);
      } else {
        this.userService.presentToast("Κάτι πήγε στραβά στην αποθήκευση των εξαιρέσεων.", "danger");
      }
    });
  }
  
async presentAlertWithChoices(exceptionsToSend:any, overlappingDates: string) {
    const alert = await this.alertController.create({
      header: 'Προσοχή!',
      message: 'Υπάρχουν κρατήσεις που δεν έχουν ολοκληρωθει τις ημερομηνίες: ' + overlappingDates,
      buttons: [
        {
          text: 'ακυρωση ολων',
          handler: () => {
            console.log("PREPEI NA EINAI TRUE")
            this.needRefresh=true
            console.log(this.needRefresh)
            this.saveScheduleExceptionsWithParams(exceptionsToSend, true, true);
          }
        },
        {
          text: 'καμια ακυρωση',
          handler: () => {
            this.saveScheduleExceptionsWithParams(exceptionsToSend, true, false);
          }
        },
        {
          text: 'πισω',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  
  saveScheduleExceptionsWithParams(exceptionsToSend:any,param1: boolean, param2: boolean) {
    this.userService.saveScheduleExceptions(exceptionsToSend, param1, param2).subscribe(data => {
      this.userService.presentToast("Οι εξαιρέσεις αποθηκεύτηκαν με επιτυχία.", "success");
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά στην αποθήκευση των εξαιρέσεων.", "danger");
    });
  }
  


  async editPassword() {
    const modal = await this.modalController.create({
        component: ChangePasswordPage,
    });
    return await modal.present();
}



  //Krathseis
  slotInterval: string = "15";

  needAccept: boolean = false;
  isVisible: boolean = true;


  loadKrathseisSettings() {
    this.saveButtonText = "Αποθήκευση ρυθμίσεων"

    this.userService.getAppointmentsSettings().subscribe(data => {
      console.log("THE DATA");
      console.log(data);

      this.slotInterval = data.slotInterval.toString();

      // Assuming needAccept from server is 0 or 1, convert it to boolean
      this.needAccept = data.needAccept === 0;

      // Assuming isVisible from server is a string "true" or "false", convert it to boolean
      this.isVisible = data.isVisible === "true";

    }, err => {
      console.error("Error fetching Krathseis settings:", err);
    });
  }

  saveKrathseisSettings() {
    this.userService.saveAppointmentsSettings(this.slotInterval, this.needAccept, this.isVisible).subscribe(data => {
      this.userService.presentToast("Οι ρυθμίσεις για τις κρατήσεις αποθηκεύτηκαν με επιτυχία.", "success")
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

    });
  }



  saveSegmentSettings() {
    switch (this.selectedSegment) {
      case 'general':
        this.saveKrathseisSettings();
        break;
      case 'wrario':
        this.saveWrario();
        break;

      // ... add more cases for other segments if they have specific save methods
      default:
        console.error("Invalid segment selected");
    }
  }


  //social media
  selectedSocialSegment = "facebook"
  hideMessengerMenu = false

  proposedFacebookDescription: string = "asda";
  proposedAutoReplyMessage: string = "asd";

  facebookAccessToken: any;
  fbLogin!: FacebookLoginPlugin;
  pageName: any = "";
  choosePage: boolean = false;
  pageChosen: boolean = false;
  instagramPageChosen: boolean = false;
  chooseInstagramPage: boolean = false;

  facebookUserAccountId: any;
  pagesToChoose: any;
  instagramPagesToChoose: any;

  saveStatePersistenyMenu: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  saveStateCTAButton: 'idle' | 'loading' | 'success' | 'error' = 'idle';
  saveStateDescriptionAndLink: 'idle' | 'loading' | 'success' | 'error' = 'idle';



  autoGreeting = " "

  saveFacebookDescriptionAndLink() {
    this.saveStateDescriptionAndLink = 'loading';
    this.externalService.updatePageAboutAndWebsite(this.facebookPageAccessToken, this.facebookPageId, this.proposedFacebookDescription, this.expertReservationLink).subscribe(response => {
      console.log('Update successful', response);
      this.saveStateDescriptionAndLink = 'success';

    }, error => {
      console.error('Update failed', error);
      this.saveStateDescriptionAndLink = 'error';

    });

  }



  savePersistentMenu() {
    this.saveStatePersistenyMenu = 'loading';
    this.externalService.updatePersistentMenuAndGetStarted(
      this.facebookPageAccessToken,
      this.facebookPageId,
      this.proposedMenuCallToActions,
      "GET_STARTED_CLICKED", this.selectedSocialSegment // Replace with your actual payload
    ).subscribe(response => {
      console.log('Persistent Menu Update successful', response);
      this.saveStatePersistenyMenu = 'success';

    }, error => {
      console.error('Persistent Menu Update failed', error);
      this.saveStatePersistenyMenu = 'error';

    });
  }




  async setupFbLogin() {
    this.fbLogin = FacebookLogin;

  }

  resetSocialMedia() {
    this.pageChosen = false;
    this.pagesToChoose = []
    this.choosePage = false
    this.currentMenuCallToActions = []
    this.proposedMenuCallToActions = []
    this.facebookAccessGranted = false;
  }


  setupOauth() {
    if (this.selectedSocialSegment == "facebook") {
      FacebookLogin.initialize({ appId: '718122076068329' }).then(() => {
        this.setupFbLogin();
        this.facebookOAuth();

      });
    } else {
      this.getExpertSlug()
      this.pageChosen = true

      this.facebookAccessGranted = true;
    }

  }

  @ViewChild('pageChooseModal') pageChooseModal!: IonModal;

  async facebookOAuth(): Promise<void> {
    this.pagesToChoose = []
    this.choosePage = true
    const FACEBOOK_PERMISSIONS = ['user_photos', 'pages_show_list', 'pages_read_engagement', "pages_manage_metadata", "pages_messaging", "pages_manage_cta"]
    const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });
    if (result && result.accessToken) {
      this.facebookAccessToken = result.accessToken.token

      this.externalService.getFacebookPagesNameAndImage(this.facebookAccessToken).subscribe(pages => {
        this.facebookAccessGranted = true

        for (let i = 0; i < pages.data.length; i++) {
          let temp = {
            name: pages.data[i].name,
            url: pages.data[i].picture.data.url,
            id: pages.data[i].id

          };
          if (!temp.url) console.error('URL is undefined for page: ', temp);
          this.pagesToChoose.push(temp)
        }
        this.pageChosen = false;
        this.choosePage = true;

        if (this.pagesToChoose.length > 1) {
          this.pageChooseModal.present()
        } else {
          this.pageChosen = true;

          this.facebookPageToEdit = this.pagesToChoose[0]
          this.getFacebookPageInfo()
        }
      }, err => {

      })


    }
  }

  getExpertSlug() {
    this.userService.getExpertSlug().subscribe(slug => {
      this.expertSlug = slug.slug

      this.expertReservationLink = "https://www.fyx.gr/" + this.expertSlug

      this.autoGreeting = "Ευχαριστούμε πολύ για το μήνυμα σας! Αν επιθυμείτε να κάνετε κράτηση, παρακαλούμε κάντε κλικ στον παρακάτω σύνδεσμο: " + this.expertReservationLink
      if (this.selectedSegment == "facebook") {
        this.getPersistentMenuMessenger()
      }



    }, err => {
    })
  }

  getFacebookPageInfo() {
    this.externalService.getPageAccessToken(this.facebookAccessToken, this.facebookPageToEdit.id).subscribe(data => {
      this.getExpertSlug()
      this.facebookPageAccessToken = data.access_token
      this.facebookPageId = data.id
      if (this.selectedSegment == "facebook") {
        this.getCtaAndAbout()
      }
    }, err => {
      // Handle Error Here
      console.error(err);
    })
  }

  getPersistentMenuMessenger() {
    this.externalService.getPersistentMenuMessenger(this.facebookPageAccessToken, this.facebookPageId, this.selectedSegment).subscribe(menu => {
      console.log("THE MENU")
      this.currentMenuCallToActions = menu?.data?.[0]?.persistent_menu?.[0]?.call_to_actions ?? [];

      // Define the specific URL you are looking for
      const specificUrl = "https://www.fyx.gr/" + this.expertSlug

      // Check each CTA in currentMenuCallToActions for the specific URL
      for (const action of this.currentMenuCallToActions) {
        if (action.type === 'web_url' && action.url === specificUrl) {
          this.hideMessengerMenu = true;
          break; // Exit the loop once the specific URL is found
        }
      }

      // Continue with the rest of your logic...
      this.proposedMenuCallToActions = [...this.currentMenuCallToActions];

      if (!this.hideMessengerMenu) {
        // Construct the new action
        const newAction = {
          type: 'web_url',
          title: 'Online Κράτηση',
          url: "https://www.fyx.gr/" + this.expertSlug, // Ensure this is a full URL
          webview_height_ratio: 'full' // Or whatever you prefer
        };

        // Add the new action to the beginning of the proposedMenuCallToActions array
        this.proposedMenuCallToActions.unshift(newAction);

      }

    }, err => {
      console.error('Error getting menu:', err);
    });
  }


  getCtaAndAbout() {
    this.externalService.getPageCTAandAbout(this.facebookPageAccessToken, this.facebookPageId).subscribe(data2 => {
      console.log("DATA RETRIEVED")
      console.log(data2)
      if (data2.about != undefined) {
        this.currentPageDescription = data2.about
        if (this.currentPageDescription.includes("https://www.fyx.gr/" + this.expertSlug)) {
          this.hidePageDescription = true;
          this.proposedFacebookDescription = this.currentPageDescription
        } else {
          this.proposedFacebookDescription = ("Online Κρατήσεις: " + "https://www.fyx.gr/" + this.expertSlug + ". " + this.currentPageDescription).substring(0, 100);

        }
      } else {
        this.proposedFacebookDescription = ("Online Κρατήσεις: " + "https://www.fyx.gr/" + this.expertSlug + ".").substring(0, 100);

      }

    }, err => {
      console.error(err);
    })
  }

  dismissPageModal() {
    this.pageChooseModal.dismiss()
  }

  choosePageMethod(page: any) {
    this.facebookPageToEdit = page

    this.pageChosen = true;
    this.pageChooseModal.dismiss()
    this.getFacebookPageInfo()

  }



  loginWithInstagram() {
    const authWindow = window.open(this.externalService.instagramAuthUrl, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    if (!authWindow) {
      console.error('Unable to open Instagram authorization window.');
      return;
    }

    const intervalId = setInterval(() => {
      try {
        if (authWindow.closed) {
          clearInterval(intervalId);
        } else if (authWindow.location && authWindow.location.href.startsWith('https://localhost:8101')) {
          clearInterval(intervalId);
          const code = this.getCodeFromUrl(authWindow.location.href);
          this.userService.getInstagramTokenFromCode(code.split('#')[0]).subscribe(data => {
            this.externalService.getInstagramPersistentMenu(data.access_token).subscribe(data3 => {
              console.log("THE DATA")
              console.log(data3)

            }, err => {
            })

          }, err => {
          })
          console.log(code)
          authWindow.close();
        }
      } catch (e) {
        // Do nothing
      }
    }, 0);
  }

  private getCodeFromUrl(url: string): any {
    const params = new URLSearchParams(url.split('?')[1]);
    return params.get('code');
  }


  copyToClipboard(text: string) {
    // Implement logic to copy text to clipboard
    this.userService.presentToast("Το κείμενο αντιγράφηκε με επιτυχία.", "success")
    navigator.clipboard.writeText(text).then(() => {
      console.log('Text copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text', err);
    });
  }


  async manualGuideFBGreeting(guide: String) {

    const modal = await this.modalController.create({
      component: GuidePage,
      componentProps: { guide: guide }
    });

    return await modal.present();
  }

  

}
