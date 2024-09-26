import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { FacebookLogin } from '@capacitor-community/facebook-login';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  regex_email_test: boolean | undefined;
  emailIconName!: string;
  emailIconColor!: string;
  variableDisabled = "true";
  email_input!: string;
  emailVariableClass!: string;
  disabledEmail = false
  mobile!: string;
  mobileIconName!: string;
  mobileColor!: string;
  mobileVariableClass!: string;
  resultEmailCheck: any;
  resultFirstNameCheck: any;
  resultLastNameCheck: any;
  resultMobileCheck: any;
  navParams!: string[];
  google: boolean = false;
  user!: User;
  token!: string;
  logininfo: any;
  facebook: boolean = false;
  resultOrgNameCheck!: boolean;
  orgNameIconName!: string;
  orgNameColor!: string;
  orgNameVariableClass!: string;
  orgName: string = "";
  isInAppBrowser: boolean = false;

  phoneMask: MaskitoOptions = {
    mask: ['+', '3', '0', ' ', '6', '9', /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };

  readonly options: MaskitoOptions = this.phoneMask;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  constructor(private rout: Router, private userService: UserService) { }

  ngOnInit() {
    GoogleAuth.initialize({
      clientId: '1079825245656-ha5q3hdr5s6h3ocu8j1oem9e5g836j1n.apps.googleusercontent.com',
      scopes: [],
      grantOfflineAccess: true,
    });
    //FacebookLogin.initialize({ appId: '3238436183073244' });

  }


  ngAfterViewInit() {
    this.checkIfInAppBrowser();

  }

  checkIfInAppBrowser() {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Improved regular expression (removed duplicate 'Instagram')
    if (/FBAN|FBAV|Instagram|Twitter|LinkedIn|TikTok|Snapchat|Pinterest|Messenger|WhatsApp|Line|WeChat/i.test(userAgent)) {
      this.isInAppBrowser = true;
    } else {
      this.isInAppBrowser = false;
    }
  }


  login() {
    this.rout.navigate(['login']);
  }

  froget() {
    this.rout.navigate(['forget-password']);

  }

  next() {
   
    if (!this.google && !this.facebook) {
      this.userService.setNavData({ phone: this.mobile, email: this.email_input });
      this.rout.navigate(['new-password']);
    } else if (this.google) {
      this.user = new User();
      this.user.app = "beauty";
      this.user.email = this.email_input;
      this.user.phone = this.mobile;
      this.user.password = this.token;
      this.userService.registerOAuth(this.user, "google").subscribe(data => {
        this.userService.setNavData({ phone: this.user.phone, token: this.token, authType: "google", email: this.user.email });
        this.rout.navigate(['otp-verification']);
      }, err => {
        this.handleOAuthError(err);
      });
    } else if (this.facebook) {
      this.user = new User();
      this.user.app = "beauty";
      this.user.phone = this.mobile;
      this.user.password = this.logininfo.token;
      this.userService.registerOAuth(this.user, "facebook").subscribe(data => {
        this.userService.setNavData({ phone: this.user.phone, token: this.logininfo.token, authType: "facebook", email: this.user.email });
        this.rout.navigate(['otp-verification']);
      }, err => {
        this.handleOAuthError(err);
      });
    }
  }

  handleOAuthError(err: any) {
    if (err.error === "Email exists" || err.error?.text === "Email exists") {
      this.userService.presentToast("Αυτό το E-mail χρησιμοποείται ήδη.", "danger");
    } else if (err.error === "Phone exists" || err.error?.text === "Phone exists") {
      this.userService.presentToast("Αυτός ο αριθμός τηλεφώνου χρησιμοποείται ήδη.", "danger");
    } else if (err.error === "OK" || err.error?.text === "OK") {
      this.userService.setNavData({
        phone: this.user.phone,
        token: this.token,
        authType: "google",
        email: this.user.email
      });
      this.rout.navigate(['otp-verification']);
    }
  }


  emailCheck() {

    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.regex_email_test = regexp.test(this.email_input);

    if (this.regex_email_test) {
      this.resultEmailCheck = true;

      this.emailIconName = "checkmark-outline"
      this.emailIconColor = "success"
      this.emailVariableClass = "valid-item"


    } else if (!this.regex_email_test) {
      this.resultEmailCheck = false;

      this.emailIconName = "close-outline"
      this.emailIconColor = "danger"
      this.emailVariableClass = "invalid-item"
    }
    if (this.email_input.length == 0) {
      this.resultEmailCheck = false;
      this.emailIconName = "null";
    }

    if (this.resultEmailCheck && this.resultMobileCheck) {
      this.variableDisabled = "false";
    } else {
      this.variableDisabled = "true";

    }
  }

  mobileCheck() {

    // Updated pattern to match +30 69x xxx xxxx format
    let pattern = /^\+30 69\d \d{3} \d{4}$/;
    let result = pattern.test(this.mobile);

    if (result) {
      this.resultMobileCheck = true;
      this.mobileIconName = "checkmark-outline";
      this.mobileColor = "success";
      this.mobileVariableClass = "valid-item";
    } else {
      this.resultMobileCheck = false;
      this.mobileIconName = "close-outline";
      this.mobileColor = "danger";
      this.mobileVariableClass = "invalid-item";
    }

    if (this.mobile.length == 0) {
      this.resultMobileCheck = false;
      this.mobileIconName = "null";
    }

    if (this.resultEmailCheck && this.resultMobileCheck) {
      this.variableDisabled = "false";
    } else {
      this.variableDisabled = "true";
    }
  }


  async googleOAuth() {
    if (!this.isInAppBrowser) {
      const user = await GoogleAuth.signIn();
      this.disabledEmail = true
      this.email_input = user.email;
      this.token = user.authentication.idToken;
      this.google = true
      this.emailCheck()
    } else {
      this.userService.presentToast('Αυτή η λειτουργία είναι διαθέσιμη μόνο σε συμβατά προγράμματα περιήγησης.', 'warning');
    }
  }

  async facebookOAuth(): Promise<void> {
    const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];

    const result = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });
    if (result && result.accessToken) {
      this.logininfo = { token: result.accessToken.token, userId: result.accessToken.userId }
      this.getUserInfo()

      //this.router.navigate(["/tabs/home"], navigationExtras);
    }
  }

  async getUserInfo() {
    const response = await fetch(`https://graph.facebook.com/me?fields=email,last_name,first_name&access_token=${this.logininfo.token}`);
    const myJson = await response.json();
    let temp_user = myJson
    this.disabledEmail = true

    this.email_input = temp_user.email
    this.facebook = true
    this.emailCheck()

  }

  goBack() {
    this.rout.navigate(['/login']);
  }


}
