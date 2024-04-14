import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { UserService } from '../../services/user.service';
import { NavController } from '@ionic/angular';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {
  phoneMask: MaskitoOptions = {
    mask: ['+', '3','0', ' ', '6', '9', /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };
  readonly options: MaskitoOptions = this.phoneMask;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  constructor(private navCtrl: NavController,private route : Router,private user: UserService,private menu: MenuController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,private userService:UserService) { }
  buttonDisabled:any;
  variableIcon!: string;
  variableColor!: string;
  variableClass!: string;
  variableDisabled!: string;
  phone: any="";

  ngOnInit() {
    this.variableDisabled="true";
    
  }


  newPassword(){
    this.route.navigate(['new-password']); 

  }

 
  goHome() {
    this.user.forgotPassword(this.phone);
    this.userService.presentToast("Αν υπάρχει το κινητό που εισάγατε, θα σταλεί ο σύνδεσμος επαναφοράς.", "warning");
    this.navCtrl.back();

  }


  goBack() {
      this.navCtrl.back();

    
  }



}
