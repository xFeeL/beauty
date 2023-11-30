import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, IonPopover, ModalController, NavParams } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { KrathshPage } from '../krathsh/krathsh.page';
import { ChatPage } from '../chat/chat.page';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.page.html',
  styleUrls: ['./client-profile.page.scss'],
})
export class ClientProfilePage implements OnInit {
  userId: any;
  type: any = 'projects'
  prosfores: Array<any> = new Array<any>;
  userData:any = new Array<any>;
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
  constructor(public alertController: AlertController, private modalController: ModalController, private actRouter: ActivatedRoute, private userService: UserService, private route: Router, private navParams: NavParams) { }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.userData[0] = new Array<any>
    this.userService.sseConnect(window.location.toString());
    let data = this.navParams.get('user_id');
    this.userId = data;
    this.userService.getExpertData().subscribe(data => {
      this.expert = data
      console.log(data)
    })
    this.userService.getNumberOfReservationsClient(this.userId).subscribe(data => {
      this.numberOfReservations = data
    }, err => {

    })
    this.getUserData();
    this.getReservations();


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
      this.name = this.userData.name.split('$')
      console.log(data)
      this.initialized = true;
    }, err => {

    })
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
    console.log(review)
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
      case 'completed':
        return 'warning-line';
      case 'accepted':
        return 'success-line';
      case 'pending':
        return 'pending-line';
      default:
        return 'pending-line';
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
      this.userService.presentToast("Η κράτηση έγινε accepted!", "success")
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
      this.userService.presentToast("Η κράτηση canceled!", "success")
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


  async editClient() {
    const alert = await this.alertController.create({
      header: 'Επεξεργασία Πελάτη',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Όνομα Πελάτη',
          // Assuming 'client' is your data object
          value: this.name[0] + " " + this.name[1] // or wherever you store the client's current name
        },
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Τηλέφωνο Πελάτη',
          value: this.userData.phone // or wherever you store the client's current phone number
        }
      ],
      buttons: [
        {
          text: 'Ακυρο',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Edit canceled');
          }
        }, {
          text: 'Αποθηκευση',
          handler: (data) => {
            // Update the client data
            this.userService.editManualClient(this.userId, data.name, data.phone).subscribe(res => {
              this.name[0] = data.name.split(" ")[0];
              this.name[1] = data.name.split(" ")[1];

              this.userData.phone = data.phone;
              this.userService.presentToast("Οι αλλαγές αποθηκεύτηκαν με επιτυχία.", "success")
              this.needReload = true
            }, err => {
              console.log(err)
              if (err.error == "phone") {
                this.userService.presentToast("Ο αριθμός τηλεφώνου πρέπει να έχει τη μορφή 6999999999 ή +306999999999.", "danger")
              } else if (err.error == "name") {
                this.userService.presentToast("Το όνομα δεν μπορεί να περιέχει ειδικούς χαρακτήρες.", "danger")

              }
            })


            // If needed, you can then save this data to your backend or database here

            // console.log('Client updated:', this.client);
          }
        }
      ]
    });

    await alert.present();
  }
}


