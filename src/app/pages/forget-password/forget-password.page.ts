import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { UserService } from '../../services/user.service';
import { NavController } from '@ionic/angular';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.page.html',
  styleUrls: ['./forget-password.page.scss'],
})
export class ForgetPasswordPage implements OnInit {

  constructor(private navCtrl: NavController,private route : Router,private user: UserService,private menu: MenuController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,private userService:UserService) { }
  email: any;
  buttonDisabled:any;
  variableIcon!: string;
  variableColor!: string;
  variableClass!: string;
  variableDisabled!: string;
  ngOnInit() {
    this.variableDisabled="true";
    
  }


  newPassword(){
    this.route.navigate(['new-password']); 

  }

  goHome() {
    this.user.forgotPassword(this.email);
    this.userService.presentToast("Αν υπάρχει το E-mail που εισάγατε, θα σταλεί ο σύνδεσμος επαναφοράς.", "warning");
    this.navCtrl.back();

  }


  goBack() {
      this.navCtrl.back();

    
}


  emailCheck(eve:any){
  const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  const test = regexp.test(this.email);
 
  if (test){
  this.variableIcon="checkmark-outline"
  this.variableColor="success"
  this.variableClass="valid-item"
  this.variableDisabled="false";

  }else if(!test){
    this.variableIcon="close-outline"
    this.variableColor="danger"
    this.variableClass="invalid-item"
    this.variableDisabled="true";

  }

}



}
