import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {
  constructor(private userService:UserService,private modalController:ModalController)  {
    
}
formData = {
  fullname: '',
  email: '',
  message: ''
};
  ngOnInit() {
  }

  goBack(){
    this.modalController.dismiss()
  }

  submitData() {
    if (this.isValid()) {
      this.userService.submitContactForm(this.formData).subscribe(
        response => {
          this.userService.presentToast("Λάβαμε το μήνυμα σας και θα επικοινωνήσουμε το συντομότερο.", "success");
          this.modalController.dismiss()

        },
        error => {
          this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά αργότερα.", "danger");
        }
      );
    } else {
      console.error('Form data is invalid.');
    }
  }

  isValid() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.formData.fullname.trim() !== '' &&
           emailPattern.test(this.formData.email) &&
           this.formData.message.trim() !== '';
  }

}
