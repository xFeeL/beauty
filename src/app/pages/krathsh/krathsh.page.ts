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

  status: any;

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
  start: string | number | Date="";
  reload: any=false;

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
      this.start=data.start
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
      this.packages = data.packages

      this.checkedIn = data.checkedIn
      this.note = data.note
      if (data.status == "accepted") {

        this.text_color = "#2dd36f"
        if (data.checkedIn == "false") {
          this.booking_status = "Η κράτηση έχει επιβεβαιωθεί.";
        } else {
          this.booking_status = "Η κράτηση έχει φτάσει.";
        }
        this.booking_status_color = "success";
        this.booking_status_icon = "checkmark-outline";
        this.booking_status_class = "custBadge p7 custItemGreen"
       } else if (data.status == "canceled") {
        this.booking_status = "Η κράτηση έχει ακυρωθεί.";
        this.booking_status_color = "danger";
        this.booking_status_icon = "close-circle-outline";
        this.booking_status_class = "custBadge p7 cusItemOrang"
        this.text_color = "#eb445a"
       } else if (data.status == "pending") {
        this.booking_status = "Εκκρεμεί επιβεβαίωση";
        this.booking_status_color = "primary";
        this.booking_status_icon = "time-outline";
        this.booking_status_class = "custBadge p7 cusItemSuccess";
        this.text_color = "#3880ff"
        
      } else if (data.status == "completed") {
        this.booking_status = "Η κράτηση έχει ολοκληρωθεί.";
        this.booking_status_color = "warning";
        this.booking_status_icon = "checkmark-circle-outline";
        this.booking_status_class = "custBadge p7 custItemYellow";
        this.text_color = "#ffc409"
      }  else if (data.status == "noshow") {
        this.booking_status = "Η κράτηση δεν εμφανίστηκε.";
        this.booking_status_color = "dark";
        this.booking_status_icon = "alert-circle-outline";
        this.booking_status_class = "custBadge p7 custItemBlack";
        this.text_color = "#000000"

      }
      console.log("The combined list is")
      console.log(this.combinedList)
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
        this.reload=true

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


  isAfterOneHourAgo(): boolean {
   
    const appointmentStartTime = new Date(this.start);
    const currentDate = new Date();
    const appointmentStartTimeMinusOneHour = new Date(appointmentStartTime.getTime() - 3600000);
    const isAfterToday = appointmentStartTime.getFullYear() > currentDate.getFullYear() ||
                         (appointmentStartTime.getFullYear() === currentDate.getFullYear() && appointmentStartTime.getMonth() > currentDate.getMonth()) ||
                         (appointmentStartTime.getFullYear() === currentDate.getFullYear() && appointmentStartTime.getMonth() === currentDate.getMonth() && appointmentStartTime.getDate() > currentDate.getDate());
    if (isAfterToday) {
        return true;
    }
    const isCurrentTimeAfterAppointmentTimeMinusOneHour = currentDate.getTime() > appointmentStartTimeMinusOneHour.getTime();
    if (isCurrentTimeAfterAppointmentTimeMinusOneHour) {
        return false;
    }
    return true;
}

noShow() {
  this.reload=true;

  this.userService.noShow(this.appointment_id).subscribe(data => {

    this.userService.presentToast("Η κράτηση ενημερώθηκε!", "success")
    this.ionViewWillEnter()

  }, err => {
    this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

  })
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
  
  }

  openCancelModal() {

  }

  goBack() {
    this.modalController.dismiss(this.reload)
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
      this.userService.presentToast("Η κράτηση ακυρώθηκε!", "success")
      this.booking_status = "Η κράτηση έχει ακυρωθεί.";
      this.booking_status_color = "danger";
      this.booking_status_icon = "close-circle-outline";
      this.booking_status_class = "custBadge p7 cusItemOrang"
      this.text_color = "#eb445a"
  
      this.userService.setNavData(true);
      this.reload=true

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
    
      this.reload=true

    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })

  }

  cancelAppointment() {
    this.rejectPop.present();
  }

  checkIn() {
    this.reload=true
    this.userService.setNavData(true);
    if (this.checkedIn == "true") {
      this.userService.changeCheckInStatus(this.appointment_id, "false").subscribe(data => {
        this.checkedIn = "false"
        if (this.status != "accepted") {
          
          this.ionViewWillEnter()
        }else{
          if (this.checkedIn == "false") {
            this.booking_status = "Η κράτηση έχει επιβεβαιωθεί.";
          } else {
            this.booking_status = "Η κράτηση έχει φτάσει.";
          }
        }
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")
      })
    } else {
      this.userService.changeCheckInStatus(this.appointment_id, "true").subscribe(data => {
        this.checkedIn = "true"
        if (this.status != "accepted") {
          this.ionViewWillEnter()
        }else{
          if (this.checkedIn == "false") {
            this.booking_status = "Η κράτηση έχει επιβεβαιωθεί.";
          } else {
            this.booking_status = "Η κράτηση έχει φτάσει.";
          }
        }
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")
      })
    }
  }


}
