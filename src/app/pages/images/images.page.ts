import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonModal, IonPopover, ModalController, NavController, NavParams, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { Gallery, GalleryItem, ImageItem } from 'ng-gallery';
import { Camera, CameraResultType, CameraSource, GalleryPhoto } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { FacebookLogin, FacebookLoginPlugin, FacebookLoginResponse } from '@capacitor-community/facebook-login';
import { ExternalService } from 'src/app/services/external.service';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { LyDialog } from '@alyle/ui/dialog';
import { CropperDialog } from '../edit-profile/cropper-dialog';
import { ChangeDetectorRef } from '@angular/core';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-images',
  templateUrl: './images.page.html',
  styleUrls: ['./images.page.scss'],
})
export class ImagesPage implements OnInit {
  folder_id = "";
  images: GalleryItem[] = [];
  folderName: any;
  @ViewChild('_fileInput') _fileInput: any;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  photos: { imageLink: string, selected: boolean }[] = [];
  @ViewChild('facebookModal') facebookModal!: IonModal;
  @ViewChild('instagramModal') instagramModal!: IonModal;
  @ViewChild('deletePop') deletePop!: IonPopover;
  currentAlbumPhotos: any;
  selectedImage = { imageLink: '', selected: false };
  currentAlbum: any; 
  fbLogin!: FacebookLoginPlugin;
  facebookAccessToken: any;
  @ViewChild('newPhotosModal') newPhotosModal!: IonModal;
  newPhotos = new Array<String>();
  newImages: Array<string> = [];
  pagesToChoose: any;
  personalName: any;
  personalImage: any;
  choosePage: boolean = true;
  pageChosen: boolean = false;
  facebookUserAccountId: any;
  albumChosen: boolean = false;
  pageName: any = "";
  instagramPhotos: any;
  facebookPages: any;
  instagramPages: any;
  instagramImages: any;
  loadingOn = true;
  storageInput: boolean = false;
  deleteImages = false;
  cropped?: string;
  selectedImages: any[] = [];

  constructor(
    private modalController: ModalController,
    private navParams: NavParams,
    private gallery: Gallery,
    private userService: UserService,
    private navCtrol: NavController,
    private plt: Platform,
    private actionSheetController: ActionSheetController,
    private alertController: AlertController,
    private externalService: ExternalService,
    private _dialog: LyDialog,
    private _cd: ChangeDetectorRef
  ) {
    this.setupFbLogin();
  }

  ngOnInit() {
    FacebookLogin.initialize({ appId: '718122076068329' });
  }

  ionViewWillEnter() {
    this.getImageNames();
  }

  loadLightBox() {
    this.gallery.ref().load(this.images);
    this.loadingOn = false;
  }

  async setupFbLogin() {
    this.fbLogin = FacebookLogin;
  }

  deleteFolderImages() {
    this.deleteImages = !this.deleteImages;
    this.deletePop.dismiss();
  }

  openAlbum(album: any) {
    this.albumChosen = true;
    this.pageChosen = false;
    this.selectedImage = { imageLink: '', selected: false };
    this.currentAlbum = album;
    this.currentAlbumPhotos = [];
    this.externalService.getFacebookPhotosFromAlbumId(this.facebookAccessToken, album.id).subscribe(data => {
      data.photos.data.forEach((photo: { images: { source: any; }[]; }) => {
        this.currentAlbumPhotos.push({ imageLink: photo.images[0].source, selected: false });
      });
    });
  }

  backToAlbums() {
    this.albumChosen = false;
    this.choosePage = false;
    this.pageChosen = true;
  }

