import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EditAutomaticNotificationPage } from '../edit-automatic-notification/edit-automatic-notification.page';
import { UserService } from 'src/app/services/user.service';
import { SmsPurchasePage } from '../sms-purchase/sms-purchase.page';
import { EditAutoRenewalPage } from '../edit-auto-renewal/edit-auto-renewal.page';

type SettingKey = 'NEW_RESERVATION' | 'UPDATE' | 'CANCELLATION' | 'NOSHOW' | 'REMINDER_TO_RESERVE';

@Component({
  selector: 'app-automated-notifications',
  templateUrl: './automated-notifications.page.html',
  styleUrls: ['./automated-notifications.page.scss'],
})

export class AutomatedNotificationsPage implements OnInit {
  notification_settings: any = [];
  remindersSettings: any[] = [];
  remainingSMS=0;
  autoRenewal=false
  constructor(private modalController: ModalController, private userService: UserService) { }
  // Inside your AutomatedNotificationsPage class


  // Ensure the settingTexts object matches this structure
  settingTexts: { [key in SettingKey]: { text: string; note: string } } = {
    NEW_RESERVATION: {
      text: 'Μήνυμα για νέα κράτηση',
      note: 'Ειδοποιεί αυτόματα τους πελάτες σας για την νέα κράτηση τους.'
    },
    UPDATE: {
      text: 'Μήνυμα για αλλαγή κράτησης',
      note: 'Ειδοποιεί αυτόματα τους πελάτες σας για αλλαγές στην κράτηση τους.'
    },
    CANCELLATION: {
      text: 'Μήνυμα για ακύρωση κράτησης',
      note: 'Ειδοποιεί αυτόματα τους πελάτες σας για την ακύρωση της κράτηση τους.'
    },
    NOSHOW: {
      text: 'Μήνυμα για μη εμφάνιση',
      note: 'Στέλνει ειδοποίηση στους πελάτες που δεν εμφανίστηκαν στην κράτηση τους.'
    },
    REMINDER_TO_RESERVE: {
      text: 'Υπενθύμιση για νέα κράτηση',
      note: 'Στείλτε μήνυμα στους πελάτες σας για να ξανακάνουν κράτηση.'
    }
  };
  ngOnInit() {

  }

  ionViewWillEnter() {
    this.getNotificationSettings();
    this.getRemainingSMS();
  }

  goBack() {
    this.modalController.dismiss()
  }

  getRemainingSMS() {

    this.userService.getRemainingSMS().subscribe(data => {
      this.remainingSMS = data.remainingSMS;
      this.autoRenewal=data.autoRenewalEnabled
    
    }, err => {
      console.error(err);
    });
  }
  
