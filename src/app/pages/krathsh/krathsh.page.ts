import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, IonPopover, NavParams, AlertController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { MatChipsModule } from '@angular/material/chips';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ClientProfilePage } from '../client-profile/client-profile.page';
import { NewKrathshPage } from '../new-krathsh/new-krathsh.page';
@Component({
  selector: 'app-krathsh',
  templateUrl: './krathsh.page.html',
  styleUrls: ['./krathsh.page.scss'],
  animations: [
    trigger('buttonAnimation', [
      state('collapsed', style({
        width: '80px',  // replace with the initial width of the button
      })),
      state('expanded', style({
        width: '110px',  // replace with the expanded width of the button
      })),
      transition('collapsed <=> expanded', animate('300ms ease-out'))
    ]),
    trigger('checkmarkAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.5)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in'))
    ]),
  ]
})
export class KrathshPage implements OnInit {
  booking_status = ""
  booking_status_color = ""
  booking_status_icon = ""
  booking_status_color_background = ""
  appointment_id: any;
  appointment: any
  booking_status_class = "custBadge p7";
  text_color: string = "";
  initialized = false;
  appointment_data: any;
  services: any = []
  packages: any = []
  combinedList: any = []
  booking_confirmed: string = "";
  booking_confirmed_class: string = "";
  booking_confirmed_text: string = "";
  second_symbol: string = "";
  status: any;
  booking_completed_class: string = "";
  booking_completed_color: string = "";
  booking_confirmed_color: string = "";
  booking_completed_text: string = "";
  time: string = "";
  date: string = "";
  profile_image: any;
  expert_id: any;
  username: string = "";
  @ViewChild('rejectPop') rejectPop!: IonPopover;
  cancelReason: string = "";
  checkedIn: any;
  canceled: any = false;
  note = ""
  user_id: any = "";
  price: any;
  service: any;

  constructor(private alertController: AlertController, private navParams: NavParams, private actRouter: ActivatedRoute, private rout: Router, private navCtrl: NavController, private userService: UserService, public modalController: ModalController) { }

