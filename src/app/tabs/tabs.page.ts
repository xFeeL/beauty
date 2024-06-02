import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  newNotifications: boolean=false;
  newMessages: boolean=false;

  constructor(private userService: UserService) { }

  ionViewWillEnter() {


    this.userService.checkForNotifications().subscribe(data => {
      if (data.hasNewNotifications == true) {
        this.userService.newNotification$.next(true);
        this.newNotifications=true
      } else {
        this.userService.newNotification$.next(false);
        this.newNotifications=false

      }
      if (data.hasNewMessages == true) {
        this.userService.newMessage$.next(true);
        this.newMessages=true

      } else {
        this.userService.newMessage$.next(false);
        this.newMessages=false


      }
    })
  }


}
