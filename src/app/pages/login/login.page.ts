import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { UserService } from '../../services/user.service';

import { MenuController, LoadingController, ToastController, Platform } from '@ionic/angular';
import { User } from '../../models/user';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import {
  FacebookLogin,
  FacebookLoginResponse,
} from '@capacitor-community/facebook-login';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loader: any;
  user: User = new User();
  isDismiss = false;
  passwordType = 'password';
  passwordIcon = 'eye-outline';
  iconName: string | undefined;
  iconColor: string | undefined;
  variableClass: string | undefined;
  variableDisabled: string | undefined;
  disabledButton = "true";
  regex_email_test: any;
  googlLoginSpinner = false
  isInAppBrowser: boolean = false;

  phoneMask: MaskitoOptions = {
    mask: ['+', '3', '0', ' ', '6', '9', /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };
  readonly options: MaskitoOptions = this.phoneMask;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  authenticated: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private platform: Platform,
  ) { }
  ;
  ionViewWillEnter() {

    if (localStorage.getItem('authenticated') == 'true') {
      this.authenticated = true
    } else {
      this.authenticated = false

    }

  }

  ngOnInit() {
    //Disable sidemenu on login page.
    //this.menu.enable(false);
    //If user is exist, redirect it to home page.
    //this.redirectPage(this.userService.currentUserValue);
    GoogleAuth.initialize({

      clientId: '1079825245656-ha5q3hdr5s6h3ocu8j1oem9e5g836j1n.apps.googleusercontent.com',
      scopes: [],
      grantOfflineAccess: true,

    });

    FacebookLogin.initialize({ appId: '3238436183073244' });
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
    this.userService.login(this.user).subscribe(data => {
      this.userService.presentToast("Η σύνδεση ήταν επιτυχής.", "success");
      setTimeout(() => {

        this.userService.userLogin(data.expertId);

        window.location.href = '/tabs/home';
        localStorage.setItem('authenticated', "true");
      }, 1000);
    }, err => {
      this.handleLoginError(err);
    });
  }

  handleLoginError(err: any) {
    console.log(err)
    if (err.error != null && err.error.errorReturned == "Mobile") {
      this.userService.requestOTP(this.user.phone).subscribe(data => {
        this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
        this.userService.setNavData({ email: this.user.email, password: this.user.password, authType: "ordinary", phone: this.user.phone });
        this.router.navigate(['/otp-verification']);
      });
    } else if (err.error != null && err.error.errorReturned == "Onboarding") {

      this.router.navigate(['/onboarding']);
    } else {
      this.userService.presentToast("Το κινητό ή ο κωδικός είναι λάθος.", "danger");
    }
  }

  /*googleOAuth() {
    if (!this.isInAppBrowser) {

    this.googlLoginSpinner=true
    GoogleAuth.signIn().then(user => {
      this.userService.loginOAuth(user.authentication.idToken, "google").subscribe(data => {
        this.googlLoginSpinner=false
        this.userService.userLogin(data.expertId);

        window.location.href = '/tabs/home';
        localStorage.setItem('authenticated', "true");
      }, err => {
        this.handleOAuthError(err, user);
      });
    });
  }else{
    this.userService.presentToast('Αυτή η λειτουργία είναι διαθέσιμη μόνο σε συμβατά προγράμματα περιήγησης.', 'warning');

  }
  }*/

  /*handleOAuthError(err: any, user: any) {
    this.googlLoginSpinner=false

    if (err.error == "Mobile") {
      this.userService.requestOTP(user.email).subscribe(data => {
        this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
        this.userService.setNavData({ email: user.email, token: user.authentication.idToken, authType: "google" });
        this.router.navigate(['/otp-verification']);
      });
    } else if (err.error == "Onboarding") {
      this.router.navigate(['/onboarding']);
    } else {
      this.userService.presentToast("Το κινητό ή ο κωδικός είναι λάθος.", "danger");
    }
  }*/

  onAppChange(event: any) {
    const selectedValue = event.detail.value;

    if (selectedValue !== 'beauty') {
      const baseUrl = 'https://' + selectedValue + '.fyx.gr';
      window.location.href = baseUrl;
    }
  }



  redirectPage(user: User) {
    if (!user) {
      return;
    }

    //Main page of user will be home.
    this.router.navigate(['/tabs/home']);

  }

  hideShowPassword() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-outline' ? 'eye-off-outline' : 'eye-outline';
  }

  goToRegister() {
    this.router.navigate(['/sign-up']);
  }

  goToForgetPasswordPage() {
    this.router.navigate(['/forget-password']);
  }



  passwordChange() {
    if (this.user.password.length > 0 && this.user.phone.length > 0) {
      this.disabledButton = "false";
    } else {
      this.disabledButton = "true";

    }
  }
  /*
  constructor( private rout : Router) { }

  ngOnInit() {
  }

  login(){
    this.rout.navigate(['tabs/home']); 
  }
  
  signUp(){
    this.rout.navigate(['sign-up']); 
  }
  froget(){
    this.rout.navigate(['forget-password']); 
  }*/

  goBack() {
    this.router.navigate(['/tabs/home']);
  }







  async facebookOAuth(): Promise<void> {
    const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];

    const result = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });
    if (result && result.accessToken) {
      let user = { token: result.accessToken.token, userId: result.accessToken.userId }
      this.userService.loginOAuth(result.accessToken.token, "facebook").subscribe(data => {
        window.location.href = '/tabs/home';
        localStorage.setItem('authenticated', "true");

      })
    }
  }




}