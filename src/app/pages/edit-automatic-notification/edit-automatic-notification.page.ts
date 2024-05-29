import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-edit-automatic-notification',
  templateUrl: './edit-automatic-notification.page.html',
  styleUrls: ['./edit-automatic-notification.page.scss'],
})
export class EditAutomaticNotificationPage implements OnInit {

  constructor(private modalController:ModalController,private userService:UserService, private navParams:NavParams) { }
  emailToggle: boolean = false;
  smsToggle: boolean = false;
  timeBefore: string = ''; 
  settingId=null;
  type=""
  ngOnInit() {
  }

  ionViewWillEnter() {
    this.settingId=this.navParams.get("id")
    this.smsToggle=this.navParams.get("sms")
    this.emailToggle=this.navParams.get("email")
    this.timeBefore=this.navParams.get("timeBefore")
    
    this.timeBefore=this.convertTimeCode(this.timeBefore)
    this.type=this.navParams.get("type")
  }


  goBack(){
    this.modalController.dismiss()
  }

  saveNotification(){
    const notificationSettings = {
      id:this.settingId,
      email: this.emailToggle,
      sms: this.smsToggle,
      timeBefore: this.timeBefore,
      settingType:this.type
    };
    this.userService.saveNotificationSetting(notificationSettings).subscribe(data=>{
      this.userService.presentToast("Αποθηκεύτηκε με επιτυχία!","success")
      this.modalController.dismiss();
    },err=>{
      this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά.","danger")

    })
  }

 convertTimeCode(timeCode: string | undefined): string {
    if (timeCode === undefined) {
        throw new Error("timeCode is undefined");
    }

    const pattern = /^([HD])(\d+)$/;
    const match = timeCode.match(pattern);

    if (match) {
        return `${match[2]}${match[1].toLowerCase()}`;
    } else {
        throw new Error("Invalid timeCode format");
    }
}

}
