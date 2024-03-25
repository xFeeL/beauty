import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonModal, IonPopover, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { OverlayEventDetail } from '@ionic/core/components';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Gallery, GalleryItem,ImageItem } from 'ng-gallery';
import { Camera, CameraResultType, CameraSource, GalleryPhoto, Photo } from '@capacitor/camera';
import { FileInfo, Filesystem } from '@capacitor/filesystem';
import {
  FacebookLogin,
  FacebookLoginPlugin,
  FacebookLoginResponse,
} from '@capacitor-community/facebook-login';
import { ExternalService } from 'src/app/services/external.service';
@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {
 folder_id="";
 images: GalleryItem[] = new Array<GalleryItem>;
  folderName: any;
  @ViewChild('_fileInput') _fileInput: any;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  photos: { imageLink: string, selected:boolean}[] = [];
  @ViewChild('facebookModal') facebookModal!: IonModal;

  @ViewChild('instagramModal') instagramModal!: IonModal;
  @ViewChild('deletePop') deletePop!: IonPopover;

  currentAlbumPhotos: any;
  selectedImage = { imageLink: '', selected: false };
  currentAlbum: any; // The currently selected album
  fbLogin!: FacebookLoginPlugin;

  facebookAccessToken: any;
  @ViewChild('newPhotosModal') newPhotosModal!: IonModal;
newPhotos= new Array<String>;
newImages: Array<string>=new Array<string>;
  pagesToChoose: any;
  personalName: any;
  personalImage: any;
  choosePage: boolean=true;
  pageChosen: boolean=false;facebookUserAccountId: any;
  albumChosen: boolean=false;
  pageName: any="";
  instagramPhotos: any;
  facebookPages: any;
  instagramPages: any;
  instagramImages: any;
loadingOn=true;
  storageInput: boolean=false;
  deleteImages=false;
constructor(private modalController:ModalController,private navParams:NavParams, private actRouter:ActivatedRoute,public gallery: Gallery,private userService:UserService,private navCtrol:NavController,		private plt: Platform,
  private actionSheetController:ActionSheetController,private alertController:AlertController,private externalService:ExternalService){
    this.setupFbLogin();

 }
   ngOnInit() {
    FacebookLogin.initialize({ appId: '718122076068329' });
    }

  ionViewWillEnter() {
    this.folderName=this.userService.getNavData();
    this.folder_id=this.navParams.get('folder_id')
    this.userService.getFolderName(this.folder_id).subscribe(data=>{
      this.folderName=data.displayedName
    },err=>{
      
    })

    console.log(this.folder_id)
    this.getImageNames();
  }
  

    loadLightBox() {
      this.gallery.ref().load(this.images);
      this.loadingOn=false;
    }

    async setupFbLogin() {
      this.fbLogin = FacebookLogin;
    
  }

 deleteFolderImages(){
  this.deleteImages=!this.deleteImages
  this.deletePop.dismiss()
 }

  openAlbum(album: any) {
    this.albumChosen=true;
    this.pageChosen=false;
    this.selectedImage = { imageLink: '', selected: false };


    console.log
    this.currentAlbum = album;
    this.currentAlbumPhotos=[]
    this.externalService.getFacebookPhotosFromAlbumId(this.facebookAccessToken, album.id).subscribe(data => {
      console.log("THE DATA")
      console.log(data)
      for (let i=0;i<data.photos.data.length;i++){
        const photo = { imageLink: data.photos.data[i].images[0].source, selected:false};

          this.currentAlbumPhotos.push(photo) 
        

        
      }
      console.log("THE DATA23")

      console.log(this.currentAlbumPhotos)
    });
  }

  backToAlbums() {
    this.albumChosen=false;
    this.choosePage=false;
    this.pageChosen=true;
    
 
    
  }
  deleteImage(index: number, item: any) {
    // Remove the image at the specified index from the 'images' array
    this.images.splice(index, 1);
    console.log("THE ITEM");
    console.log(item);
    const url = item.data.src;

    // Use a regular expression to extract the image ID from the URL
    const imageIdMatch = url.match(/\/([a-zA-Z0-9]+)\.png/);
    if (!imageIdMatch) {
        console.error("Failed to extract image ID from URL");
        return;
    }
    const imageId = imageIdMatch[1];

    this.userService.deleteImagePortfolio(this.folder_id, imageId).subscribe(data => {
        // Handle successful response
    }, err => {
        // Handle error
    });
}


/**
 * Extracts the image ID from a given URL.
 */
private extractImageId(url: string): string {
    const start = url.lastIndexOf("/") + 1; // Get the position of the last slash and add 1 to exclude it
    const end = url.lastIndexOf("."); // Get the position of the last dot
    return url.substring(start, end);
}

    
  getImageNames(){
    data2.splice(0);
    this.userService.getPortfolioFolderImages(this.folder_id).subscribe(data => {
      if(data!=null){

   
    for(let i=0;i<data.length;i++){

      
      data2.push({
        src:data[i],
        thumb: data[i]
      })
    }
    this.images = data2.map(item =>
      new ImageItem({ src: item.src, thumb: item.thumb })
    );
    this.loadLightBox();
    console.log(this.images)

  }
},err=>{

})
}
    
  async confirmFacebookModal(){
    this.loadingOn=true;

  for(let i=0;i<this.selectedImages.length;i++){
    const base64data = await this.imageUrlToBase64(this.selectedImages[i].imageLink);
    console.log(base64data)
    this.newImages.push(base64data.split(',')[1])
  }
  this.facebookModal.dismiss();
  this.loadingOn=false;



}

async presentAlert(index: number,item:any) {
  const alert = await this.alertController.create({
    header: 'Θέλετε σίγουρα να διαγράψετε τη φωτογραφία;',
    cssClass: 'custom-alert',
    buttons: [
      {
        text: 'Όχι',
        cssClass: 'alert-button-cancel',
      },
      {
        text: 'Ναι',
        cssClass: 'alert-button-confirm',
        handler: () => {
          this.deleteImage(index,item)
        },
      },
    ],
  });

  await alert.present();
}

async confirmInstagramModal(){
  this.loadingOn=true;
  for(let i=0;i<this.selectedImages.length;i++){
    const base64data = await this.imageUrlToBase64(this.selectedImages[i].imageLink);
    console.log(base64data)
    this.newImages.push(base64data.split(',')[1])
  }
  this.instagramModal.dismiss();
this.loadingOn=false;


}
goBack(){
  this.modalController.dismiss();

}

onWillDismiss(event: Event) {
  const ev = event as CustomEvent<OverlayEventDetail<string>>;
  if (ev.detail.role === 'confirm') {
    //this.message = `Hello, ${ev.detail.data}!`;
  }
}

confirmNewPhotosModal(){
this.userService.addNewPhotos(this.newImages,this.folder_id).subscribe(data=>{
this.getImageNames();
},err=>{

})  
 this.newImages.splice(0)
 
  this.newPhotosModal.dismiss( 'confirm');

}

cancelNewPhotosModal(){
  this.newImages.splice(0)

  this.newPhotosModal.dismiss( 'confirm');

}



removeImage(item:any){
  const newArr: string[] = this.newImages.filter((element) => {
    return element != item;
  });
  this.newImages=newArr
}

async selectImages() {
  const images = await Camera.pickImages({
    quality: 100,
    correctOrientation:true,
  });

  if (images && images.photos.length > 0) {
    const photos = images.photos;
    await this.saveImages(photos);
    this.updateGallery();
  }
}

async saveImages(photos: GalleryPhoto[]) {
  const newImages = [];

  for (const photo of photos) {

    if (photo.format != "jpeg" && photo.format != "png") {
      this.userService.presentToast("Δεν υποστηρίζεται αυτή η μορφή εικόνας", "danger");
    } else {
      const base64Data = await this.readAsBase64(photo);
      newImages.push(base64Data);
    }
  }

  // Add new images to the array
  this.newImages = [...this.newImages, ...newImages];
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

 async imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const blob = await response.blob();

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


convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
  const reader = new FileReader;
  reader.onerror = reject;
  reader.onload = () => {
      resolve(reader.result);
  };
  reader.readAsDataURL(blob);
});

