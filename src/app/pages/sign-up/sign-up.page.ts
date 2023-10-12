import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router'
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { FacebookLogin } from '@capacitor-community/facebook-login';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {
  regex_email_test: boolean | undefined;
  emailIconName!: string;
  emailIconColor!: string;
  variableDisabled="true";
  email_input!: string;
  emailVariableClass!: string;
  firstName!: string;
  firstNameIconName!: string;
  firstNameColor!: string;
  firstNameVariableClass!: string;
  lastNameColor!: string;
  lastNameVariableClass!: string;
  lastName!: string;
  lastNameIconName!: string;
  mobile!: string;
  mobileIconName!: string;
  mobileColor!: string;
  mobileVariableClass!: string;
  resultEmailCheck:any;
  resultFirstNameCheck:any;
  resultLastNameCheck:any;
  resultMobileCheck:any;
  navParams!: string[];
  google: boolean=false;
  user!: User;
  token!: string;
  logininfo: any;
  facebook: boolean=false;
  resultOrgNameCheck!: boolean;
  orgNameIconName!: string;
  orgNameColor!: string;
  orgNameVariableClass!: string;
  orgName: string ="";
  constructor(private rout : Router,private userService:UserService) { }

  ngOnInit() {
    GoogleAuth.initialize({
      clientId: '540023271547-stkp8t8p92h0k2td4hvi09qf9s3uhkmm.apps.googleusercontent.com',
      scopes: ['profile', 'email'],
      grantOfflineAccess: true,
    });
    FacebookLogin.initialize({ appId: '3238436183073244' });

  }

  login(){
    this.rout.navigate(['login']); 
  }
  
  froget(){
    this.rout.navigate(['forget-password']); 

  }

  next(){
    if(this.google==false && this.facebook==false){
      this.navParams=[this.email_input,this.lastName,this.firstName,this.mobile,this.orgName];
      this.userService.setNavData(this.navParams)
      this.rout.navigate(['new-password']); 
    }else if(this.google==true){
      this.user=new User();
      this.user.app="beauty"

      this.user.name=this.firstName+"$"+this.lastName
      this.user.username=this.email_input;
      this.user.phone=this.mobile;
      this.user.password=this.token
      this.userService.registerOAuth(this.user,"google").subscribe(data=>{
      },err=>{
        console.log(err)

        if(err.error.text=="Email exists"){
          this.userService.presentToast("Αυτό το E-mail χρησιμοποείται ήδη.","danger")
        }else if(err.error.text=="Phone exists"){
          this.userService.presentToast("Αυτός ο αριθμός τηλεφώνου χρησιμοποείται ήδη.","danger")
        }else if(err.error.text=="OK"){
          this.userService.setNavData([this.user.username,this.token,"google"])

          this.rout.navigate(['otp-verification']); 
        }
      })

    }else if(this.facebook==true){
      this.user=new User();
      this.user.app="beauty"

      this.user.name=this.firstName+"$"+this.lastName
      this.user.username=this.email_input;
      this.user.phone=this.mobile;
      this.user.password=this.logininfo.token
      this.userService.registerOAuth(this.user,"facebook").subscribe(data=>{
      },err=>{
        console.log(err)
        if(err.error=="Email exists"){
          this.userService.presentToast("Αυτό το E-mail χρησιμοποείται ήδη.","danger")
        }else if(err.error.text=="Phone exists"){
          this.userService.presentToast("Αυτός ο αριθμός τηλεφώνου χρησιμοποείται ήδη.","danger")
        }else if(err.error.text=="OK"){
          this.userService.setNavData([this.user.username,this.logininfo.token,"facebook"])
          this.rout.navigate(['otp-verification']); 
        }
      })
    }
    

  }

  emailCheck(){
  
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    this.regex_email_test = regexp.test(this.email_input);
   
    if (this.regex_email_test){
      this.resultEmailCheck=true;

    this.emailIconName="checkmark-outline"
    this.emailIconColor="success"
    this.emailVariableClass="valid-item"
    
  
    }else if(!this.regex_email_test){
      this.resultEmailCheck=false;

      this.emailIconName="close-outline"
      this.emailIconColor="danger"
      this.emailVariableClass="invalid-item"
    }
    if(this.email_input.length==0){
      this.resultEmailCheck=false;
      this.emailIconName="null";
    }
    
  if(this.resultEmailCheck && this.resultFirstNameCheck && this.resultLastNameCheck && this.resultMobileCheck){
        this.variableDisabled="false";
  }else{
    this.variableDisabled="true";

  }
  }

  firstNameCheck(){
    let result = /^[a-zA-Zα-ωΑ-ΩίϊΐόάέύϋΰήώΊΪΌΆΈΎΫΉΏ\s]+$/.test(this.firstName);
    if(result){
      this.resultFirstNameCheck=true;

      this.firstNameIconName="checkmark-outline"
      this.firstNameColor="success"
      this.firstNameVariableClass="valid-item"
    }else{
      this.resultFirstNameCheck=false;

      this.firstNameIconName="close-outline"
      this.firstNameColor="danger"
      this.firstNameVariableClass="invalid-item"
    }
    if(this.firstName.length==0){
      this.resultFirstNameCheck=false;

      this.firstNameIconName="null";
    }
    
    if(this.resultEmailCheck && this.resultFirstNameCheck && this.resultLastNameCheck && this.resultMobileCheck){
      this.variableDisabled="false";
}else{
  this.variableDisabled="true";

}
  }

  lastNameCheck(){
    let result = /^[a-zA-Zα-ωΑ-ΩίϊΐόάέύϋΰήώΊΪΌΆΈΎΫΉΏ\s]+$/.test(this.lastName);
    if(result){
      this.resultLastNameCheck=true;
      this.lastNameIconName="checkmark-outline"
      this.lastNameColor="success"
      this.lastNameVariableClass="valid-item"
    }else{
      this.resultLastNameCheck=false;
      this.lastNameIconName="close-outline"
      this.lastNameColor="danger"
      this.lastNameVariableClass="invalid-item"
    }
    if(this.lastName.length==0){
      this.resultLastNameCheck=false;
      this.lastNameIconName="null";
    }
    if(this.resultEmailCheck && this.resultFirstNameCheck && this.resultLastNameCheck && this.resultMobileCheck){
      this.variableDisabled="false";
}else{
  this.variableDisabled="true";

}
  }



  mobileCheck(){

    let result = /^\+3069[0-9]{8}$/.test(this.mobile);
    let result2 = /^69[0-9]{8}$/.test(this.mobile);

    if(result || result2){
      this.resultMobileCheck=true;
      this.mobileIconName="checkmark-outline"
      this.mobileColor="success"
      this.mobileVariableClass="valid-item"
    }else{
      this.resultMobileCheck=false;
      this.mobileIconName="close-outline"
      this.mobileColor="danger"
      this.mobileVariableClass="invalid-item"
    }
    if(this.mobile.length==0){
      this.resultMobileCheck=false;
      this.mobileIconName="null";
    }

    if(this.resultEmailCheck && this.resultFirstNameCheck && this.resultLastNameCheck && this.resultMobileCheck){
      this.variableDisabled="false";
    }else{
    this.variableDisabled="true";

}
  }


  async googleOAuth(){
    const user = await GoogleAuth.signIn();
    this.lastName=user.familyName;
    this.firstName=user.givenName;
    this.email_input=user.email;
    this.token=user.authentication.idToken;
    this.google=true

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
    this.lastName=temp_user.last_name
    this.firstName=temp_user.first_name
    this.email_input=temp_user.email
    this.facebook=true
  }

  goBack() {
    this.rout.navigate(['/login']);  
    }
  

}
