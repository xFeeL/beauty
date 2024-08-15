import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ActionSheetController, IonModal, ModalController, NavController } from '@ionic/angular';


import { ChooseAddressPage } from '../choose-address/choose-address.page';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { expertData } from 'src/app/models/expertData';
import { Camera, CameraResultType } from '@capacitor/camera';
import { CropperDialog } from './cropper-dialog';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { LyDialog } from '@alyle/ui/dialog';
import { FacebookImagesPage } from '../facebook-images/facebook-images.page';
import { InstagramImagesPage } from '../instagram-images/instagram-images.page';
import { NgModel } from '@angular/forms';
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  //changeDetection: ChangeDetectionStrategy.OnPush

})
export class EditProfilePage {

  image: string | undefined = "../../assets/icon/default-profile.png";
  cropped?: string;
  phone: string = "Error";
  name: string = "Error";
  new_image: string = "false";
  photos: { imageLink: string, selected: boolean }[] = [];
  facebookLink: string = "";
  instagramLink: string = "";
  tiktokLink: string = "";
  email: string = "Error";
  initialized: boolean = false;
  dataExpert: expertData = new expertData();
  displayed_phone: any;
  address: any;
  updatedAddress: boolean = false;
  resultBusinessNameCheck: boolean = false;
  resultPhoneCheck: boolean = true;
  phoneIconName: string = "checkmark-outline";
  phoneColor: string = "success";
  phoneVariableClass: string = "valid-item ion-margin-top pt7";
  businessNameItemClass = "ion-margin emptyBorderItem";
  businessNameIconName: string = "checkmark-outline";
  businessNameColor: string = "success";
  businessNameVariableClass: string = "valid-item ion-margin-top pt7";
  lastName: any;
  saveButtonEnabled: boolean = false;
  phoneDisplayedItemClass = "ion-margin emptyBorderItem"
  facebookAccessToken: any;
  currentAlbumPhotos: any;
  selectedImage = { imageLink: '', selected: false };
  businessAccountId: any;
  pagesToChoose: any;
  currentAlbum: any; // The currently selected album
  @ViewChild('_fileInput') _fileInput: any;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  needReferesh: any = false;
  expert_categories: any = [];
  all_categories: any = [];
  coordinates: string = "";

  constructor(

    private actionSheetController: ActionSheetController, private _dialog: LyDialog, private _cd: ChangeDetectorRef, private navCtrl: NavController, private userService: UserService, private router: Router, private modalController: ModalController) {



  }

  ngOnInit() {

  }

  ionViewWillEnter() {
    this.userService.sseConnect(window.location.toString());

    if (localStorage.getItem('address') != null) {
      this.address = localStorage.getItem('address');
      this.autocompleteInput = this.address
      this.updatedAddress = true
    }
    this.userService.getExpertImage().subscribe(data => {
      this.image = data
    }, err => {
      this.image = err.error.text
    });
    this.userService.getExpertData().subscribe(data => {
      let temp = data.name.split("$");
      this.name = temp[0];
      this.email = data.email;
      this.phone = data.mobile;
      if (data.social_media) {
        const links = data.social_media.split(',');
        // Ensure the array has at least three elements to prevent undefined errors
        if (links.length >= 3) {
          this.facebookLink = links[0];  // Assign the first item to facebookLink
          this.instagramLink = links[1]; // Assign the second item to instagramLink
          this.tiktokLink = links[2];    // Assign the third item to tiktokLink
        }
      }
      if (!this.updatedAddress) {
        this.address = data.address
        this.autocompleteInput = this.address

        this.coordinates = data.coordinates
      }
      this.displayed_phone = data.displayed_phone
      this.initialized = true;
      this.mobileCheck();
      this.businessNameTest();
    }, err => {

    }
    );

    this.userService.getExpertCategories().subscribe(data => {

      this.expert_categories = data
    }, err => {
    })

    this.userService.getBeautyCategories().subscribe(data => {

      this.all_categories = data
    }, err => {
    })

  }


