import { Component, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import { OneSignal } from 'onesignal-ngx';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-notification-prompt',
  templateUrl: './notification-prompt.page.html',
  styleUrls: ['./notification-prompt.page.scss'],
})
export class NotificationPromptPage implements OnInit {

  constructor(private userService:UserService,private platform: Platform, private oneSignal: OneSignal, private modalController: ModalController) {
    console.log('NotificationPromptPage Constructor initialized');
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
  }

  // Function to handle enabling notifications
  turnOnNotifications() {
    console.log('turnOnNotifications called');
    this.triggerOneSignalPrompt();
  }

  // Function to close the modal
  dismiss() {
    console.log('Dismiss called');
    this.modalController.dismiss();
  }

  // Trigger prompt and dismiss modal after prompt is accepted
  triggerOneSignalPrompt() {
    this.oneSignal.Slidedown.promptPush()
    .then(() => {
      console.log('Prompt triggered successfully');
      this.dismiss(); // Dismiss modal only after the prompt is accepted
      this.userService.getExpertId().subscribe(data => {
        this.oneSignal.login(data.id);
        const hasAcceptedNotifications = localStorage.getItem('pushNotificationsAccepted');
        localStorage.setItem('pushNotificationsAccepted', 'true');
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger");
      });

    })
    .catch((error) => console.error('Error triggering prompt:', error));
  }
}
