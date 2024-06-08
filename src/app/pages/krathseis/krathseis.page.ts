import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { IonCheckbox, IonModal, IonPopover, ModalController, NavController, NavParams } from '@ionic/angular';
import { KrathshPage } from '../krathsh/krathsh.page';
import { NewKrathshPage } from '../new-krathsh/new-krathsh.page';
import { SearchKrathshPage } from '../search-krathsh/search-krathsh.page';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-krathseis',
  templateUrl: './krathseis.page.html',
  styleUrls: ['./krathseis.page.scss'],
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
export class KrathseisPage implements OnInit {
  token: any;
  initialized = false;
  page: number = 0;
  address: any;
  checkedCountry: any;
  infinite: any;
  krathseis: Array<any> = new Array<any>;
  @ViewChild(IonModal) modal!: IonModal;

  selectedItems: any;
  message!: string;
  categories: any;
  expertAddress: any;
  finalkrathseis: Array<any> = new Array<any>;
  fullListkrathseis: any;
  counter: number = 0;
  disableInfiniteScroll: boolean = false;
  selected: any;
  itemsKrathsh = [
    { value: 'pending', selected: false },
    { value: 'completed', selected: false },
    { value: 'accepted', selected: false },
    { value: 'canceled', selected: false },
    { value: 'noshow', selected: false },

  ];
  tempItemsKrathsh = [
    { value: 'pending', selected: false },
    { value: 'completed', selected: false },
    { value: 'accepted', selected: false },
    { value: 'canceled', selected: false },
    { value: 'noshow', selected: false },

  ];


  allChipClass: string = "selected-chip";
  krathshChip: string = "not-selected-chip"
  krathseistatus = "0,0,0,0,0"

  @ViewChild('krathshPop') krathshPop!: IonPopover;
  @ViewChild('rejectPop') rejectPop!: IonPopover;


  tempWidget: boolean = false;
  krathshChipIconCOlor: string = "light";
  proposalChipIconColor: string = "light"
  tempRangeValue: number = 20;
  krathshPopoverValues = {
    itemsKrathsh: this.itemsKrathsh
  };


  krathshIds: string[] = [];
  mode: string = "upcoming";
  cancelReason: string = "";
  reloadAppointments: any = false;
  constructor(private route: ActivatedRoute,  private rout: Router, private userService: UserService, private navCtrl: NavController, private modalController: ModalController) {
  }
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.userService.sseConnect(window.location.toString());
    this.krathseis = [];
    this.krathshIds = [];
    this.resetFilters()
    this.krathseistatus = '0,0,0,0,0';
    let status=this.userService.getNavData()
    this.userService.setNavData("");
    // Check for parameters passed via the router and query parameters
   

    console.log(status)
    if (status == "pending") {
      this.krathseistatus = "1,0,0,0,0"
      this.itemsKrathsh[0].selected = true;
      this.itemsKrathsh[1].selected = false;
      this.itemsKrathsh[2].selected = false;
      this.itemsKrathsh[3].selected = false;
      this.itemsKrathsh[4].selected = false;

      this.krathshChip = "selected-chip";
      this.krathshChipIconCOlor = "primary";
      this.allChipClass = "not-selected-chip";
    }
    this.disableInfiniteScroll = false;
    this.page = 0;

