import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonPopover, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { KrathshPage } from '../krathsh/krathsh.page';
import * as moment from 'moment';

@Component({
  selector: 'app-search-krathsh',
  templateUrl: './search-krathsh.page.html',
  styleUrls: ['./search-krathsh.page.scss'],
})
export class SearchKrathshPage implements OnInit {
  searchTerm = '';
  page = 0;
  krathseis: Array<any> = new Array<any>;
  @ViewChild('acceptPop') acceptPop!: IonPopover;
  @ViewChild('rejectPop') rejectPop!: IonPopover;
  cancelReason: string = "";
  disableInfiniteScroll: boolean = false;

  constructor(private modalController: ModalController, private userService: UserService) { }

  ngOnInit() {
  }


  onSearch(eve: any) {
    this.page = 0
    this.krathseis = []
    if (this.searchTerm != '') {
      this.searchKrathsh();

    }
    if (eve.detail.value.length == 0) {
      return null;
    }
    return null;
  }

  goBack() {
    this.modalController.dismiss()
  }

  searchKrathsh() {

    this.userService.searchAppointment(this.searchTerm, this.page).subscribe(data => {
      for (let k = 0; k < data.length; k++) {
        data[k][3] = moment(data[k][3]).locale("el").format('Do MMM , h:mm a')
        data[k][5] = data[k][5].split('$')[0] + " " + data[k][5].split('$')[1]
        this.krathseis.push(data[k])
      }
    })
  }

  async goToKrathsh(item: any) {
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': item
      }
    });
    return await modal.present();
  }

  getColorForStatus(status: string): string {
    console.log(status)
    switch (status) {
      case 'Ακυρώθηκε':
        return 'danger';
      case 'Ολοκληρωμένη':
        return 'warning';
      case 'Αποδεκτή':
        return 'success';
      case 'Εκκρεμεί':
        return 'primary';
      default:
        return 'medium';
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
          this.krathseis[i][2] = "Αποδεκτή"
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
          this.krathseis[i][2] = "Ακυρώθηκε"
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

  loadData(event: any) {
    this.page = this.page + 1;
    this.searchKrathsh();
    //this.getActivekrathseis((this.range_value*1000).toString(),this.categories);
    event.target.complete();
  }

}


