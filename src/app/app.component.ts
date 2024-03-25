import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { register } from 'swiper/element/bundle';
import { StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui';
import { ModalController } from '@ionic/angular';
import { EditProfilePage } from './pages/edit-profile/edit-profile.page';
import { ClientsPage } from './pages/clients/clients.page';
import { ReviewsPage } from './pages/reviews/reviews.page';
import { SettingsPage } from './pages/settings/settings.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { Subscription } from 'rxjs';
import { KrathseisPage } from './pages/krathseis/krathseis.page';
import { MessagesPage } from './pages/messages/messages.page';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ChangePasswordPage } from './pages/change-password/change-password.page';
import { TeamServicesPage } from './pages/team-services/team-services.page';
import { StatsPage } from './pages/stats/stats.page';
const STYLES = (theme: ThemeVariables) => ({
  $global: lyl `{
    body {
      background-color: ${theme.background.default}
      color: ${theme.text.default}
      font-family: ${theme.typography.fontFamily}
      margin: 0
      direction: ${theme.direction}
    }
  }`,
  root: lyl `{
    display: block
  }`
});

register();
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  providers: [
    StyleRenderer
  ], animations: [
    trigger('fade', [
      state('in', style({ opacity: 1 })),
      state('out', style({ opacity: 0 })),
      transition('in <=> out', animate('300ms ease-in-out'))
    ])
  ]
})
export class AppComponent implements WithStyles  {
  authenticated: boolean=false;
  private authSubscription: Subscription = new Subscription;
  isAuthenticated: boolean=false;
  iconName: string = 'clipboard-outline';

  image: any="Error";
  name: any;
  surname: any;
  email: any;
  initialized: boolean=false;
  readonly classes = this.sRenderer.renderSheet(STYLES, true);
  urlToCopy: string="";
  constructor(
              private userService:UserService,
              private rout : Router,    readonly sRenderer: StyleRenderer,private modalController:ModalController) {
                this.isAuthenticated = localStorage.getItem('authenticated') === 'true';

              }
  $priority?: number | undefined;

  
 
  
  logout(){
    this.userService.logout().subscribe(data => console.log(data),err=>{});

  }
 
   


  login(){
    this.rout.navigate(['login']);   
  }

  showClipboard: boolean = true;
fadeState: string = 'in';

toggleIcon() {
  this.copyToClipboard(this.urlToCopy);
  this.fadeState = 'out';
  setTimeout(() => {
    this.showClipboard = !this.showClipboard;
    this.fadeState = 'in';
  }, 300);  // 300ms matches the animation duration

  setTimeout(() => {
    this.showClipboard = !this.showClipboard;
  }, 3000)

    this.userService.presentToast("Ο σύνδεσμος κρατήσεων αντιγράφηκε στο πρόχειρο!","success")
  
}

copyToClipboard(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    console.log('URL copied to clipboard');
    // Here, you can also update the tooltip text and change the icon to indicate that the URL has been copied.
  }).catch(err => {
    console.error('Could not copy text: ', err);
  });
}


async goToProfile() {
  const modal = await this.modalController.create({
      component: EditProfilePage,
  });
  
  modal.onDidDismiss().then((result) => {
      if (result.data === true) {
          window.location.reload(); // To reload the entire window
          // Or you can implement any other logic to refresh the component/view as needed.
      }
  });
  
  return await modal.present();
}


  async goToClients(){

   const modal = await this.modalController.create({
        component: ClientsPage,
    });
    return await modal.present();
}

async goToKrathseis() {
  this.userService.callGoToKrathseis();
}

async goToMessages(){

  const modal = await this.modalController.create({
       component: MessagesPage,
   });
   return await modal.present();
}

async goToTeamServices(){

  const modal = await this.modalController.create({
       component: TeamServicesPage,
       backdropDismiss:false
   });
   modal.onDidDismiss().then((result) => {
    if (result.data === true) {
        window.location.reload(); // To reload the entire window
        // Or you can implement any other logic to refresh the component/view as needed.
    }
});
return await modal.present();

}

async goToSettings(){

  const modal = await this.modalController.create({
       component: SettingsPage,
       backdropDismiss:false
      });
      modal.onDidDismiss().then((result) => {
       if (result.data === true) {
           window.location.reload(); // To reload the entire window
           // Or you can implement any other logic to refresh the component/view as needed.
       }
   });
   return await modal.present();
  }   




 
  async goToReviews() {
    const modal = await this.modalController.create({
        component: ReviewsPage,
    });
    return await modal.present();
}








async goToPortfolio() {
  const modal = await this.modalController.create({
      component: PortfolioPage,
  });
  return await modal.present();
}

isMobile(){
  return this.userService.isMobile()
}

  
  onMenuOpen(){

    this.image="error"
    this.name="error"
    this.email="error"

    this.userService.getExpertData().subscribe(data => {
      this.name=data[0][1];
      
      this.email=data[0][0];
      this.image=data[1];
      this.initialized=true;

    },err=>{
      this.initialized=true;


    })
    
  
  }

   
  async goToStats() {
    const modal = await this.modalController.create({
        component: StatsPage,
    });
    return await modal.present();
}

  ngOnInit() {
    this.authSubscription = this.userService.isAuthenticated$.subscribe(isAuth => {
    this.isAuthenticated = isAuth;
    console.log("asdasdasdasdasd")
    if(localStorage.getItem('authenticated')=='true'){
      this.onMenuOpen();
      this.userService.getExpertId().subscribe(data=>{
        this.urlToCopy="https://www.fyx.gr/book/"+data.id
      },err=>{

      })
    }
    });
  }
}


  