  async presentAlert(index: number, item: any) {
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
            this.deleteImage(index, item);
          },
        },
      ],
    });

    await alert.present();
  }

  async confirmInstagramModal() {
    this.loadingOn = true;
    for (const img of this.selectedImages) {
      const base64data = await this.imageUrlToBase64(img.imageLink);
      this.newImages.push(base64data.split(',')[1]);
    }
    this.instagramModal.dismiss();
    this.loadingOn = false;
  }

  goBack() {
    this.modalController.dismiss();
  }

  confirmNewPhotosModal() {
    this.loadingOn = true;
    this.userService.addNewPhotos(this.newImages).subscribe(
      () => {
        this.getImageNames();
        this.loadingOn = false;
        this.newImages = [];
        this.newPhotosModal.dismiss('confirm');
      },
      () => {
        this.loadingOn = false;
        this.userService.presentToast('Κάτι πήγε στραβά. Προσπαθήστε ξανά.', 'danger');
      }
    );

  }

  cancelNewPhotosModal() {
    this.newImages.splice(0);
    this.newPhotosModal.dismiss('confirm');
  }

  removeImage(item: any) {
    this.newImages = this.newImages.filter(element => element != item);
  }

  async selectImages() {
    const images = await Camera.pickImages({
      quality: 100,
    });
  
    if (images && images.photos.length > 0) {
      for (const photo of images.photos) {
        const base64Data = await this.readAsBase64(photo);
        this.openCropperDialog(`data:image/${photo.format};base64,${base64Data}`);
      }
    }
  }
  
  async saveImages(photos: GalleryPhoto[]) {
    for (const photo of photos) {
      if (photo.format !== 'jpeg' && photo.format !== 'png') {
        this.userService.presentToast('Δεν υποστηρίζεται αυτή η μορφή εικόνας', 'danger');
      } else {
        const base64Data = await this.readAsBase64(photo);
        this.newImages.push(base64Data.split(',')[1]);
      }
    }
  }

  async readAsBase64(photo: GalleryPhoto): Promise<any> {
    if (this.plt.is('hybrid')) {
      const file = await Filesystem.readFile({ path: photo.path! });
      return file.data; // Filesystem.readFile returns an object with a data property that is a string
    } else {
      const response = await fetch(photo.webPath!);
      const blob = await response.blob();
      const base64Data = await this.convertBlobToBase64(blob);
      return base64Data.split(',')[1];
    }
  }
  async imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  convertBlobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });

  updateGallery() {
    this.newImages = [...this.newImages];
  }

  importFromStorage() {
    this._fileInput.nativeElement.click();
  }

  cancelFacebookModal() {
    this.facebookModal.dismiss();
  }

  cancelInstagramModal() {
    this.instagramModal.dismiss();
  }

  backToPages() {
    this.pageChosen = false;
    this.choosePage = true;
    this.albumChosen = false;
  }

  goToPage(page: any) {
    this.albums = [];
    this.choosePage = false;
    this.pageChosen = true;
    this.pageName = page.name;

    if (this.facebookUserAccountId === page.id) {
      this.getAlbums(this.facebookAccessToken, page.id);
    } else if (!page.token) {
      this.externalService.getPageAccessToken(this.facebookAccessToken, page.id).subscribe(data2 => {
        page.token = data2.access_token;
        this.getAlbums(page.token, page.id);
      });
    } else {
      this.getAlbums(page.token, page.id);
    }
  }

  getAlbums(token: string, pageId: string) {
    this.externalService.getAlbums(token, pageId).subscribe(data => {
      this.facebookModal.present();
      data.data.forEach((album: { name: any; picture: { data: { url: any; }; }; id: any; }) => {
        this.albums.push({ folder_name: album.name, imageLink: album.picture.data.url, id: album.id });
      });
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε πηγή εικόνας',
      buttons: [
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

  async handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64String = reader.result as string;
        if (base64String) {
          this.openCropperDialog(base64String);
        } else {
          console.error('Base64 string is undefined');
        }
      };
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
      };
      reader.readAsDataURL(file);
    }
  }
  async presentActionSheetChoosePage() {
    const buttons = this.pagesToChoose.map((page: { username: any; }) => ({
      text: page.username,
      icon: 'logo-instagram',
      handler: () => {
        // this.loginWithInstagram(page.id);
      }
    }));

    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε Instagram λογαριασμό',
      buttons: buttons
    });

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
          this.userService.getInstagramTokenFromCode(code.split('#')[0]).subscribe(data => {
            this.externalService.getInstagramUser(data.access_token).subscribe(data3 => {
              this.pagesToChoose = [{ name: data3.username, url: "", id: data3.id }];
              this.instagramModal.present();
            });
            this.externalService.getInstagramPhotos(data.access_token).subscribe(images => {
              this.instagramImages = images.data.filter((img: { media_type: string; }) => img.media_type !== 'VIDEO').map((img: { media_url: any; }) => ({ imageLink: img.media_url, selected: false }));
              this.instagramModal.present();
            });
          });
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

  selectImage(image: any) {
    if (!this.selectedImages.includes(image)) {
      this.selectedImages.push(image);
    } else {
      this.selectedImages = this.selectedImages.filter(selectedImage => selectedImage !== image);
    }
    image.selected = !image.selected;
  }

  getImageNames() {
    this.userService.getExpertImages().subscribe(data => {
      this.images = data.map((item: any) => new ImageItem({ src: item, thumb: item }));
      this.loadLightBox();
    });
  }

  deleteImage(index: number, item: any) {
    const url = item.data.src;
    const imageIdMatch = url.match(/\/([a-zA-Z0-9_]+)\.png/);
    if (!imageIdMatch) {
      console.error('Failed to extract image ID from URL');
      return;
    }
    const imageId = imageIdMatch[1];
    this.userService.deleteImagePortfolio(imageId).subscribe(() => {
      this.images.splice(index, 1);
    });
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    this.openCropperDialog(image.webPath!);
  }

  openCropperDialog(imageURL: string) {
    if (!imageURL) {
      console.error('Image URL is undefined');
      return;
    }
  
    this.cropped = null!;
    this._dialog.open(CropperDialog, {
      data: {
        imageURL: imageURL,
        width: 700,
        height: 350,
        round: false
      },
      width: '320px',
      disableClose: true
    }).afterClosed.subscribe((result?: ImgCropperEvent) => {
      if (result && result.dataURL) {
        this.cropped = result.dataURL;
        this._cd.markForCheck();
        this.newImages.push(this.cropped.split(',')[1]);
      } else {
        console.error('Cropped image data URL is undefined');
      }
    });
  }
  
  async presentActionSheetImageSource() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε πηγή εικόνας',
      buttons: [
        {
          text: 'Αποθηκευτικός Χώρος',
          icon: 'folder',
          handler: () => {
            this.importFromStorage();
          }
        },
        {
          text: 'Κάμερα',
          icon: 'camera',
          handler: () => {
            this.takePicture();
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

    async confirmFacebookModal() {
    this.loadingOn = true;

    for (let i = 0; i < this.selectedImages.length; i++) {
      const base64data = await this.imageUrlToBase64(this.selectedImages[i].imageLink);
      console.log(base64data)
      this.newImages.push(base64data.split(',')[1])
    }
    this.facebookModal.dismiss();
    this.loadingOn = false;



  }

  
  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      //this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}

const data2 = [
  {
    src: "",
    thumb: ""
  },
];
