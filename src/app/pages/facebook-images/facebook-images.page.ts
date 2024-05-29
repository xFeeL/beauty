import { Component, OnInit } from '@angular/core';
import { FacebookLogin, FacebookLoginPlugin } from '@capacitor-community/facebook-login';
import { ModalController, NavParams } from '@ionic/angular';
import { ExternalService } from 'src/app/services/external.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-facebook-images',
  templateUrl: './facebook-images.page.html',
  styleUrls: ['./facebook-images.page.scss'],
})
export class FacebookImagesPage implements OnInit {
  selectedImage = { imageLink: '', selected: false };
  facebookAccessToken: any;
  currentAlbumPhotos: any;
  currentAlbum: any; // The currently selected album
  photos: { imageLink: string, selected:boolean}[] = [];
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  fbLogin!: FacebookLoginPlugin;
  albumChosen: boolean=false;
  pageName: any="";
  choosePage: boolean=true;
  pageChosen: boolean=false;facebookUserAccountId: any;
  pagesToChoose: any;

  constructor(private modalController:ModalController,private userService:UserService,private externalService:ExternalService) {
   }

  ngOnInit() {
   

  }
  ionViewWillEnter(){
    FacebookLogin.initialize({ appId: '718122076068329' }).then(() => {
      this.setupFbLogin();
      this.facebookOAuth();
  });
  }

  backToPages(){
    this.pageChosen=false;
    this.choosePage=true;
    this.albumChosen=false;
  }
  

  async setupFbLogin() {
    this.fbLogin = FacebookLogin;
  
}

goToPage(page:any){
  this.albums=[]
  this.choosePage=false;
  this.pageChosen=true
  this.pageName=page.name
  let tempToken;
  if(this.facebookUserAccountId==page.id){
    

    this.getAlbums(this.facebookAccessToken,page.id)

  }else if (page.token==undefined){
    
    
   this.externalService.getPageAccessToken(this.facebookAccessToken,page.id).subscribe(data2=>{
      page.token=data2.access_token
      this.getAlbums(page.token,page.id)
    })

  }else{
    
    this.getAlbums(page.token,page.id)

  }
 
}

getAlbums(token:string,pageId:string){
  this.externalService.getAlbums(token,pageId).subscribe(data=>{
    for (let i=0;i<data.data.length;i++){
      const album = { folder_name: data.data[i].name, imageLink: data.data[i].picture.data.url,id:data.data[i].id };
      this.albums.push(album);
    }
  })
}

async facebookOAuth(): Promise<void> {
  this.pagesToChoose=[]
this.choosePage=true
  const FACEBOOK_PERMISSIONS = ['user_photos','pages_show_list','pages_read_engagement']
  const result = await this.fbLogin.login({ permissions: FACEBOOK_PERMISSIONS });
  if (result && result.accessToken) {
    
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
      
      
      for(let i=0;i<pages.data.length;i++){
        let temp = {
          name: pages.data[i].name,
          url: pages.data[i].picture.data.url,
          id:pages.data[i].id

        };
          this.pagesToChoose.push(temp)
      }
      
      this.pageChosen=false;
      this.choosePage=true;
      this.albumChosen=false;
      this.selectedImage = { imageLink: '', selected: false };

    },err=>{

    })
   
    
  }
}


  selectImage(image:any){
    if (this.selectedImage) {
      this.selectedImage.selected = false;
    }
    image.selected=true
        this.selectedImage=image;
    
  }


  backToAlbums() {
    this.albumChosen=false;
    this.choosePage=false;
    this.pageChosen=true;
    
  
    
  }
  openAlbum(album: any) {
    this.albumChosen=true;
    this.pageChosen=false;
    this.selectedImage = { imageLink: '', selected: false };
  
  
    this.currentAlbum = album;
    this.currentAlbumPhotos=[]
    this.externalService.getFacebookPhotosFromAlbumId(this.facebookAccessToken, album.id).subscribe(data => {
      
      
      for (let i=0;i<data.photos.data.length;i++){
        const photo = { imageLink: data.photos.data[i].images[0].source, selected:false};
  
          this.currentAlbumPhotos.push(photo) 
        
  
        
      }
      
  
      
    });
  }
  

  async confirmFacebookModal(){
    await this.modalController.dismiss({
      'imageSelected': this.selectedImage,
    })
  }

  cancelFacebookModal(){
    this.modalController.dismiss()
    
  }


}
