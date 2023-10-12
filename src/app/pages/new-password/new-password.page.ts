import { Component, OnInit } from '@angular/core';
import { Router,ActivatedRoute } from '@angular/router';
import { MenuController, LoadingController, ToastController, NavController } from '@ionic/angular';
import { User } from 'src/app/models/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.page.html',
  styleUrls: ['./new-password.page.scss'],
})
export class NewPasswordPage implements OnInit {
  passwordType = 'password';
  passwordIcon!: string;
  color8chars="danger";
  name8chars="close-outline";
  colorSpecial="danger";
  nameSpecial="close-outline";
  colorMatch="danger";
  nameMatch="close-outline";
  the_password!: string;
  loader: any;
  repeated_password!: string;
  disabledButton="true";
  isDismiss = false;
  token!: string;
  variableClass!: string;
  signUpForm:any;
  signup_user: User = new User();
  navData!: string[];
  constructor(private route : Router,private actRouter: ActivatedRoute,private menu: MenuController,
    private loadingCtrl: LoadingController,private navCtrl: NavController, private toastCtrl: ToastController,private user: UserService,private userService:UserService) { }

  ngOnInit() {
    this.signUpForm=this.userService.getNavData();
  }

  newPassword(){
    
    this.actRouter.queryParams
      .subscribe(params => {
        this.token = params['token'];
      }
    );
      if(this.token!=null){

    this.user.setNewPassword(this.the_password,this.repeated_password,this.token).subscribe(data => {
      this.userService.presentToast("Η αλλαγή κωδικού ήταν επιτυχής.", "success");
      //Wait 1 second, then redirect it to home page.
     
    }, err => {
      this.userService.presentToast("Η αλλαγή κωδικού απέτυχε", "danger");
    });
    this.route.navigate(['login']);  
  }else {
    this.signup_user.app="beauty"

    this.signup_user.password=this.the_password;
    this.signup_user.repeated_password=this.repeated_password;
    this.signup_user.username=this.signUpForm[0];
    this.signup_user.name=this.signUpForm[1]+"$"+this.signUpForm[2];
    this.signup_user.phone=this.signUpForm[3];
    this.navData=[this.signUpForm[0],this.the_password]
    this.userService.setNavData(this.navData);
    this.user.register(this.signup_user).subscribe(data => {

      this.userService.presentToast("Η εγγραφή ήταν επιτυχής. Παρακαλούμε επαληθεύστε το τηλέφωνο σας.", "success");
        this.userService.setNavData([ this.signup_user.username,this.signup_user.password,"ordinary"])
        this.route.navigate(['otp-verification']);  
    }, err => {
      console.log(err)

      if(err.error=="Phone exists"){
      this.userService.presentToast("Το τηλέφωνο που χρησιμοποιήσατε υπάρχει. Παρακαλώ επιλέξτε άλλο τηλέφωνο.", "danger");
      this.navCtrl.back();

      }else if(err.error=="Email exists"){
        this.userService.presentToast("Το E-mail που χρησιμοποιήσατε υπάρχει. Παρακαλώ επιλέξτε άλλο E-mail.", "danger");
        this.navCtrl.back();
       

      }else{
        this.userService.presentToast("Κάτι πήγε στραβά. Ελέγξτε τα στοιχεία που εισάγατε στη φόρμα.", "danger");
        this.navCtrl.back();

      }
    });

  }
}



  hideShowPassword() {

    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
    this.passwordIcon = this.passwordIcon === 'eye-off-outline' ? 'eye-outline' : 'eye-off-outline';
}

onChange(){
  if(this.the_password.length>0){
    this.passwordIcon="eye-outline";
  }else{
    this.passwordIcon="null";
  }
  if(this.the_password.length>7){
    this.color8chars="success"
    this.name8chars="checkmark-outline"

  }else{
    this.color8chars="danger"
    this.name8chars="close-outline"
  }

  const regex = /(?=.*\d)(?=.*[a-zα-ω])(?=.*[A-ZΑ-Ω])(?=.*[!@#$%^&*()+=-\?;,./{}|\":<>\[\]\\\' ~_]).{1,}/   
  const result=regex.test(this.the_password) // outputs true
  if(result){
    this.colorSpecial="success"
    this.nameSpecial="checkmark-outline"
  }else{
    this.colorSpecial="danger"
    this.nameSpecial="close-outline"
  }

  if(this.the_password==this.repeated_password && this.the_password!=''){
    this.colorMatch="success"
    this.nameMatch="checkmark-outline"
  }else{
    this.variableClass="invalid-item"
    this.colorMatch="danger"
    this.nameMatch="close-outline"
  }
  
  if((this.the_password.length>7) && (result) ){
    this.variableClass="valid-item"
    if (this.the_password==this.repeated_password){
      this.disabledButton="false";
    }else{
      this.disabledButton="true";
  
    }
  }else{
    this.variableClass="invalid-item"

  }
 
}



goBack() {
  this.navCtrl.back();
  }
}
