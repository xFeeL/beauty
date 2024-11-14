import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-pwa-installation',
  templateUrl: './pwa-installation.page.html',
  styleUrls: ['./pwa-installation.page.scss'],
})
export class PwaInstallationPage implements OnInit {


  constructor(private userService:UserService,private modalController: ModalController) { }

  ngOnInit(): void {
    console.log("PWA Installation Modal Initialized");
  }

  goBack() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async copyLink() {
    const url = 'https://beauty.fyx.gr/';
    this.copyToClipboard(url)
      this.userService.presentToast('Ο σύνδεσμος αντιγράφηκε στο πρόχειρο.', 'success');
    } catch (error: any) {
      console.error('Error copying link:', error);
      this.userService.presentToast('Η αντιγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.', 'danger');
    }
  


  copyToClipboard(url: string) {
  
    navigator.clipboard.writeText(url).then(() => {

      // Here, you can also update the tooltip text and change the icon to indicate that the URL has been copied.
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });
  

}
}
