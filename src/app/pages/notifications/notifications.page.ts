import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from '../../services/user.service';
import { ReviewsPage } from '../reviews/reviews.page';
import { KrathseisPage } from '../krathseis/krathseis.page';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
})
export class NotificationsPage implements OnInit {
  notifications: any[][] = new Array<any[]>;
  new_notifications: any[][] = new Array<any[]>;
  notifications_length: number = 0;
  new_notifications_length: number = 0;
  page = 0;
  disableInfiniteScroll = false;
  constructor(private route: Router, private userService: UserService, private navCtl: NavController, private modalController: ModalController) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.userService.sseConnect(window.location.toString());

    this.disableInfiniteScroll = false;
    this.page = 0;
    this.notifications.splice(0);
    this.new_notifications.splice(0);
    this.getNotifications();


  }



  goBack() {
    this.modalController.dismiss();
  }



  getNotifications() {
    this.userService.getNotifications(this.page).subscribe(data1 => {
      this.userService.newNotification$.next(false);
      if (data1.length < 10) {
        this.disableInfiniteScroll = true
      }

      for (let i = 0; i < data1.length; i++) {
        data1[i][3] = moment(data1[i][3]).locale("el").format('DD MMM, YYYY')
        data1[i].expert = ""
        data1[i].project_title = ""
        if (data1[i][4] == false) {
          this.new_notifications.push(data1[i]);
        } else if (data1[i][4] == true) {
          this.notifications.push(data1[i]);
        }


      }




    }, err => {


    });
  }

  loadData(event: any) {
    this.page = this.page + 1
    this.getNotifications();
    
    if (this.disableInfiniteScroll) {
      event.target.complete();

    }
  }

  goToSpecificPage(item: any) {

    if (item[0] == "review") {
      this.goToReviews()
    } else if (item[0] == "appointment") {
      this.goToAppointments()
    }
  }

  async goToReviews() {

    const modal = await this.modalController.create({
      component: ReviewsPage,
    });

    return await modal.present();
  }

  async goToAppointments() {

    const modal = await this.modalController.create({
      component: KrathseisPage,
    });

    return await modal.present();
  }
}
