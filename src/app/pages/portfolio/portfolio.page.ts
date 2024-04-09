import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonModal, ModalController, NavController, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  FacebookLogin,
  FacebookLoginPlugin,
  FacebookLoginResponse,
} from '@capacitor-community/facebook-login';
import { Camera, GalleryPhoto } from '@capacitor/camera';
import { FileInfo, Filesystem } from '@capacitor/filesystem';
import { FacebookImagesPage } from '../facebook-images/facebook-images.page';
import { InstagramImagesPage } from '../instagram-images/instagram-images.page';
import { ImagesPage } from '../images/images.page';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.page.html',
  styleUrls: ['./portfolio.page.scss'],
})
export class PortfolioPage implements OnInit {

  portfolio:  Array<any>= new Array<any>;
  @ViewChild('newFolderModal') newFolderModal!: IonModal;
  @ViewChild('editFolderModal') editModal!: IonModal;
  folderName:any;
  toBeEditedFolderName: any;
  folderImageToBeEdited: any;
  folderIdToBeEdited: any;
  imageWillChange: string="false";
  loadingOn=true
  imageSelected = false;
  imagePreview: SafeUrl | null = null;
  newFolderImage:string="";
  newFolderName:string="";
  pagesToChoose: any;
  choosePage: boolean=true;
  pageChosen: boolean=false;facebookUserAccountId: any;
  albumChosen: boolean=false;
  pageName: any="";
  instagramPhotos: any;
  facebookPages: any;
  instagramPages: any;
  instagramImages: any;

  @ViewChild('_fileInput') _fileInput: any;

  fbLogin!: FacebookLoginPlugin;
  facebookAccessToken: any;
  newImages: Array<string>=new Array<string>;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  selectedImage = { imageLink: '', selected: false };
  currentAlbum: any; // The currently selected album
  currentAlbumPhotos: any;
  newImageChosen: boolean=false;

  constructor(private actionSheetCtrl: ActionSheetController,private modalController:ModalController,private plt: Platform,private userService:UserService,private navCtl:NavController,private sanitizer: DomSanitizer,private alertController: AlertController,private router:Router,private actionSheetController:ActionSheetController,) {
    this.fbLogin = FacebookLogin;
  }

  ngOnInit() {
    FacebookLogin.initialize({ appId: '718122076068329' });

    this.getPortfolio();
  }

  getPortfolio(){

    this.userService.getPortfolio().subscribe(data => {
      this.portfolio=data
      this.loadingOn=false
    }, err => {
      this.portfolio = err.error.text;   //epeidi den einai json to response gurnaei error
    }
    );
  }

  goBack() {
    this.modalController.dismiss();
    }


    onWillDismiss(event: Event) {
      this.newFolderName=""
      this.newFolderImage=""
      this.newImageChosen=false;

      const ev = event as CustomEvent<OverlayEventDetail<string>>;
      if (ev.detail.role === 'confirm') {
        //this.message = `Hello, ${ev.detail.data}!`;
      }
    }

    confirmNewFolderModal(){
     
      this.userService.newPorfolioFolder(this.newFolderName,this.newFolderImage).subscribe(data=>{
        this.newFolderImage="";
        this.newFolderName="";
        this.userService.presentToast("Ο φάκελος δημιουργήθηκε με επιτυχία!","success")
        this.portfolio=[]
        this.getPortfolio()
        this.newFolderModal.dismiss('confirm');

      },error=>{
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ προσπαθήστε αργότερα.","danger")
      })

    }

    cancelNewFolderModal(){
      this.newFolderModal.dismiss( 'confirm');

    }

    confirmEditFolderModal(){
      this.userService.changePortfolioFolder(this.folderIdToBeEdited,this.toBeEditedFolderName,this.newFolderImage,this.imageWillChange).subscribe(data=>{
        //change the folder without refresh
        for(let i=0;i<this.portfolio.length;i++){
          if(this.portfolio[i].id== this.folderIdToBeEdited){
            this.portfolio[i].displayedName=this.toBeEditedFolderName
            this.portfolio[i].image=data.image
            this.folderIdToBeEdited="";
            this.toBeEditedFolderName="";
            this.newFolderImage="";
            this.imageWillChange="false";
            break;
          }
        }
        
        this.userService.presentToast("Ο φάκελος άλλαξε με επιτυχία!","success")
      },error=>{
        this.folderIdToBeEdited="";
        this.toBeEditedFolderName="";
        this.folderImageToBeEdited="";
        this.imageWillChange="false";

        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ προσπαθήστε αργότερα.","danger")
      })
      this.editModal.dismiss( 'confirm');

    }

    cancelEditFolderModal(){
      this.editModal.dismiss( 'confirm');

    }



