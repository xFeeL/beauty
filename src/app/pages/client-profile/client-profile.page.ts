import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonPopover, ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { KrathshPage } from '../krathsh/krathsh.page';
import { ChatPage } from '../chat/chat.page';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.page.html',
  styleUrls: ['./client-profile.page.scss'],
})
export class ClientProfilePage implements OnInit {
  userId: any;
  type: any = 'projects'
  prosfores: Array<any> = new Array<any>;
  userData: any = new Array<any>;
  reviews: Array<any> = new Array<any>;
  initialized = false;
  name: any;
  page: number = 0;
  expertReviewsData: string[][] = [[""], [""]];
  expertImage: any;
  stars_array_size = Array(5).fill(4); // [4,4,4,4,4]
  expert: any;
  krathseis: Array<any> = new Array<any>;
  @ViewChild('acceptPop') acceptPop!: IonPopover;
  @ViewChild('rejectPop') rejectPop!: IonPopover;
  cancelReason: string = "";
  disableInfiniteScroll: boolean = false;
  needReload: boolean = false;
  numberOfReservations = 0
  historyNotAvailable: boolean=false;
  constructor(public alertController: AlertController, private modalController: ModalController, private actRouter: ActivatedRoute, private userService: UserService, private route: Router, private navParams: NavParams) { }
  @ViewChild(MatMenuTrigger) manualClientMenu!: MatMenuTrigger;
  ngOnInit() {

  }

  ionViewWillEnter() {
    this.userData[0] = new Array<any>
    this.userService.sseConnect(window.location.toString());
    let data = this.navParams.get('user_id');
    this.userId = data;
    this.userService.getExpertData().subscribe(data => {
      this.expert = data
      
    })
   
    this.getUserData();
    this.getReservations();


  }

  openManualClientMenu() {
    this.manualClientMenu.openMenu();
  }
  
  getReviewsByUserId() {
    this.userService.getExpertReviewsData().subscribe(data => {


      this.expertReviewsData = data
      this.expertImage = data[1]

    }, err => {

    })
    this.userService.getReviewsByUserId(this.userId).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        data[i][9] = ""
        data[i][10] = false
        data[i][2] = moment(data[i][2]).locale("el").format('DD MMM, YYYY')
        data[i][4] = moment(data[i][4]).locale("el").format('DD MMM, YYYY')
      }