  async newNotification() {

    try {
      const modal = await this.modalController.create({
        component: EditAutomaticNotificationPage,
        componentProps: {
          type: "REMINDER_OF_RESERVATION",

        },
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();
      this.getNotificationSettings(); // Consider adding error handling or feedback mechanism
    } catch (error) {
      console.error('Failed to edit notification settings:', error);
      // Consider feedback to the user or additional error handling
    }
  }

  async buySms() {
    this.userService.presentToast("Η υπηρεσία δυνατότητας αποστολής SMS θα ενεργοποιηθεί σύντομα. Μείνετε συντονισμένοι!","warning")
    return;
    try {
      const modal = await this.modalController.create({
        component: SmsPurchasePage,
       
      });

      await modal.present();
    } catch (error) {
      console.error('Failed to edit notification settings:', error);
      // Consider feedback to the user or additional error handling
    }
  }
  
  getSettingText(setting: string): { text: string; note: string } | undefined {
    // Assuming 'setting' is a key of 'settingTexts' object
    // This check ensures 'setting' is a valid key of 'settingTexts' before accessing
    if (setting in this.settingTexts) {
      return this.settingTexts[setting as keyof typeof this.settingTexts];
    }
    return undefined; // or return a default value
  }

  getNotificationSettings() {
    this.notification_settings = []

    this.userService.getNotificationSettings().subscribe(data => {
      this.notification_settings = data;
      this.remindersSettings = this.notification_settings.filter((setting: { notificationType: string; }) => setting.notificationType === 'REMINDER_OF_RESERVATION');
      this.remindersSettings = this.remindersSettings.map(setting => {
        return {
          ...setting,
          timeBeforeText: this.translateTimeBefore(setting.timeBefore)
        };
      });
    }, err => {
      console.error(err);
    });
  }

  translateTimeBefore(timeBefore: string): string {
    const translations = {
      H1: '1 ώρα',
      H2: '2 ώρες',
      H3: '3 ώρες',
      D1: '1 ημέρα',
      D2: '2 ημέρες',
      D3: '3 ημέρες',
      D4: '4 ημέρες',
      D5: '5 ημέρες',
      D6: '6 ημέρες',
      D7: '7 ημέρες'
    };
    return translations[timeBefore as keyof typeof translations] || timeBefore;
  }


  @ViewChild('reminders') reminders!: ElementRef<HTMLDivElement>;
  @ViewChild('updates') updates!: ElementRef<HTMLDivElement>;
  @ViewChild('boost') boost!: ElementRef<HTMLDivElement>;

  /*scrollToTarget(element: string): void {
    switch (element) {
      case "reminders":
        this.reminders.nativeElement.scrollIntoView({ behavior: 'smooth' });
        break;
      case "updates":
        this.updates.nativeElement.scrollIntoView({ behavior: 'smooth' });
        break;
      case "boost":
        this.boost.nativeElement.scrollIntoView({ behavior: 'smooth' });
        break;
      default:
        console.warn(`Unknown target: ${element}`);
    }
  }
  
  editReminder(){
    
  }*/


  async editNotification(type: string, setting?: { notificationType: string; channel: string; id: string; timeBefore?: string }) {
    let notification = setting || this.findNotificationByType(type);

    let channels = this.determineNotificationChannels(notification?.channel);

    try {
      const modal = await this.modalController.create({
        component: EditAutomaticNotificationPage,
        componentProps: {
          type: type,
          id: notification?.id || null,
          email: channels.email,
          sms: channels.sms,
          timeBefore: notification?.timeBefore || null
        },
      });

      await modal.present();
      const { data } = await modal.onDidDismiss();
      this.getNotificationSettings(); // Consider adding error handling or feedback mechanism
    } catch (error) {
      console.error('Failed to edit notification settings:', error);
      // Consider feedback to the user or additional error handling
    }
  }

  private findNotificationByType(type: string) {
    return this.notification_settings.find((s: { notificationType: string; }) => s.notificationType === type) || { notificationType: type, channel: 'DEFAULT' };
  }

  private determineNotificationChannels(channel: string) {
    const channels = { email: false, sms: false };
    if (channel === 'BOTH') {
      channels.email = true;
      channels.sms = true;
    } else if (channel === 'EMAIL') {
      channels.email = true;
    } else if (channel === 'SMS') {
      channels.sms = true;
    }
    // This structure makes it easier to add more channels in the future
    return channels;
  }


  hasReminderOfReservation(): boolean {
    return this.notification_settings.some((ns: { notificationType: string; }) => ns.notificationType === 'REMINDER_OF_RESERVATION');
  }

  isSettingActivated(setting: string): boolean {
    return this.notification_settings.some((s: { notificationType: string; channel: string; }) => s.notificationType === setting && s.channel !== 'NONE');
  }

  async editSms() {
    try {
      const modal = await this.modalController.create({
        component: EditAutoRenewalPage,
      });
  
      await modal.present();
  
      const { data } = await modal.onDidDismiss();
  
      if (data?.success) {
        this.getRemainingSMS();
        this.userService.presentToast('Οι ρυθμίσεις ανανέωσης ενημερώθηκαν επιτυχώς.', 'success');
      } 
    } catch (error) {
    }
  }
  

 

}