    onImageSelected(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.imageSelected = true;
          this.imagePreview = this.sanitizer.bypassSecurityTrustUrl(reader.result as string);
        };
      }
    }

 
   

    deleteFolder(item:any){
      this.userService.deletePortfolioFolder(item.id).subscribe(data=>{
        //change the folder without refresh
        for(let i=0;i<this.portfolio.length;i++){
          if(this.portfolio[i].id==item.id){
            this.portfolio.splice(i,1)
            
            
            break;
          }
        }
        
        this.userService.presentToast("Ο φάκελος διαγράφτηκε με επιτυχία!","success")
      },error=>{
        this.folderIdToBeEdited="";
        this.toBeEditedFolderName="";
        this.folderImageToBeEdited="";
        this.imageWillChange="false";

        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ προσπαθήστε αργότερα.","danger")
      })
    }

    passDataToEditModal(item:any){
      this.editModal.present();

      this.toBeEditedFolderName=item.displayedName;
      this.newFolderImage=item.image;
      this.folderIdToBeEdited=item.id;

    }


   

    async presentAlert(item: any) {
      const now = new Date().getTime();
      const endTime = now + 5000; // set the end time to 5 seconds from now
    
      const intervalId = setInterval(() => {
        const timeLeft = Math.round((endTime - new Date().getTime()) / 1000);
    
        if (timeLeft <= 0) {
          clearInterval(intervalId); // clear the interval when the time is up
          yesButton.disabled = false; // enable the button
          yesButton.style.color = ''; // restore the text color
          yesButton.innerText = 'Ναι'; // restore the button text
        } else {
          yesButton.innerText = `Ναι (${timeLeft})`; // update the button text
        }
      }, 100);
    
      const alert = await this.alertController.create({
        cssClass: 'custom-alert',
        header: 'Διαγραφή Φακέλου',
        message: 'Θέλετε σίγουρα να διαγράψετε τον φάκελο και όλες τις φωτογραφίες μέσα στο φάκελο;',
        buttons: [
          {
            text: 'Όχι',
            cssClass: 'alert-button-cancel',
          },
          {
            text: 'Ναι',
            cssClass: 'alert-button-confirm',
            handler: () => {
              //do stuff
              this.deleteFolder(item);
            },
            role: 'yes-button',
          },
        ],
      });
    
      const yesButton = alert.getElementsByClassName('alert-button-confirm')[0] as HTMLButtonElement;
      yesButton.disabled = true; // disable the button by default
      yesButton.style.color = 'grey'; // set the text color to grey
    
      alert.onDidDismiss().then(() => {
        clearInterval(intervalId); // clear the interval when the alert is dismissed
      });
    
      await alert.present();
    }
    
   

    async goToImages(item:any) {
      const modal = await this.modalController.create({
        component: ImagesPage,
        componentProps: {
          folder_id: item.id, // Pass the entire room object
        }
      });
      await modal.present();
    
      
    }

    async presentActionSheet() {
      const actionSheet = await this.actionSheetController.create({
       header: 'Επιλέξτε πηγή εικόνας',
       buttons: [
         {
           text: 'Facebook',
           icon: 'logo-facebook',
           handler: () => {
             this.selectImageFromFacebook();
           }
         },
         {
           text: 'Instagram',
           icon: 'logo-instagram',
           handler: () => {
            this.selectImageFromInstagram();
          }
         },
       
         {
           text: 'Αποθηκευτικός Χώρος',
           icon: 'folder',
           handler: () => {
            this.importFromStorage();
            
           }
         },
            
         {
           text: 'Άκυρο',
           icon: 'close',
           role: 'cancel'
         }
       ]
     });
     await actionSheet.present();
   }
    
  
  async importFromStorage() {
    const images = await Camera.pickImages({
      quality: 100,
      correctOrientation:true,
    });
  
    if (images && images.photos.length > 0) {
      const photo = images.photos[0];
      await this.saveImages(photo);
    }
  }
  

  async saveImages(photo: GalleryPhoto) {
    const newImages = [];
  
      if (photo.format != "jpeg" && photo.format != "png") {
        this.userService.presentToast("Δεν υποστηρίζεται αυτή η μορφή εικόνας", "danger");
      } else {
        const base64Data = await this.readAsBase64(photo);
        this.newFolderImage=base64Data
        this.imageWillChange="true";
        this.newImageChosen=true;

            }
    
  
    // Add new images to the array
  }
  async readAsBase64(photo: GalleryPhoto): Promise<string> {
    if (this.plt.is('hybrid')) {
      if (photo.path !== undefined) { // add check for undefined
        const file = await Filesystem.readFile({
          path: photo.path
        });
        return file.data as string;
      } else {
        throw new Error('photo.path is undefined');
      }
    } else {
      const url = photo.webPath;
      if (url !== undefined) {
        const response = await fetch(url);
        const blob = await response.blob();
        let base64Data = await this.convertBlobToBase64(blob);
        return (base64Data as string).split(',')[1];
      } else {
        throw new Error('photo.webPath is undefined');
      }
    }
  }

  convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });


  async saveImage(){
  const base64data = await this.imageUrlToBase64(this.selectedImage.imageLink);
  this.newImageChosen=true;
  this.newFolderImage=base64data.split(',')[1]
}
async imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();
  this.imageWillChange="true";

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result?.toString() ?? '';
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

removeNewFolderImage(){
  this.newFolderImage=""
}


async selectImageFromFacebook() {
  const modal = await this.modalController.create({
    component: FacebookImagesPage,
    
  });
  await modal.present();

  const { data } = await modal.onDidDismiss();
  if (data) {
    this.selectedImage = data.imageSelected; // Update the room's table types with the returned data
    this.saveImage();
  }
}

async selectImageFromInstagram() {
  const modal = await this.modalController.create({
    component: InstagramImagesPage,
    
  });
  await modal.present();

  const { data } = await modal.onDidDismiss();
  if (data) {
    this.selectedImage = data.imageSelected; // Update the room's table types with the returned data
    this.saveImage();
    console.log(data)
  }
}

async presentOptions(item: any) {
  const actionSheet = await this.actionSheetCtrl.create({
    header: `Ενέργειες για φάκελο ${item.displayedName}`,
    buttons: [
      {
        text: 'Επεξεργασία',
        icon: 'create',  // You can change this to any appropriate Ionicons icon
        handler: () => {
          this.passDataToEditModal(item)
                      }
      },
      {
        text: 'Διαγραφή',
        role: 'destructive',
        icon: 'trash',   // You can change this to any appropriate Ionicons icon
        handler: () => {
          this.presentAlert(item)
          // Implement your delete logic here
        }
      },
      {
        text: 'Ακύρωση',
        role: 'cancel'
      }
    ]
  });
  await actionSheet.present();
}

}
    