      this.reviews = data;
    }, err => {

    })
  }

  getReservations() {
    this.userService.getUserReservations(this.page, this.userId).subscribe(data => {
      for (let k = 0; k < data.length; k++) {
        data[k][3] = moment(data[k][3]).locale("el").format('Do MMM, h:mm a');

        let services = data[k][5].split(',');
        if (services.length === 1) {
          data[k][5] = services[0].trim();
        } else {
          data[k][5] = services.length + " υπηρεσίες";
        }

        this.krathseis.push(data[k]);
      }
    }, err => {
    
      // Handle the error here
    });
  }



  getDate(datetime: string): string {
    return moment(datetime).locale('el').format('D-MMM-YY');
  }

  getTime(datetime: string): string {
    return moment(datetime).locale('el').format('h:mm a');
  }




  getUserData() {
    this.userService.getUserData(this.userId).subscribe(data => {
      this.userData = data;
      
      if (this.userData.name) {
        this.name = this.userData.name.split('$')
      }
      if (this.userData.revenue === "NOT_VISIBLE") {
        this.historyNotAvailable = true;
      }
      this.initialized = true;
    }, err => {
      // Handle error
    });
  }

  numSequence(n: any): Array<any> {
    return Array(n);
  }



  async goToChat() {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        'user_id': this.userId
      }
    });

    return await modal.present();
  }

  goBack() {
    this.modalController.dismiss(this.needReload)
  }


  goToProposal(item: any) {
    this.route.navigateByUrl('/ergasia?project_id=' + item.ergasiaId)

  }

  sendResponse(review: any) {
    
    this.userService.sendResponseToReview(review[9], review[5]).subscribe(data => {
      this.userService.presentToast("Η απάντηση σας ανέβηκε με επιτυχία!", "success");
      this.getReviewsByUserId();
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά.", "danger");

    })
  }

  loadData(event: any) {
    this.page = this.page + 1;
    this.getReservations();
    //this.getActivekrathseis((this.range_value*1000).toString(),this.categories);
    event.target.complete();
  }




  async goToKrathsh(item: any) {
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': item
      }
    });
    modal.onWillDismiss().then((dataReturned) => {
      // Your logic here, 'dataReturned' is the data returned from modal
      if (this.userService.getNavData() == true) {
        this.page = 0;
        this.krathseis = []
        this.getReservations();

      }

    });
    return await modal.present();
  }

  getColorForStatus(status: string): string {
    switch (status) {
      case 'canceled':
        return 'danger-line';
      case 'pending':
        return 'warning-line';
      case 'completed':
        return 'success-line';
      case 'accepted':
        return 'pending-line';
      case 'noshow':
        return 'noshow-line';
      default:
        return 'pending-line';
    }
  }

  getStatusTextInGreek(status: string): string {
    switch (status) {
      case 'canceled':
        return 'Ακυρώθηκε';
      case 'completed':
        return 'Ολοκληρώθηκε';
      case 'accepted':
        return 'Εγκρίθηκε';
      case 'pending':
        return 'Εκκρεμεί';
      case 'noshow':
        return 'Δεν εμφανίστηκε';
      default:
        return ''; // Or any default text
    }
  }



  openAcceptPopover() {
    this.cancelReason = ""

    this.acceptPop.present()
  }

  closeAcceptPopover() {
    this.acceptPop.dismiss()

  }
  applyAcceptPopover(appointment: string) {
    this.userService.acceptAppointment(appointment).subscribe(data => {
      for (let i = 0; i < this.krathseis.length; i++) {
        if (appointment == this.krathseis[i][0]) {
          this.krathseis[i][2] = "accepted"
          break;
        }
      }
      this.userService.presentToast("Η κράτηση έγινε αποδεκτή!", "success")
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.acceptPop.dismiss()

  }

  closeRejectPopover() {
    this.rejectPop.dismiss()

  }
  openRejectionPopover() {
    this.rejectPop.present()
  }

  applyRejectPopover(appointment: string) {
    this.userService.rejectAppointment(appointment, this.cancelReason).subscribe(data => {
      for (let i = 0; i < this.krathseis.length; i++) {
        if (appointment == this.krathseis[i][0]) {
          this.krathseis[i][2] = "canceled"
          break;
        }
      }
      this.userService.presentToast("Η κράτηση ακυρώθηκε!", "success")
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.rejectPop.dismiss();
    this.acceptPop.dismiss();

  }

  appendToTextArea(reason: string) {
    this.cancelReason = ""
    this.cancelReason = reason;
  }


  // client-profile.page.ts

async editClient() {
  const alert = await this.alertController.create({
    header: 'Επεξεργασία Πελάτη',
    inputs: [
      {
        name: 'name',
        type: 'text',
        placeholder: 'Όνομα Πελάτη',
        value: this.name[0] + " " + (this.name[1] || "") // Handle cases where name[1] might be undefined
      },
      {
        name: 'phone',
        type: 'tel',
        placeholder: 'Τηλέφωνο Πελάτη',
        value: this.userData.phone || '' // Allow empty value
      },
      {
        name: 'email',
        type: 'email',
        placeholder: 'Email Πελάτη',
        value: this.userData.email || '' // Allow empty value
      }
    ],
    buttons: [
      {
        text: 'Ακυρο',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          // Optional: Any action on cancel
        }
      }, {
        text: 'Αποθηκευση',
        handler: (data) => {
          // Trim inputs
          const name = data.name ? data.name.trim() : '';
          const phone = data.phone ? data.phone.trim().replace(/\s+/g, '') : '';
          const email = data.email ? data.email.trim() : '';

          // Validate name (required)
          if (!name) {
            this.userService.presentToast("Το όνομα είναι υποχρεωτικό.", "danger");
            return false; // Prevent the alert from dismissing
          }

          // Validate email format if provided
          if (email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
              this.userService.presentToast("Παρακαλώ εισάγετε ένα έγκυρο email.", "danger");
              return false; // Prevent the alert from dismissing
            }
          }

          // Validate phone format if provided
          if (phone) {
            const phoneRegex = /^(?:\+30|0)\d{9,10}$/; // Example regex for Greek phone numbers
            if (!phoneRegex.test(phone)) {
              this.userService.presentToast("Ο αριθμός τηλεφώνου πρέπει να έχει τη μορφή +306999999999.", "danger");
              return false; // Prevent the alert from dismissing
            }
          }

          // Update the client data
          this.userService.editManualClient(this.userId, name, phone, email).subscribe(
            res => {
              // Update name parts
              const nameParts = name.split(" ");
              this.name[0] = nameParts[0] || '';
              this.name[1] = nameParts[1] || '';

              // Update phone and email in userData
              if (phone) {
                this.userData.phone = phone;
              }
              if (email) {
                this.userData.email = email;
              }

              this.userService.presentToast("Οι αλλαγές αποθηκεύτηκαν με επιτυχία.", "success");
              this.needReload = true;
            },
            err => {
              if (err.error.errorReturned === "phone") {
                this.userService.presentToast("Ο αριθμός τηλεφώνου πρέπει να έχει τη μορφή 6999999999 ή +306999999999.", "danger");
              } else if (err.error.errorReturned === "name") {
                this.userService.presentToast("Το όνομα δεν μπορεί να περιέχει ειδικούς χαρακτήρες.", "danger");
              } else if (err.error.errorReturned === "email") {
                this.userService.presentToast("Παρακαλώ εισάγετε ένα έγκυρο email.", "danger");
              } else if (err.error.errorReturned === "server_error") {
                this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά.", "danger");
              } else {
                this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά.", "danger");
              }
            }
          );

          // Return true to allow the alert to dismiss after initiating the update
          return true;
        }
      }
    ]
  });

  await alert.present();
}

  
}


