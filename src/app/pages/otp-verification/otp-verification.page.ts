import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { UserService } from '../../services/user.service';
import { NavController } from '@ionic/angular';
import { MenuController, LoadingController, ToastController } from '@ionic/angular';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.page.html',
  styleUrls: ['./otp-verification.page.scss'],
})
export class OtpVerificationPage implements OnInit {

  constructor(private navCtrl: NavController, private rout: Router, private user: UserService, private menu: MenuController,
    private loadingCtrl: LoadingController, private userService: UserService,
    private toastCtrl: ToastController) { }
  //tabID = 2;
  email: any;
  otp: any;
  field1: any
  field2: any
  loader: any;
  isDismiss = false;
  field3: any
  field4: any
  buttonDisabled: any;
  variableIcon!: string;
  variableColor!: string;
  variableClass!: string;
  variableDisabled!: string;
  OTPbuttonDisabled!: string;
  navData!: any;
  login_user!: User;
  ngOnInit() {
    this.variableDisabled = "true";
    this.OTPbuttonDisabled = "true";
    this.navData = this.userService.getNavData();
    this.login_user = new User();
  }


  newPassword() {
    this.rout.navigate(['new-password']);
  }

  toTab2() {
    // this.tabID = 2

    this.user.forgotPassword(this.email);
  }

  toTab3() {
    this.OTPbuttonDisabled = "false";
    this.otp = this.field1 + this.field2 + this.field3 + this.field4;
    this.buttonDisabled = false;

    this.user.sendOTP(this.navData.phone, this.otp).subscribe(data => {
      if (data && data.message == "Wrong OTP") {
        this.userService.presentToast("Λάθος Κωδικός", "danger");
      } else {
        this.completeLogin();
      }
    });
  }

  completeLogin() {

    if (this.navData.authType === "ordinary") {
      this.login_user.phone = this.navData.phone;
      this.login_user.password = this.navData.password;
      this.userService.login(this.login_user).subscribe(data => {
        this.rout.navigate(['/tabs/home']);
      }, err => {
        this.handleLoginError(err);
      });
    } else {
      this.userService.loginOAuth(this.navData.token, this.navData.authType).subscribe(data => {
        this.rout.navigate(['/tabs/home']);
      }, err => {
        this.handleOAuthError(err);
      });
    }
  }

  handleLoginError(err: any) {
    if (err.error == "Mobile") {
      this.userService.requestOTP(this.login_user.phone).subscribe(data => {
        this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
        this.userService.setNavData({ phone: this.login_user.phone, password: this.login_user.password });
        this.rout.navigate(['/otp-verification']);
      });
    } else if (err.error == "Onboarding") {
      this.rout.navigate(['/onboarding']);
    } else {
      this.userService.presentToast("Το κινητό ή ο κωδικός είναι λάθος.", "danger");
    }
  }

  handleOAuthError(err: any) {
    if (err.error == "Mobile") {
      this.userService.requestOTP(this.navData.phone).subscribe(data => {
        this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
        this.userService.setNavData({ phone: this.navData.phone, token: this.navData.token, authType: this.navData.authType });
        this.rout.navigate(['/otp-verification']);
      });
    } else if (err.error == "Onboarding") {
      this.rout.navigate(['/onboarding']);
    } else {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger");
    }
  }


  goBack() {
    // if(this.tabID==1){
    this.navCtrl.back();

    // }else{
    // this.tabID--;
    // }

  }

  emailValidation() {
    return 1;
  }
  emailCheck(eve: any) {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const test = regexp.test(this.email);

    if (test) {
      this.variableIcon = "checkmark-outline"
      this.variableColor = "success"
      this.variableClass = "valid-item"
      this.variableDisabled = "false";

    } else if (!test) {
      this.variableIcon = "close-outline"
      this.variableColor = "danger"
      this.variableClass = "invalid-item"
      this.variableDisabled = "true";

    }

  }

  gotoNextField(nextElement: { setFocus: () => void; }) {
    nextElement.setFocus();
  }




  submit() {

  }

  resendOTP() {
    const contact = this.navData.authType === "ordinary" ? this.navData.phone : this.navData.email;
    this.userService.requestOTP(contact).subscribe(data => {
      this.userService.presentToast("Εισάγετε τον αριθμό που λάβατε στο κινητό σας.", "warning");
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
    });
  }

}
