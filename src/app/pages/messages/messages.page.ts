import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import * as moment from 'moment';
import { ModalController, NavController } from '@ionic/angular';
import { ChatPage } from '../chat/chat.page';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class MessagesPage implements OnInit {
  chats: any;
  initialized: boolean = false;
  temp!: string;
  content_class!: string;
  private newMessageSubscription: Subscription = new Subscription;

  constructor(private modalController: ModalController, private route: Router, private userService: UserService, private navCtrl: NavController, private changeDetectorRef: ChangeDetectorRef) { }
  ngOnInit() {
  }

  ionViewWillEnter() {
    
    this.userService.sseConnect(window.location.toString());
  
    this.chats = [];
    this.userService.getChats().subscribe(data => {
      this.chats = data.map((chat: { lastMessage: { content: string; id_receiver: any; fullDateTime: string; }; isReceiver: boolean; idUser: any; image: any; userProfileImage: string; }) => {
        // If the last message content is longer than 20 characters, truncate it
        if (chat.lastMessage.content.length > 20) {
          chat.lastMessage.content = chat.lastMessage.content.slice(0, 8) + "...";
        }
  
        // Determine if the current user is the receiver of the last message
        chat.isReceiver = chat.lastMessage.id_receiver !== chat.idUser;
  
        // Assign the user image, handling the case where it's a default or error
        chat.image = chat.userProfileImage === 'default' ? 'default-image-path' : chat.userProfileImage;
  
        return chat;
      });
  
      // Sort the chats by fullDateTime of the last message in descending order
      this.chats.sort((a: { lastMessage: { fullDateTime: string | number | Date; }; }, b: { lastMessage: { fullDateTime: string | number | Date; }; }) => new Date(b.lastMessage.fullDateTime).getTime() - new Date(a.lastMessage.fullDateTime).getTime());
  
      this.content_class = data.length === 0 ? "theContent" : "";
      this.initialized = true;
  
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    }, err => {
      this.content_class = "theContent";
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    });
  
    if (this.userService.newMessage$) {
      this.userService.gotMessageNotifications().subscribe(() => {
        this.userService.newMessage$.next(false);
      }, () => {
        this.userService.newMessage$.next(false);
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
