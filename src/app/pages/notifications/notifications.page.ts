import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from '../../services/user.service';
import { ReviewsPage } from '../reviews/reviews.page';
import { KrathseisPage } from '../krathseis/krathseis.page';
import { KrathshPage } from '../krathsh/krathsh.page';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class NotificationsPage implements OnInit {
  notifications: any = [];
  new_notifications: any = [];
  notifications_length: number = 0;
  new_notifications_length: number = 0;
  page = 0;
  disableInfiniteScroll = false;
  isMobile: boolean=false;
  constructor(
    private router: Router, 
    private route: Router, 
    private userService: UserService, 
    private navCtl: NavController, 
    private modalController: ModalController,
    private cdr: ChangeDetectorRef  // add this line
  ) {
    this.isMobile = this.userService.isMobile();
  }
  
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



  getNotifications(event?: any) {
    this.userService.getNotifications(this.page).subscribe(data1 => {
      this.userService.newNotification$.next(false);
  
      if (data1.length < 10) {
        this.disableInfiniteScroll = true;
      }
  
      data1.forEach((notification: { datetime: moment.MomentInput; expert: string; text: string; type: string; status: any; user_name: any; project_title: string; is_read: boolean; }) => {
        notification.datetime = moment(notification.datetime).locale("el").format('DD MMM, YYYY');
        notification.expert = "";
        notification.text = "";
  
        if (notification.type == "appointment") {
          switch (notification.status) {
            case "APPOINTMENT_NEW":
              notification.text = "Έχετε νέες κράτησεις που χρειάζονται επιβεβαίωση.";
              break;
            case "APPOINTMENT_ACCEPTED":
              notification.text = `${notification.user_name}: Νέα κράτηση!`;
              break;
            case "APPOINTMENT_CANCELLED":
              notification.text = `${notification.user_name}: Η κράτηση ακυρώθηκε από τον χρήστη.`;
              break;
            case "APPOINTMENT_UPDATED":
              notification.text = `${notification.user_name}: Η κράτηση άλλαξε από τον χρήστη. Επιλέξτε για να δείτε λεπτομέρειες.`;
              break;
          }
        }
  
        notification.project_title = "";
        if (notification.is_read == false) {
          this.new_notifications.push(notification);
        } else {
          this.notifications.push(notification);
        }
      });
  
      if (event) {
        event.target.complete();
      }
      this.cdr.markForCheck();  // add this line
    }, err => {
      if (event) {
        event.target.complete();
      }
    });
  }
  


  loadData(event: any) {
    this.page += 1;
    this.getNotifications(event);

    if (this.disableInfiniteScroll) {
      event.target.complete();
    }
  }

  goToSpecificPage(item: any) {

    if (item.type == "review") {
      this.goToReviews()
    } else if (item.type == "appointment") {
      if (item.status == 'APPOINTMENT_NEW') {
        this.goToPendingAppointments()
      } else {
        this.goToAppointment(item.reference_id)
      }
    }
  }

  

  async goToReviews() {

    const modal = await this.modalController.create({
      component: ReviewsPage,
    });

    return await modal.present();
  }

  async goToPendingAppointments() {
    this.userService.setNavData("pending")
    if (this.isMobile) {
      this.route.navigate(['/tabs/krathseis']);

    } else {

     const modal = await this.modalController.create({
      component: KrathseisPage,

    });

    return await modal.present();
  }
  }

  async goToAppointment(appointment_id: string) {

    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': appointment_id
      }
    });

    return await modal.present();
  }
}
