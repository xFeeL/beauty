import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuController, LoadingController, NavController, ToastController, ModalController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  passwordType = 'password';
  passwordIcon: string = "";
  color8chars = "danger";
  name8chars = "close-outline";
  colorSpecial = "danger";
  nameSpecial = "close-outline";
  colorMatch = "danger";
  nameMatch = "close-outline";
  the_password: string = "";
  loader: any;
  repeated_password: string = "";
  disabledButton = "true";
  isDismiss = false;
  token: string = "";
  variableClass: string = "";
  signUpForm: any;
  old_password: string = "";
  constructor(private modalController: ModalController, private route: Router, private actRouter: ActivatedRoute, private menu: MenuController,
    private loadingCtrl: LoadingController, private navCtrl: NavController, private toastCtrl: ToastController, private user: UserService, private userService: UserService) { }

  ngOnInit() {
  }

  newPassword() {




    this.user.setNewPasswordAuthenticated(this.old_password, this.the_password, this.repeated_password).subscribe(data => {
      this.userService.presentToast("Η αλλαγή κωδικού ήταν επιτυχής.", "success");

      this.modalController.dismiss();

    }, err => {
      this.userService.presentToast("Ο κωδικός σας είναι λάθος.", "danger");

    });


  }





  hideShowPassword() {

    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
  }

  onChange() {
    if (this.the_password.length > 0) {
      this.passwordIcon = "eye-outline";
    } else {
      this.passwordIcon = "null";
    }

    if (this.the_password.length > 7) {
      this.color8chars = "success"
      this.name8chars = "checkmark-outline"

    } else {
      this.color8chars = "danger"
      this.name8chars = "close-outline"
    }

    const regex = /(?=.*\d)(?=.*[a-zα-ω])(?=.*[A-ZΑ-Ω])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{1,}/
    const result = regex.test(this.the_password) // outputs true
    if (result) {
      this.colorSpecial = "success"
      this.nameSpecial = "checkmark-outline"
    } else {
      this.colorSpecial = "danger"
      this.nameSpecial = "close-outline"
    }

    if (this.the_password == this.repeated_password && this.the_password != '') {
      this.colorMatch = "success"
      this.nameMatch = "checkmark-outline"
    } else {
      this.variableClass = "invalid-item"
      this.colorMatch = "danger"
      this.nameMatch = "close-outline"
    }

    if ((this.the_password.length > 7) && (result)) {
      this.variableClass = "valid-item"
      if (this.the_password == this.repeated_password) {
        this.disabledButton = "false";
      } else {
        this.disabledButton = "true";

      }
    } else {
      this.variableClass = "invalid-item"

    }

  }



  goBack() {
    this.modalController.dismiss()
  }
}
