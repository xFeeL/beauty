import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { ModalController, NavController } from '@ionic/angular';
import { ChatPage } from '../chat/chat.page';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  chats: any;
  initialized: boolean = false;
  temp!: string;
  content_class!: string;

  constructor(private modalController: ModalController, private route: Router, private userService: UserService, private navCtrl: NavController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.userService.sseConnect(window.location.toString());

    this.chats = []
    this.userService.getChats().subscribe(data => {
      this.chats = data;
      for (let i = 0; i < data.length; i++) {
        this.userService.getUserImage(data[i].idUser).subscribe(data2 => {
          this.chats[i].image = data2;
        }, err => {
          this.chats[i].image = err.error.text;
          this.userService.getLastMessage(data[i].idUser).subscribe(data3 => {
            if (data3.content.length > 20) {
              data3.content = data3.content.slice(0, 8) + "..."
            }
            if (data3.id_receiver != data[i].idUser) {
              this.chats[i].isReceiver = true
            } else {
              this.chats[i].isReceiver = false

            }
            this.chats[i].lastMessage = data3;





          });
        });
      }

      if (data.length == 0) {
        this.content_class = "theContent"
      } else {
        this.content_class = ""

      }
      this.initialized = true;

    }, err => {
      this.content_class = "theContent"

    });
    if (this.userService.newMessage == true) {
      this.userService.gotMessageNotifications().subscribe(data => {
        this.userService.newMessage = false
      }, err => {
        this.userService.newMessage = false

      });
    }


  }

  handleRefresh(event: any) {
    window.location.reload();

  }




  async goToChatDetail(item: any) {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        user_id: item.idUser, // Pass the entire room object
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.ionViewWillEnter();
  }


  goBack() {
    this.modalController.dismiss()
  }


}
