import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { Message } from '../../models/message';
import * as moment from 'moment';
import { BeforeSlideDetail } from 'lightgallery/lg-events';
import lgZoom from 'lightgallery/plugins/zoom';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { FileInfo, Filesystem } from '@capacitor/filesystem';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { Lightbox } from 'ng-gallery/lightbox';
import { trigger, transition, style, animate } from '@angular/animations';
import { ClientProfilePage } from '../client-profile/client-profile.page';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,

  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0.2s ease-in-out', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.2s ease-in-out', style({ opacity: 0 })),
      ]),
    ]),
  ],
})

export class ChatPage implements OnInit {
  showTime = false
  sendingMessageLoading = false
  userId: any;
  user: any;
  initialized: boolean = false;
  profile_image: any;
  messages: any;
  to_send!: String;
  settings = {
    counter: false,
    plugins: [lgZoom]
  };
  imagesToSend: Array<string> = new Array<string>;
  images_length: any;
  change_input: boolean = true
  mode: string = "text";
  page!: number;
  userName: any;
  galleryId = 'myLightbox';
  images: GalleryItem[] = new Array<GalleryItem>;
  nopadding = "ion-margin-left ion-margin-right row"
  pl45 = "ion-margin-left ion-margin-right row pl45"
  paddingEnd = "paddingEnd"
  last_message: any;
  constructor(private modalController: ModalController, private navParams: NavParams, public lightbox: Lightbox, public gallery: Gallery, private actRouter: ActivatedRoute, private navCtrl: NavController, private userService: UserService, private route: Router, private plt: Platform, private changeDetectorRef: ChangeDetectorRef) {
  }

  @ViewChild(IonContent, { static: false }) content2!: IonContent;
  ngOnInit() {

  }

  ionViewWillEnter() {
    this.page = 0;
  
    this.userId = this.navParams.get('user_id')
  
    this.userService.sseConnect(window.location.toString());
  
    this.userService.getUserName(this.userId).subscribe(data => {
      let temp = data[0].split('$')
      this.userName = temp[0] + " " + temp[1]
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    })
  
    this.userService.getUserImage(this.userId).subscribe(data => {
      this.profile_image = data
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    }, err => {
      this.profile_image = err.error.text
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    })
  
    this.userService.getMessages(this.userId, this.page).subscribe(data3 => {
      for (let i = 0; i < data3.length; i++) {
  
        data3[i].time = moment(data3[i].datetime).locale("el").format('HH:mm')
        data3[i].datetime = moment(data3[i].datetime).locale("el").format('DD MMM, YYYY')
        data3[i].id = i; // Generate a unique ID for each message
        data3[i].showTime = false;
  
        if (data3[i].id_sender == this.userId) {
          if (data3[i - 1] != undefined) {
            if (data3[i].id_sender == data3[i - 1].id_sender) {
              data3[i].showAvatar = false
            } else {
              data3[i].showAvatar = true
            }
            if (data3[i].datetime != data3[i - 1].datetime) {
              data3[i].showAvatar = true
            }
          } else {
            data3[i].showAvatar = true
          }
        }
        if (data3[i - 1] != undefined) {
          if (data3[i - 1].id_sender == data3[i].id_sender) {
            data3[i].addPadding = false;
          } else {
            data3[i].addPadding = true;
          }
        }
      }
  
      this.messages = data3.reverse();
      let temp = this.messages.length - 1
      if (this.messages.length > 0) {
        if (this.messages[temp].id_sender == this.userId) {
          this.messages[temp].addPadding = true;
        } else {
          this.messages[temp].addPadding = false;
        }
      }
      this.last_message = this.messages[temp]
  
      this.initialized = true;
  
      this.scrollToBottomSetTimeOut(300);
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    })
  
    this.userService.messageReceived.subscribe((message: any) => {
      let message_received = new Message()
      const jsonObject = JSON.parse(message);
      message_received.id_sender = jsonObject.SenderId;
      message_received.content = jsonObject.Content;
      message_received.datetime = moment(jsonObject.Datetime).locale("el").format('DD MMM, YYYY')
      message_received.time = moment(jsonObject.Datetime).locale("el").format('HH:mm')
      message_received.showTime = false;
  
      message_received._image = jsonObject.IsImage
      message_received.images = jsonObject.Images
      let temp = this.messages.length - 1
  
      if (this.messages[temp].id_sender != message_received.id_sender) {
        this.messages[temp].addPadding = true;
      } else {
        this.messages[temp].showAvatar = false;
      }
      message_received.showAvatar = true;
      this.messages.push(message_received)
      this.scrollToBottomSetTimeOut(300);
      this.changeDetectorRef.detectChanges(); // Trigger change detection manually
    });
  }
  




  goBack() {
    this.modalController.dismiss()
  }


