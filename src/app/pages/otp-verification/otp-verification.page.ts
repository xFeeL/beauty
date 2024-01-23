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

  constructor(private navCtrl: NavController,private rout : Router,private user: UserService,private menu: MenuController,
    private loadingCtrl: LoadingController,private userService:UserService,
    private toastCtrl: ToastController) { }
  //tabID = 2;
  email: any;
  otp: any;
  field1:any
  field2:any
  loader: any;
  isDismiss = false;
  field3:any
  field4:any
  buttonDisabled:any;
  variableIcon!: string;
  variableColor!: string;
  variableClass!: string;
  variableDisabled!: string;
  OTPbuttonDisabled!: string;
  navData!: string[];
  login_user!: User;
  ngOnInit() {
    this.variableDisabled="true";
    this.OTPbuttonDisabled="true";
    this.navData=this.userService.getNavData();
    this.login_user=new User();
  }


  newPassword(){
    this.rout.navigate(['new-password']); 
  }

  toTab2() {
   // this.tabID = 2

    this.user.forgotPassword(this.email);
  }

  toTab3() {
    this.OTPbuttonDisabled="false";

    this.otp=this.field1+this.field2+this.field3+this.field4;
    this.buttonDisabled = false;

    
    this.user.sendOTP(this.navData[0],this.otp).subscribe(data => {
      if(data!=null && data.message=="Wrong OTP"){
      this.userService.presentToast("Λάθος Κωδικός", "danger");
      
      //Wait 1 second, then redirect it to home page.
      setTimeout(() => {
        
       // this.redirectPage(data);
        //this.userService.pushSetup();
      }, 1000);
    }else if(data==null){
      this.login_user.phone=this.navData[0];
      this.login_user.password=this.navData[1];
      let user:User=new User();
      user.phone=this.navData[0];
      

      user.password=this.navData[1];
      if(this.navData[2]=="ordinary"){
        this.userService.login(user).subscribe(data => {
          //this.userService.getServerSentEvent("http://127.0.0.1:8080/api/expert-auth/stream").subscribe((data: any) => console.log(data));
      
            //Wait 1 second, then redirect it to home page.
            setTimeout(() => {
              
              //this.redirectPage(data);
              //this.userService.pushSetup();
            }, 1000);
            this.rout.navigate(['/tabs/arxikh']);
          }, err => {
            if(err.error=="Mobile"){
              this.userService.requestOTP(user.phone).subscribe(data=>{
                this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
              this.userService.setNavData([user.phone,user.password]);
              this.rout.navigate(['/otp-verification']);      
              },err=>{
              });              
            } else if(err.error=="Onboarding"){
             
              this.rout.navigate(['/onboarding']);  //PREPEI NA TO KANEIS GIA KATHE REQUEST P KANEIS, PROTINW MESA STO USER SERVICE OLA TA RESPONSES CHECK OTI EXI TELIWSEI TO ONBOARDING
            
          }
            
            else{
              this.userService.presentToast("Το Email ή ο κωδικός είναι λάθος.", "danger");      
            }
            
          });
        }else{
          this.userService.loginOAuth(user.password,this.navData[2]).subscribe(data=>{
            this.rout.navigate(['/tabs/arxikh']);
          },err=>{         
              if(err.error=="Mobile"){
                this.userService.requestOTP(user.phone).subscribe(data=>{
                  this.userService.presentToast("Παρακαλώ επιβεβαίωστε τον αριθμό του κινητού σας.", "warning");
                  this.userService.setNavData([user.phone,user.password,"google"]);
                  this.rout.navigate(['/otp-verification']);
                },err=>{
                });
              } else if(err.error=="Onboarding"){
             
                this.rout.navigate(['/onboarding']);  //PREPEI NA TO KANEIS GIA KATHE REQUEST P KANEIS, PROTINW MESA STO USER SERVICE OLA TA RESPONSES CHECK OTI EXI TELIWSEI TO ONBOARDING
              
            }
              else{
                this.userService.presentToast("Κάτι πήγε στραβά.", "danger");      
              }
              
            });
        }

    
      

      
      this.userService.presentToast("Η επαλήθευση αριθμού ολοκληρώθηκε με επιτυχία.", "success");

    }
    });
    
    }

  goBack() {
   // if(this.tabID==1){
      this.navCtrl.back();

   // }else{
   // this.tabID--;
   // }
    
}

emailValidation(){
 return 1;
}
  emailCheck(eve: any){
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

gotoNextField(nextElement: { setFocus: () => void; }){
nextElement.setFocus();
}




submit(){

}

resendOTP(){
  this.userService.requestOTP(this.navData[0]).subscribe(data=>{
    this.userService.presentToast("Εισάγετε τον αριθμό που λάβατε στο κινητό σας.", "warning");
      
  },err=>{
  });    }
}
