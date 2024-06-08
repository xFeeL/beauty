import { Component } from '@angular/core';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  newNotifications: boolean=false;
  newMessages: boolean=false;
  private hasNewNotificationsSubscription: Subscription;
  private newMessageSubscription: Subscription;

  constructor(private menu: MenuController,private rout:Router,private userService: UserService) {
    this.hasNewNotificationsSubscription = this.userService.newNotification$.subscribe(hasNewNotif => {
      this.newNotifications = hasNewNotif

    });

    this.newMessageSubscription = this.userService.newMessage$.subscribe((newMessage) => {
      
      
      this.newMessages = newMessage
    });
   }

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

 openMenu() {
    this.menu.open();
  }

}
