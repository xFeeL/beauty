import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { UserService } from '../../services/user.service';

import { MenuController, LoadingController, ToastController } from '@ionic/angular';
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
  iconName :string | undefined;
  iconColor:string | undefined;
  variableClass:string | undefined;
  variableDisabled:string | undefined;
  disabledButton="true";
  regex_email_test:any;
  phoneMask: MaskitoOptions = {
    mask: ['+', '3','0', ' ', '6', '9', /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };
  readonly options: MaskitoOptions = this.phoneMask;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  
  constructor(
    private userService: UserService,
    private router: Router,
    private menu: MenuController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    //Disable sidemenu on login page.
    //this.menu.enable(false);
    //If user is exist, redirect it to home page.
    //this.redirectPage(this.userService.currentUserValue);
    GoogleAuth.initialize({
      clientId: '540023271547-stkp8t8p92h0k2td4hvi09qf9s3uhkmm.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });

     FacebookLogin.initialize({ appId: '3238436183073244' });
  }

  login() {
    
    this.userService.login(this.user).subscribe(data => {
    this.userService.presentToast("Η σύνδεση ήταν επιτυχής.", "success");
   // this.userService.getServerSentEvent("http://127.0.0.1:8080/api/expert-auth/stream").subscribe((data: any) => console.log(data));

      //Wait 1 second, then redirect it to home page.
      setTimeout(() => {
        
        //this.redirectPage(data);
        //this.userService.pushSetup();
      }, 1000);
      
      window.location.href = '/tabs/home';
      localStorage.setItem('authenticated',"true");

      //this.router.navigate(['/tabs/arxikh']);
    }, err => {
      if(err.error=="Mobile"){
        this.userService.requestOTP(this.user.phone).subscribe(data=>{
          this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
        this.userService.setNavData([this.user.email,this.user.password,"ordinary",this.user.phone]);
        

        this.router.navigate(['/otp-verification']);

        },err=>{
          
        });

      }else if(err.error=="Onboarding"){
             
        this.router.navigate(['/onboarding']);  //PREPEI NA TO KANEIS GIA KATHE REQUEST P KANEIS, PROTINW MESA STO USER SERVICE OLA TA RESPONSES CHECK OTI EXI TELIWSEI TO ONBOARDING
      
    }
      else{
        this.userService.presentToast("Το κινητό ή ο κωδικός είναι λάθος.", "danger");

      }
      
    });
  }
  onAppChange(event: any) {
    const selectedValue = event.detail.value;
  
    if (selectedValue !== 'beauty') {
      const baseUrl = 'https://'+selectedValue+'.fyx.gr';
      window.location.href = baseUrl;
      }
  }



  redirectPage(user:User) {
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

goToForgetPasswordPage(){
  this.router.navigate(['/forget-password']);
}



passwordChange(){
  if(this.user.password.length>0 && this.user.phone.length>0){
    this.disabledButton="false";
  }else{
    this.disabledButton="true";

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


    async googleOAuth(){
      const user = await GoogleAuth.signIn();

      if (user) {
        this.userService.loginOAuth(user.authentication.idToken,"google").subscribe(data=>{
          window.location.href = '/tabs/home';
          localStorage.setItem('authenticated',"true");

        },err=>{         
            if(err.error=="Mobile"){
              this.userService.requestOTP(user.email).subscribe(data=>{
                this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
                this.userService.setNavData([user.email,user.authentication.idToken,"google"]);
                this.router.navigate(['/otp-verification']);
              },err=>{
              });
            }else if(err.error=="Onboarding"){
             
                this.router.navigate(['/onboarding']);  //PREPEI NA TO KANEIS GIA KATHE REQUEST P KANEIS, PROTINW MESA STO USER SERVICE OLA TA RESPONSES CHECK OTI EXI TELIWSEI TO ONBOARDING
              
            }
            else{
              this.userService.presentToast("Το κινητό ή ο κωδικός είναι λάθος.", "danger");      
            }
          });
        
        
    }
     
    }


   

  async facebookOAuth(): Promise<void> {
    const FACEBOOK_PERMISSIONS = ['public_profile', 'email'];

    const result = await FacebookLogin.login({ permissions: FACEBOOK_PERMISSIONS });
    if (result && result.accessToken) {
      let user = { token: result.accessToken.token, userId: result.accessToken.userId }
      this.userService.loginOAuth(result.accessToken.token,"facebook").subscribe(data=>{
        window.location.href = '/tabs/home';
        localStorage.setItem('authenticated',"true");

      })
    }
  }



  
}