  goBack() {
    this.modalController.dismiss(this.needReferesh)
  }



  save() {
    this.needReferesh = true
    this.dataExpert.categories = this.expert_categories.join(',');
    this.dataExpert.businessName = this.name
    this.dataExpert.displayedPhone = this.displayed_phone
    this.dataExpert.new_image = this.new_image
    this.dataExpert.address = this.address;
    this.dataExpert.coordinates = this.coordinates
    this.dataExpert.image = this.image
    this.dataExpert.facebook = this.facebookLink
    this.dataExpert.instagram = this.instagramLink
    this.dataExpert.tiktok = this.tiktokLink

    //this.dataUser.image=this.image
    this.userService.saveExpertData(this.dataExpert).subscribe(data => {
      this.userService.presentToast("Το προφίλ σας άλλαξε με επιτυχία!", "success")
      this.goBack()
    }, err => {
      if (err.error == "Slug") {
        this.userService.presentToast("Το όνομα υπάρχει ήδη. Πρακαλώ επιλέξτε κάποιο άλλο.", "danger")

      } else {
        this.userService.presentToast("Κάτι πήγε στραβά! Βεβαιωθείτε ότι δεν χρησιμοποείτε ειδικούς χαρακτήρες.", "danger")

      }
    }
    );
  }

  async chooseAddress() {
    const modal = await this.modalController.create({
      component: ChooseAddressPage,
    });
    modal.onDidDismiss().then((data) => {
      if (data.data != undefined) {

        this.address = data.data.address
        this.coordinates = data.data.latitude + "," + data.data.longitude
        this.needReferesh = true
      }
      // Do something with the data returned from the modal
    });
    return await modal.present();
  }