updateGallery() {
  // Force ng-gallery to re-render by changing the array reference
  this.newImages = [...this.newImages];
}


   importFromStorage(){
  //this._fileInput.nativeElement.click();
  this.selectImages()
}

cancelFacebookModal(){
  this.facebookModal.dismiss()
}

cancelInstagramModal(){
  this.instagramModal.dismiss()
}

backToPages(){
  this.pageChosen=false;
  this.choosePage=true;
  this.albumChosen=false;
}

goToPage(page:any){
  this.albums=[]
  this.choosePage=false;
  this.pageChosen=true
  this.pageName=page.name
  let tempToken;
  if(this.facebookUserAccountId==page.id){
    console.log("User token")

    this.getAlbums(this.facebookAccessToken,page.id)

  }else if (page.token==undefined){
    console.log("Paw gia token")
    console.log(page.token)
   this.externalService.getPageAccessToken(this.facebookAccessToken,page.id).subscribe(data2=>{
      page.token=data2.access_token
      this.getAlbums(page.token,page.id)
    })

  }else{
    console.log("Exei to page token")
    this.getAlbums(page.token,page.id)

  }
 
}

getAlbums(token:string,pageId:string){
  this.externalService.getAlbums(token,pageId).subscribe(data=>{
    this.facebookModal.present();
    for (let i=0;i<data.data.length;i++){
      const album = { folder_name: data.data[i].name, imageLink: data.data[i].picture.data.url,id:data.data[i].id };
      this.albums.push(album);
    }
  })
}