  ngOnInit(): void {

  }
  ionViewWillEnter() {
    this.resetView()
    this.appointment_id = this.navParams.get('appointment_id');
    this.userService.getAppointment(this.appointment_id).subscribe(data => {
      console.log("RETRIEVEED")
      console.log(data)
      this.date = moment(data.date).locale("el").format('DD-MMM-YYYY')
      this.time = data.time
      this.profile_image = data.image;
      this.user_id = data.userId
      this.username = data.clientName.replace("$", " ");
      this.price = data.price
      this.appointment_data = data;
      this.status = data.status;
      const servicesWithType = data.services.map((service: any) => ({ ...service, type: 'service' }));

      let packagesWithType = [];
      if (data.packages !== undefined) {
        packagesWithType = data.packages.map((packageItem: any) => ({ ...packageItem, type: 'package' }));
      }

      this.combinedList = [...servicesWithType, ...packagesWithType];
      this.combinedList.sort((a: { indexOrder: number; }, b: { indexOrder: number; }) => a.indexOrder - b.indexOrder);
      this.services = data.services;

      console.log("combinedList")
      console.log(this.combinedList)
      this.packages = data.packages

      this.checkedIn = data.checkedIn
      this.note = data.note
      if (data.status == "accepted") {

        this.text_color = "#2dd36f"
        this.booking_status = "Η κράτηση έχει επιβεβαιωθεί.";
        this.booking_status_color = "success";
        this.booking_status_icon = "checkmark-outline";
        this.booking_status_class = "custBadge p7 custItemGreen"
        this.booking_completed_class = "custBadge2 p7 bgM"
        this.booking_completed_color = "medium"
        this.booking_confirmed = "success";
        this.booking_confirmed_class = "custBadge p7 custItemGreen";
        this.booking_confirmed_text = "Η κράτηση έχει επιβεβαιωθεί.";
        this.booking_confirmed_color = "success"
        this.booking_completed_class = "custBadge2 p7 bgM "
        this.booking_completed_color = "medium"
        this.booking_completed_text = "Αναμονή για ολοκλήρωση.";
        this.second_symbol = "M30.5102 103.051L18.931 114.765L13.4902 109.262L13.4901 109.262C13.092 108.86 12.4454 108.86 12.0473 109.262L12.0471 109.263C11.651 109.664 11.6509 110.313 12.0472 110.714L12.0472 110.714L18.208 116.948L18.2081 116.948C18.6065 117.351 19.2527 117.351 19.6511 116.948L19.6512 116.948L31.9528 104.503L31.9529 104.503C32.349 104.102 32.3491 103.453 31.9528 103.052L31.9525 103.051C31.7558 102.853 31.4867 102.744 31.2075 102.75L31.2075 102.75C30.9449 102.756 30.6955 102.864 30.5105 103.051L30.5102 103.051Z";
      } else if (data.status == "canceled") {
        this.booking_status = "Η κράτηση έχει ακυρωθεί.";
        this.booking_status_color = "danger";
        this.booking_status_icon = "close-circle-outline";
        this.booking_status_class = "custBadge p7 cusItemOrang"
        this.text_color = "#eb445a"
        this.booking_confirmed = "danger";
        this.booking_confirmed_color = "danger"
        this.booking_confirmed_class = "custBadge2 p7 cusItemOrang";
        this.booking_confirmed_text = "Η κράτηση έχει ακυρωθεί.";
        this.second_symbol = "M23.441 198.239L30.9995 205.798L29.797 207L22.2385 199.442L14.68 207L13.4775 205.798L21.036 198.239L13.4775 190.681L14.68 189.478L22.2385 197.037L29.797 189.478L30.9995 190.681L23.441 198.239Z";
      } else if (data.status == "pending") {
        this.booking_status = "pending επιβεβαίωση";
        this.booking_status_color = "primary";
        this.booking_status_icon = "time-outline";
        this.booking_status_class = "custBadge p7 cusItemSuccess";
        this.text_color = "#3880ff"
        this.booking_confirmed_text = "Αναμονή για επιβεβαίωση.";
        this.booking_confirmed_class = "custBadge2 p7 bgM"
        this.booking_confirmed_color = "medium"
        this.booking_completed_class = "custBadge2 p7 bgM"
        this.booking_completed_color = "medium"
        this.booking_completed_text = "Αναμονή για ολοκλήρωση.";
        this.second_symbol = "M30.5102 103.051L18.931 114.765L13.4902 109.262L13.4901 109.262C13.092 108.86 12.4454 108.86 12.0473 109.262L12.0471 109.263C11.651 109.664 11.6509 110.313 12.0472 110.714L12.0472 110.714L18.208 116.948L18.2081 116.948C18.6065 117.351 19.2527 117.351 19.6511 116.948L19.6512 116.948L31.9528 104.503L31.9529 104.503C32.349 104.102 32.3491 103.453 31.9528 103.052L31.9525 103.051C31.7558 102.853 31.4867 102.744 31.2075 102.75L31.2075 102.75C30.9449 102.756 30.6955 102.864 30.5105 103.051L30.5102 103.051Z";

      } else if (data.status == "completed") {
        this.booking_status = "Η κράτηση έχει ολοκληρωθεί.";
        this.booking_status_color = "warning";
        this.booking_status_icon = "checkmark-circle-outline";
        this.booking_status_class = "custBadge p7 custItemYellow";
        this.text_color = "#ffc409"
        this.booking_confirmed_text = "Η κράτηση έχει επιβεβαιωθεί.";
        this.booking_confirmed_class = "custBadge2 p7 custItemGreen"
        this.booking_confirmed_color = "success";
        this.booking_completed_class = "custBadge2 p7 custItemGreen";
        this.booking_completed_color = "success";
        this.booking_completed_text = "Η κράτηση ολοκληρώθηκε.";
      }
      this.initialized = true;
    })



  }