    this.getKrathseis();
  }


  isMobile() {
    return this.userService.isMobile();
  }
  appendToTextArea(reason: string) {
    this.cancelReason = "";
    setTimeout(() => { this.cancelReason = reason; }, 0);
  }

  closeRejectPopover() {
    this.rejectPop.dismiss()

  }
  openRejectionPopover(event: any, krathsh: any) {
    event.stopPropagation();
    this.rejectPop.present();
  }


  applyRejectPopover(appointment: any) {
    this.userService.rejectAppointment(appointment[0], this.cancelReason).subscribe(data => {

      appointment[2] = "canceled"


      this.userService.presentToast("Η κράτηση ακυρώθηκε!", "success")
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.rejectPop.dismiss();

  }


  notif() {
    if (localStorage.getItem('authenticated') == "true") {

      this.rout.navigate(['notifications']);
    } else {
      this.rout.navigate(['login']);

    }
  }



  goBack() {
    this.modalController.dismiss(this.reloadAppointments)
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
      if (dataReturned && dataReturned.data) {
        this.reloadAppointments = true
        this.page = 0;
        this.krathseis = []
        this.getKrathseis();

      }

    });
    return await modal.present();
  }

  async newKrathsh() {
    const modal = await this.modalController.create({
      component: NewKrathshPage,
      backdropDismiss: false

    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned !== null) {
        this.reloadAppointments = true

        // Your logic here, 'dataReturned' is the data returned from modal
        this.page = 0;
        this.krathseis = []
        this.getKrathseis();
      }
    });

    return await modal.present();
  }

  async searchKrathsh() {
    const modal = await this.modalController.create({
      component: SearchKrathshPage,

    });
    return await modal.present();
  }




  loadData(event: any) {
    this.page = this.page + 1;
    this.getKrathseis();
    //this.getActivekrathseis((this.range_value*1000).toString(),this.categories);
    this.counter = 0;
    event.target.complete();
  }



  getKrathseis() {
    this.userService.getAppointments(this.krathseistatus, this.page, this.mode).subscribe(data => {
      for (let k = 0; k < data.length; k++) {
        data[k][11] = data[k][3]
        data[k][3] = moment(data[k][3]).locale("el").format('Do MMM, h:mm a');
        data[k][4] = data[k][4].split('$')[0] + " " + data[k][4].split('$')[1]
        this.krathseis.push(data[k])
      }


      this.initialized = true;
    }, err => {
      if (err.error.text == 'No more data') {
        this.disableInfiniteScroll = true;
      }
      this.initialized = true;


    });

  }
  segmentChanged(event: any) {
    switch (event.detail.value) {
      case 'upcoming':
        this.mode = "upcoming"
        break;
      case 'new':
        this.mode = "new"
        break;
      default:
        this.mode = "upcoming"
    }
    this.page = 0
    this.disableInfiniteScroll = false;
    this.krathseis = []
    this.getKrathseis();

  }




  handleRefresh(event: any) {
    window.location.reload();

  }

  toggleItem(item: any) {

    item.selected = !item.selected
  }




  isAfterOneHourAgo(appointment: any): boolean {

    const foundAppointment = this.krathseis.find(a => a[0] === appointment[0]);
    if (!foundAppointment) {
      return false;
    }
    const appointmentStartTime = new Date(foundAppointment[11]);
    const currentDate = new Date(); // The current time
    const oneHourFromNow = new Date(currentDate.getTime() + 3600000); // One hour from the current time



    // Check if the appointment start time is before or exactly at the current time or within the next hour
    const hasAlreadyStarted = appointmentStartTime <= currentDate;
    const isStartingSoon = appointmentStartTime > currentDate && appointmentStartTime <= oneHourFromNow;
    const isStartingSoonOrAlreadyStarted = hasAlreadyStarted || isStartingSoon;


    return isStartingSoonOrAlreadyStarted; // Return true if the appointment has already started or is about to start within the next hour
  }





  openKrathshPopover() {
    // Ensure itemsKrathsh reflects the current krathseistatus
    const statusArray = this.krathseistatus.split(',').map(status => status === "1");

    this.itemsKrathsh = this.itemsKrathsh.map((item, index) => {
      item.selected = statusArray[index];
      return item;
    });

    const itemsKrathshCopy = JSON.parse(JSON.stringify(this.itemsKrathsh));
    this.krathshPopoverValues = {
      itemsKrathsh: itemsKrathshCopy,
    };
    this.krathshPop.present();
  }



  applyKrathshPopover() {
    this.page = 0;

    let temp = "";
    for (let i = 0; i < this.itemsKrathsh.length; i++) {
      if (i == this.itemsKrathsh.length - 1) {
        temp += this.itemsKrathsh[i].selected ? "1" : "0";
      } else {
        temp += this.itemsKrathsh[i].selected ? "1," : "0,";
      }
    }
    this.krathseistatus = temp;
    this.tempItemsKrathsh = JSON.parse(JSON.stringify(this.itemsKrathsh));

    this.krathseis = [];
    this.krathshIds = [];
    if (this.krathseistatus.includes("1")) {
      this.krathshChip = "selected-chip";
      this.krathshChipIconCOlor = "primary";
      this.allChipClass = "not-selected-chip";
    } else {
      this.krathshChip = "not-selected-chip";
      this.krathshChipIconCOlor = "light";
      this.allChipClass = "selected-chip";
    }
    this.getKrathseis();

    this.krathshPop.dismiss();
  }


  closeKrathshPopover() {
    this.itemsKrathsh = JSON.parse(JSON.stringify(this.krathshPopoverValues.itemsKrathsh));
    this.krathshPopoverValues.itemsKrathsh = []
    this.krathshPop.dismiss();
  }

  resetFilters() {
    this.page = 0;
    this.krathshIds = []
    this.krathseis = []
    this.allChipClass = "selected-chip";
    this.krathshChip = "not-selected-chip"
    this.krathseistatus = "0,0,0,0,0"
    for (let i = 0; i < this.itemsKrathsh.length; i++) {
      this.itemsKrathsh[i].selected = false;
      this.tempItemsKrathsh[i].selected = false
    }
    this.getKrathseis();
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



  getColorForStatus(status: string): string {

    switch (status) {
      case 'canceled':
        return 'danger-line cursor w100 rad10 ion-margin-bottom ';
      case 'completed':
        return 'warning-line cursor w100 rad10 ion-margin-bottom ';
      case 'accepted':
        return 'success-line cursor w100 rad10 ion-margin-bottom';
      case 'pending':
        return 'pending-line cursor w100 rad10 ion-margin-bottom';
      case 'noshow':
        return 'noshow-line cursor w100 rad10 ion-margin-bottom';
      default:
        return 'pending-line cursor w100 rad10 ion-margin-bottom';
    }
  }
  getDate(datetime: string): string {
    return moment(datetime, 'Do MMM, h:mm a', 'el').format('D MMM, YYYY');
  }

  getTime(datetime: string): string {
    return moment(datetime, 'Do MMM, h:mm a', 'el').format('h:mm a');
  }

  checkIn(krathsh: any) {
    this.reloadAppointments = true
    if (krathsh[5] == "true") {
      this.userService.changeCheckInStatus(krathsh[0], "false").subscribe(data => {
        krathsh[5] = "false"

      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")
      })

    } else {
      this.userService.changeCheckInStatus(krathsh[0], "true").subscribe(data => {
        krathsh[5] = "true"

      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

      })


    }
  }


  acceptAppointment(event: Event, appointment: any) {
    event.stopPropagation();

    this.userService.acceptAppointment(appointment[0]).subscribe(data => {
      appointment[2] = "accepted"
      this.userService.presentToast("Η κράτηση έγινε αποδεκτή!", "success")






    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })

  }







}