  async goToUserProfile() {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        user_id: this.userId,
      }
    });

    await modal.present();

  }



  sendMessage() {
    this.sendingMessageLoading = true
    const now = new Date();
    let mes = new Message();
    if (this.mode == "text") {
      mes.content = this.to_send;
      if (mes.content == undefined) {
        return
      }
    } else {
      mes.images = this.imagesToSend
    }
    mes.id_receiver = this.userId
    if (this.messages.length == 0) {
      mes.isf = true;
    } else {
      mes.isf = false;

    }
    this.userService.sendMessage(mes).subscribe(data => {

      mes.datetime = moment(now).locale("el").format('DD MMM, YYYY')
      mes.time = moment(now).locale("el").format('HH:mm')
      mes.is_read = false;
      mes.showTime = false;

      if (this.mode == "text") {
        mes.content = mes.content
        mes._image = false;
        this.to_send = "";

      } else {
        for (let i = 0; i < data.images.length; i++) {

          mes.images[i] = data.images[i]

        }



        mes._image = true;

        this.mode = "text"

      }

      let temp = this.messages.length - 1;
      if (temp >= 0 && this.messages[temp]) {
        if (this.messages[temp].id_sender == this.userId) {
          this.messages[temp].addPadding = true;
        } else {
          this.messages[temp].addPadding = false;
        }
      } else {
        console.error('No messages available or temp index is out of bounds');
      }

      mes.addPadding = true;
      if(temp>=0){
        this.messages[this.messages.length] = mes;

      }else{
        this.messages[0] = mes;

      }
      this.scrollToBottomSetTimeOut(300);
      this.imagesToSend = []
      this.sendingMessageLoading = false
      this.changeDetectorRef.detectChanges(); 
    }, err => {
      this.sendingMessageLoading = false
      this.userService.presentToast("Προέκυψε κάποιο σφάλμα", "danger")
      this.changeDetectorRef.detectChanges(); 

    });




  }


  scrollToBottomSetTimeOut(time: number) {

    setTimeout(() => {
      this.content2.scrollToBottom();
    }, time);
  }

  onBeforeSlide = (detail: BeforeSlideDetail): void => {
    const { index, prevIndex } = detail;
  };


  async selectImages() {
    const images = await Camera.pickImages({
      quality: 100,
      
    });

    if (images && images.photos.length > 0) {
      const photos = images.photos;
      await this.saveImages(photos);
      //this.updateGallery();
    }
  }

  async saveImages(photos: GalleryPhoto[]) {
    const newImages = [];

    for (const photo of photos) {

      if (photo.format != "jpeg" && photo.format != "png") {
        this.userService.presentToast("Δεν υποστηρίζεται αυτή η μορφή εικόνας", "danger");
      } else {
        const base64Data = await this.readAsBase64(photo);
        newImages.push(base64Data);
      }
    }

    // Add new images to the array
    this.imagesToSend = [...this.imagesToSend, ...newImages];
    this.mode = "image"

  }

  async readAsBase64(photo: GalleryPhoto): Promise<string> {
    if (this.plt.is('hybrid')) {
      if (photo.path !== undefined) { // add check for undefined
        const file = await Filesystem.readFile({
          path: photo.path
        });
        return file.data as string;
      } else {
        throw new Error('photo.path is undefined');
      }
    } else {
      const url = photo.webPath;
      if (url !== undefined) {
        const response = await fetch(url);
        const blob = await response.blob();
        let base64Data = await this.convertBlobToBase64(blob);
        return (base64Data as string).split(',')[1];
      } else {
        throw new Error('photo.webPath is undefined');
      }
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  removeImage(item: any) {
    const newArr: string[] = this.imagesToSend.filter((element) => {
      return element != item;
    });
    this.imagesToSend = newArr;

    if (this.imagesToSend.length === 0) {
      this.mode = 'text'; // Assuming this.mode is a property that exists and can be changed to 'text'.
    }
  }


  loadData(event: any) {
    this.page = this.page + 1;

    this.userService.getMessages(this.userId, this.page).subscribe(data3 => {
      if (data3.length == 0) {
        event.target.disabled = true;
      }
      data3 = data3.reverse()

      for (let i = 0; i < data3.length; i++) {
        data3[i].time = moment(data3[i].datetime).locale("el").format('HH:mm')
        data3[i].datetime = moment(data3[i].datetime).locale("el").format('DD MMM, YYYY')
        data3[i].showTime = false;

        event.target.complete();

      }



      for (let j = 0; j < this.messages.length; j++) {
        data3.push(this.messages[j])
      }

      this.messages = data3;
      for (let k = 0; k < this.messages.length; k++) {
        if (this.messages[k].id_sender == this.userId) {
          if (this.messages[k + 1] != undefined) {
            if (this.messages[k].id_sender == this.messages[k + 1].id_sender) {
              this.messages[k].showAvatar = false
            } else {
              this.messages[k].showAvatar = true
            }
            if (this.messages[k].datetime != this.messages[k + 1].datetime) {
              this.messages[k].showAvatar = true

            }
          } else {
            this.messages[k].showAvatar = true
          }


        }

        if (this.messages[k + 1] != undefined) {


          if (this.messages[k + 1].id_sender == this.messages[k].id_sender) {
            this.messages[k].addPadding = false;
          } else {
            this.messages[k].addPadding = true;

          }

        }
      }
      this.changeDetectorRef.detectChanges(); 
    })
  }

}





