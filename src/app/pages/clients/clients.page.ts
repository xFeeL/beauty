import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { ClientProfilePage } from '../client-profile/client-profile.page';
import { ChatPage } from '../chat/chat.page';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {
  clients: Array<any> = new Array<any>;
  clients_length: any;
  disableInfiniteScroll: boolean = false;
  loadingClients = false
  constructor(private route: Router, private userService: UserService, private modalController: ModalController) { }
  searchTerm = '';
  page = 0;
  
  ngOnInit() {
  }

  ionViewWillEnter() {
   

    this.disableInfiniteScroll = false;
    this.page = 0;
    this.clients.splice(0);
    this.searchTerm = '';

    this.getClients();
    this.page = this.page + 1;
    this.getClients()
    this.userService.sseConnect(window.location.toString());

  }


  loadData(event: any) {
    this.page = this.page + 1;
    this.getClients()
    event.target.complete();
  }

  getClients() {
    this.loadingClients = true;
    this.userService.getAllClients(this.page).subscribe(data => {

      if (data.length == 0) {
        this.disableInfiniteScroll = true;

      } else {
        for (let j = 0; j < data.length; j++) {
          data[j].name = data[j].name.replace("$", " ")
          this.clients.push(data[j]);
        }

      }

      this.loadingClients = false;

    }, err => {
      this.loadingClients = false;

    })
  }


  goBack() {
    this.modalController.dismiss()
  }

  onSearch(eve: any) {
    if (eve.detail.value.length == 0) {
      this.clients.splice(0);
      this.page = 0
      this.getClients();
      return;
    }
    this.userService.filterClients(eve.detail.value).subscribe(data => {
      this.clients = [];
      for (let j = 0; j < data.length; j++) {
        data[j].name = data[j].name.replace("$", " ")
      }
      this.clients = data;
    })

  }


  getClientsSize() {

    return 2;
  }



  async goToChat(item: any) {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        'user_id': item.id
      }
    });
    return await modal.present();
  }



  async goToClientProfile(item: any) {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        'user_id': item.id
      },
      backdropDismiss: false
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.clients = []
      this.page = 0;
      this.searchTerm = ''
      this.getClients();
    }
  }

}