  async goToClient() {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        'user_id': this.user_id
      }
    });
    return await modal.present();
  }

  async editReservation() {


    const modal = await this.modalController.create({
      component: NewKrathshPage,
      componentProps: {
        'appointment_id': this.appointment_id,
        'appointment_data': this.appointment_data,
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data === true) {
        // Do something when the modal returns true
        this.ionViewWillEnter()
      }
    });

    return await modal.present();
  }

  async editReservationDialog() {
    const alert = await this.alertController.create({
      header: 'Τροποποίηση Κράτησης',
      message: 'Αν θέλετε να τροποποιήσετε αυτή την κράτηση, πρέπει να την ακυρώσετε και να δημιουργήσετε μία νέα. Θέλετε σίγουρα να ακυρώσετε αυτή την κράτηση;',
      buttons: [
        {
          text: 'Όχι',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
          }
        }, {
          text: 'Ναι',
          handler: () => {
            this.applyRejectPopover()
            this.editReservation()
            // Call the function to cancel the appointment or further actions here.
          }
        }
      ]
    });

    await alert.present();
  }



  resetView() {
    this.appointment_id = null;
    this.date = "";
    this.time = "";
    this.profile_image = null;
    this.username = "";
    this.price = null;
    this.appointment_data = null;
    this.status = null;
    this.service = null;
    this.text_color = "";
    this.booking_status = "";
    this.booking_status_color = "";
    this.booking_status_icon = "";
    this.booking_status_class = "";
    this.booking_completed_class = "";
    this.booking_completed_color = "";
    this.booking_confirmed = "";
    this.booking_confirmed_class = "";
    this.booking_confirmed_text = "";
    this.booking_confirmed_color = "";
    this.booking_completed_text = "";
    this.second_symbol = "";
  }

  openCancelModal() {

  }

  goBack() {
    this.modalController.dismiss()
  }

  closeRejectPopover() {
    this.rejectPop.dismiss()

  }
  openRejectionPopover() {
    this.rejectPop.present()
  }

  applyRejectPopover() {
    this.userService.rejectAppointment(this.appointment_id, this.cancelReason).subscribe(data => {
      this.status = "canceled"
      this.userService.presentToast("Η κράτηση canceled!", "success")
      this.booking_status = "Η κράτηση έχει ακυρωθεί.";
      this.booking_status_color = "danger";
      this.booking_status_icon = "close-circle-outline";
      this.booking_status_class = "custBadge p7 cusItemOrang"
      this.text_color = "#eb445a"
      this.booking_confirmed = "danger";
      this.booking_confirmed_color = "danger"
      this.booking_confirmed_class = "custBadge2 p7 cusItemOrang";
      this.booking_confirmed_text = "Η κράτηση έχει ακυρωθεί.";
      this.second_symbol = "M23.441 198.239L30.9995 205.798L29.797 207L22.2385 199.442L14.68 207L13.4775 205.798L21.036 198.239L13.4775 190.681L14.68 189.478L22.2385 197.037L29.797 189.478L30.9995 190.681L23.441 198.239Z";
      this.userService.setNavData(true);
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.rejectPop.dismiss();
  }

  appendToTextArea(reason: string) {
    this.cancelReason = ""
    this.cancelReason = reason;
  }

  acceptAppointment() {
    this.userService.acceptAppointment(this.appointment_id).subscribe(data => {
      this.status = "accepted"
      this.userService.presentToast("Η κράτηση έγινε accepted!", "success")
      this.text_color = "#2dd36f"
      this.booking_status = "Η κράτηση έχει επιβεβαιωθεί.";
      this.booking_status_color = "success";
      this.booking_status_icon = "checkmark-outline";
      this.booking_status_class = "custBadge p7 custItemGreen"
      this.booking_completed_class = "custBadge2 p7 bgM"
      this.booking_completed_color = "medium"
      this.booking_confirmed = "success";
      this.booking_confirmed_class = "custBadge p7 custItemGreen";
      this.booking_confirmed_text = "Η κράτηση έχει επιβεβαιωθεί.";
      this.booking_confirmed_color = "success"
      this.booking_completed_class = "custBadge2 p7 bgM "
      this.booking_completed_color = "medium"
      this.booking_completed_text = "Αναμονή για ολοκλήρωση.";
      this.second_symbol = "M30.5102 103.051L18.931 114.765L13.4902 109.262L13.4901 109.262C13.092 108.86 12.4454 108.86 12.0473 109.262L12.0471 109.263C11.651 109.664 11.6509 110.313 12.0472 110.714L12.0472 110.714L18.208 116.948L18.2081 116.948C18.6065 117.351 19.2527 117.351 19.6511 116.948L19.6512 116.948L31.9528 104.503L31.9529 104.503C32.349 104.102 32.3491 103.453 31.9528 103.052L31.9525 103.051C31.7558 102.853 31.4867 102.744 31.2075 102.75L31.2075 102.75C30.9449 102.756 30.6955 102.864 30.5105 103.051L30.5102 103.051Z";

    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })

  }

  cancelAppointment() {
    this.rejectPop.present();
  }

  checkIn() {
    this.userService.setNavData(true);
    if (this.checkedIn == "true") {
      this.userService.changeCheckInStatus(this.appointment_id, "false").subscribe(data => {
        this.checkedIn = "false"
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")
      })
    } else {
      this.userService.changeCheckInStatus(this.appointment_id, "true").subscribe(data => {
        this.checkedIn = "true"
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")
      })
    }
  }


}