importFromFacebook(){
  this.facebookOAuth()
}
async facebookOAuth(): Promise<void> {
  this.pagesToChoose=[]
this.choosePage=true
  const FACEBOOK_PERMISSIONS = ['user_photos','pages_show_list','pages_read_engagement']
  const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });
  if (result && result.accessToken) {
    console.log("MPIKA??A?S?")
    this.facebookAccessToken=result.accessToken.token
    this.externalService.getFacebookUserNameAndImage(this.facebookAccessToken).subscribe(data=>{
      let temp = {
        name: data.name,
        url: data.picture.data.url,
        id:data.id
      };
      this.facebookUserAccountId=data.id
    this.pagesToChoose.push(temp)
    })
    this.externalService.getFacebookPagesNameAndImage(this.facebookAccessToken).subscribe(pages=>{
      console.log("THE PAGES")
      console.log(pages)
      for(let i=0;i<pages.data.length;i++){
        let temp = {
          name: pages.data[i].name,
          url: pages.data[i].picture.data.url,
          id:pages.data[i].id

        };
          this.pagesToChoose.push(temp)
      }
      console.log(this.pagesToChoose)
      this.pageChosen=false;
      this.choosePage=true;
      this.albumChosen=false;
      this.selectedImages=[]
      this.facebookModal.present();
    },err=>{
    })
  }
}
selectedImages: any[] = [];
selectImage(image: any) {
  if (!this.selectedImages.includes(image)) {
    // If the image is not already selected, add it to the array
    this.selectedImages.push(image);
  } else {
    // If the image is already selected, remove it from the array
    this.selectedImages = this.selectedImages.filter(selectedImage => selectedImage !== image);
  }

  image.selected = !image.selected;
}

async presentActionSheet() {
   const actionSheet = await this.actionSheetController.create({
    header: 'Επιλέξτε πηγή εικόνας',
    buttons: [
      {
        text: 'Facebook',
        icon: 'logo-facebook',
        handler: () => {
          this.importFromFacebook();
        }
      },
      {
        text: 'Instagram',
        icon: 'logo-instagram',
        handler: () => {
          this.loginWithInstagram();
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



async presentActionSheetChoosePage() {
  const buttons=[]
  for(let i=0;i<this.pagesToChoose.length;i++){
    let temp={
      text: this.pagesToChoose[i].username,
      icon: 'logo-instagram',
      handler: () => {
        //this.loginWithInstagram(page.id);
      }
    };
    buttons.push(temp)
  }
  const actionSheet = await this.actionSheetController.create({
    header: 'Επιλέξτε Instagram λογαριασμό',
    buttons: buttons});
  await actionSheet.present();
}


    

 loginWithInstagram() {
  const authWindow = window.open(this.externalService.instagramAuthUrl, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
  if (!authWindow) {
    console.error('Unable to open Instagram authorization window.');
    return;
  }
  
  const intervalId = setInterval(() => {
    try {
      if (authWindow.closed) {
        clearInterval(intervalId);
      } else if (authWindow.location && authWindow.location.href.startsWith('https://localhost:8100')) {
        clearInterval(intervalId);
        const code = this.getCodeFromUrl(authWindow.location.href);
        this.userService.getInstagramTokenFromCode(code.split('#')[0]).subscribe(data=>{
          console.log(data)
          this.externalService.getInstagramUser(data.access_token).subscribe(data3=>{
              console.log(data3)
              let temp = {
                name: data3.username,
                url:"",
                id:data3.id
      
              };
              this.pagesToChoose=[]
              this.pagesToChoose.push(temp)
              this.instagramModal.present();
          },err=>{
          })
          this.externalService.getInstagramPhotos(data.access_token).subscribe(images=>{
            this.instagramImages=[]
            console.log(images)
            for(let i=0;i<images.data.length;i++){
              if(images.data[i].media_type!='VIDEO'){
                if ('children' in images.data[i]) {
                  for(let j=0;j<images.data[i].children.data.length;j++){
                    if(images.data[i].children.data[j].media_type!='VIDEO'){
                      const photo = { imageLink: images.data[i].children.data[j].media_url, selected:false};
                      this.instagramImages.push(photo)
                    }
                  }
                }else{
                  const photo = { imageLink: images.data[i].media_url, selected:false};
                  this.instagramImages.push(photo)
                }
              }
            }
            this.instagramModal.present()
          },err=>{
          })
        },err=>{
        })
        console.log(code)
        authWindow.close();
      }
    } catch (e) {
      // Do nothing
    }
  }, 0);
}

private getCodeFromUrl(url: string): any {
  const params = new URLSearchParams(url.split('?')[1]);
  return params.get('code');
}




}

const data2 = [
  {
    src:"",
    thumb:""
  },
 
];