  businessNameTest() {
    let result = /^[a-zA-Zα-ωΑ-ΩίϊΐόάέύϋΰήώΊΪΌΆΈΎΫΉΏ0-9\s-'’]+$/.test(this.name);
    if (result) {
      this.resultBusinessNameCheck = true;
      this.businessNameIconName = "checkmark-outline"
      this.businessNameColor = "success"
      this.businessNameVariableClass = "valid-item ion-margin-top pt7"
      this.businessNameItemClass = "ion-margin validBorderItem"

    } else {
      this.resultBusinessNameCheck = false;
      this.businessNameIconName = "close-outline"
      this.businessNameColor = "danger"
      this.businessNameVariableClass = "invalid-item ion-margin-top pt7"
      this.businessNameItemClass = "ion-margin invalidBorderItem"
    }
    if (this.name.length == 0) {
      this.resultBusinessNameCheck = false;
      this.resultBusinessNameCheck = false;
      this.businessNameIconName = "close-outline"
      this.businessNameColor = "danger"
      this.businessNameVariableClass = "invalid-item ion-margin-top pt7"
      this.businessNameItemClass = "ion-margin invalidBorderItem"

    }

  }

  // Accessing the NgModels
  @ViewChild('facebookForm', { static: false }) facebookForm!: NgModel;
  @ViewChild('instagramForm', { static: false }) instagramForm!: NgModel;
  @ViewChild('tiktokForm', { static: false }) tiktokForm!: NgModel;


  linkValid(link: string): boolean {
    // Checks if the provided link includes 'https://'
    return link.includes('https://');
  }


  saveButtonDisabled() {
    const basicChecks = this.resultBusinessNameCheck && this.resultPhoneCheck && this.expert_categories.length > 0;

    // Ensure the input is either empty or valid (if not empty, it must be valid)
    const facebookValid = this.facebookLink == "" || (this.facebookLink != "" && this.linkValid(this.facebookLink));
    const instagramValid = this.instagramLink == "" || (this.instagramLink != "" && this.linkValid(this.instagramLink));
    const tiktokValid = this.tiktokLink == "" || (this.tiktokLink != "" && this.linkValid(this.tiktokLink));





    let saveButtonEnabled = basicChecks && facebookValid && instagramValid && tiktokValid;
    return !saveButtonEnabled;  // Return true to disable the save button if conditions are not met
  }




  mobileCheck() {
    if (this.displayed_phone != null) {
      let result = /^\+30[0-9]{10}$/.test(this.displayed_phone);
      let result2 = /^[0-9]{10}$/.test(this.displayed_phone);



      if (result || result2) {
        this.resultPhoneCheck = true;
        this.phoneIconName = "checkmark-outline"
        this.phoneColor = "success"
        this.phoneVariableClass = "valid-item ion-margin-top pt7"
        this.phoneDisplayedItemClass = "ion-margin validBorderItem"
      } else if (this.displayed_phone.length == 0) {
        this.resultPhoneCheck = true;
        this.phoneIconName = ""; // no icon
        this.phoneColor = ""; // neutral color
        this.phoneVariableClass = ""; // no specific class
        this.phoneDisplayedItemClass = "ion-margin"; // neutral item style
      } else {
        this.resultPhoneCheck = false;
        this.phoneIconName = "close-outline"
        this.phoneColor = "danger"
        this.phoneVariableClass = "invalid-item ion-margin-top pt7"
        this.phoneDisplayedItemClass = "ion-margin invalidBorderItem"
      }

      if (this.resultBusinessNameCheck && this.resultPhoneCheck) {
        this.saveButtonEnabled = true;
      } else {
        this.saveButtonEnabled = false;
      }
    }
  }



  selectImage(image: any) {
    if (this.selectedImage) {
      this.selectedImage.selected = false;
    }
    image.selected = true
    this.selectedImage = image;

  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    // do something with the captured image
    this.openCropperDialog(image.webPath)
  }



  openCropperDialog(imageURL: string | undefined) {
    this.cropped = null!;
    this._dialog.open(CropperDialog, {
      data: {
        imageURL: imageURL, // imageURL from parameter
        width: 150, // width for the cropper
        height: 150, // height for the cropper
        round: true // shape of the cropper
      },
      width: '320px', // Width of the dialog box, not the cropper itself
      disableClose: true
    }).afterClosed.subscribe((result?: ImgCropperEvent) => {
      if (result) {
        this.cropped = result.dataURL;
        this.image = this.cropped;
        this._cd.markForCheck(); // Trigger change detection if using OnPush strategy
        this.new_image = "true"; // Setting a flag (should likely be a boolean rather than a string)
      }
    });
  }

  getFileUrl(input: HTMLInputElement): string {
    const file = input.files && input.files[0];
    if (file) {
      return URL.createObjectURL(file); // create a URL for the selected file
    }
    return '';
  }


  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Επιλέξτε πηγή εικόνας',
      buttons: [
        /*{
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
        },*/

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
            this.importFromCamera();
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

  importFromCamera() {
    this.takePicture()

  }

  importFromStorage() {
    this._fileInput.nativeElement.click();
  }










  goToCrop() {


    this.openCropperDialog(this.selectedImage.imageLink)

  }

  async selectImageFromFacebook() {
    const modal = await this.modalController.create({
      component: FacebookImagesPage,

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedImage = data.imageSelected; // Update the room's table types with the returned data
      this.openCropperDialog(this.selectedImage.imageLink)
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
      this.openCropperDialog(this.selectedImage.imageLink)
    }
  }

  autocompleteInput: string = '';
  loadingOn: boolean = false;
  queryWait: boolean = false;
  suggestions: any = []
  searchAddress() {

    if (this.autocompleteInput.length < 1) {
      this.suggestions = [];
      this.loadingOn = false;
      return;
    }

    if (!this.queryWait) {
      this.loadingOn = true;
      this.queryWait = true;

      setTimeout(() => {
        this.queryWait = false;
        this.userService.guessAddresses(this.autocompleteInput).subscribe(data => {
          this.suggestions = data;

          this.loadingOn = false;
        }, err => {
          console.error(err);
          this.loadingOn = false;
        });
      }, 0);
    }
  }

  saveAddress(suggestion: any) {
    this.address = suggestion.address
    this.coordinates = suggestion.latitude + "," + suggestion.longitude

    this.needReferesh = true
  }


}

