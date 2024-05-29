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
import { TeamServicesPage } from '../team-services/team-services.page';
import { AutomatedNotificationsPage } from '../automated-notifications/automated-notifications.page';
import { ReservationSettingsPage } from '../reservation-settings/reservation-settings.page';
import { SocialMediaPage } from '../social-media/social-media.page';
import { WrarioPage } from '../wrario/wrario.page';
import { ThemeService } from 'src/app/services/theme.service';

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
  themeToggle = false;

  hours: string[] = [];
  scheduleExceptions: any = new Array<any>;
  facebookAccessGranted: boolean = false;
  facebookPageToEdit: any;
  currentPageDescription: any = "Δεν υπάρχει υπάρχουσα εισαγωγική κάρτα.";
  latestActiveCTA: any;
  currentCTAtext: string = "Άγνωστη Ενέργεια";
  currentMenuCallToActions: any = [];
  expertId: any = "";
  proposedMenuCallToActions: any;
  expertReservationLink: string = "";
  hideCTA: boolean = false;
  hidePageDescription: boolean = false;
  facebookPageAccessToken: any = "";
  facebookPageId: any;
  needRefresh: boolean=false;
  settings = [
    {
      name: 'Ωράριο',
      icon: '../../../assets/icon/opening-hours.png',
      page:'schedule'
    },
    {
      name: 'Ομάδα & Υπηρεσίες',
      icon: '../../../assets/icon/work-team.png',
      page:'team-services'

    },
    {
      name: 'Κρατήσεις',
      icon: '../../../assets/icon/time-management.png',
      page:'reservations'

    },
    /*{
      name: 'Social Media',
      icon: '../../../assets/icon/social-media.png',
      page:'social-media'

    },*/
    {
      name: 'Αυτοματοποιημένες ειδοποιήσεις',
      icon: '../../../assets/icon/sms.png',
      page:'automated-notifications'

    },
    {
      name: 'Αλλαγή Κωδικού',
      icon: '../../../assets/icon/padlock.png',
      page:'change-password'

    },

    {
      name: 'Σκοτεινή λειτουργία',
      icon: '../../../assets/icon/moon.png',
      page:'dark-mode'

    }
  ];
  constructor(private themeService:ThemeService,private alertController:AlertController,private modalController: ModalController, private userService: UserService, private externalService: ExternalService) {

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
    const darkModePref = localStorage.getItem('darkMode');
    this.themeToggle = darkModePref === 'true';
  }
  ionViewWillEnter() {


  }

  goBack() {
    
    this.modalController.dismiss(this.needRefresh)
  }


  toggleChange(): void {
    this.themeService.toggleDarkTheme(this.themeToggle);
  }
  

  async goToSetting(item: any) {
    let modal = null;
    if (item.page == "team-services") {
      modal = await this.modalController.create({
        component: TeamServicesPage,
      });
    } else if (item.page == "social-media") {
      modal = await this.modalController.create({
        component: SocialMediaPage,
      });
    } else if (item.page == "automated-notifications") {
      modal = await this.modalController.create({
        component: AutomatedNotificationsPage,
      });
    } else if (item.page == "reservations") {
      modal = await this.modalController.create({
        component: ReservationSettingsPage,
      });
    } else if (item.page == "schedule") {
      modal = await this.modalController.create({
        component: WrarioPage,
      });
    } else if (item.page == "change-password") {
      modal = await this.modalController.create({
        component: ChangePasswordPage,
      });
    } else if (item.page == "dark-mode") {
      this.themeToggle = !this.themeToggle;
      this.toggleChange();
    }
  
    if (modal !== null) {
      modal.onDidDismiss().then((result) => {
        
        
        if (result.data || result.data.needRefresh) {
          this.needRefresh = true;
        }
      });
      await modal.present();
    }
  }
  
 

  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }



  

}
