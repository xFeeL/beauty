import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { register } from 'swiper/element/bundle';
import { StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui';
import { ModalController, Platform } from '@ionic/angular';
import { EditProfilePage } from './pages/edit-profile/edit-profile.page';
import { ClientsPage } from './pages/clients/clients.page';
import { ReviewsPage } from './pages/reviews/reviews.page';
import { SettingsPage } from './pages/settings/settings.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { Subscription } from 'rxjs';
import { MessagesPage } from './pages/messages/messages.page';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TeamServicesPage } from './pages/team-services/team-services.page';
import { StatsPage } from './pages/stats/stats.page';
import { ThemeService } from '../app/services/theme.service';
import { ImagesPage } from './pages/images/images.page';
import { ContactPage } from './pages/contact/contact.page';
import { Location } from '@angular/common';

const STYLES = (theme: ThemeVariables) => ({
  $global: lyl`{
    body {
      background-color: ${theme.background.default}
      color: ${theme.text.default}
      font-family: ${theme.typography.fontFamily}
      margin: 0
      direction: ${theme.direction}
    }
  }`,
  root: lyl`{
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
export class AppComponent implements WithStyles {
  authenticated: boolean = false;
  private authSubscription: Subscription = new Subscription;
  private newMessageSubscription: Subscription = new Subscription;
  hasNewMessages: boolean = false;

  isAuthenticated: boolean = false;
  iconName: string = 'clipboard-outline';
  themeToggle = false;

  image: any = "Error";
  name: any;
  surname: any;
  email: any;
  initialized: boolean = false;
  readonly classes = this.sRenderer.renderSheet(STYLES, true);
  urlToCopy: string = "";
  isMobile: boolean=false;
  constructor(private location: Location,private platform:Platform,
    private themeService: ThemeService,
    private userService: UserService,
    private rout: Router, 
    readonly sRenderer: StyleRenderer, 
    private modalController: ModalController
  ) {
    this.isAuthenticated = localStorage.getItem('authenticated') === 'true';
    this.isMobile = this.userService.isMobile();
  }
  $priority?: number | undefined;




  logout() {
    this.userService.logout().subscribe(data => console.log(data), err => { });

  }




  login() {
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

    this.userService.presentToast("Ο σύνδεσμος κρατήσεων αντιγράφηκε στο πρόχειρο!", "success")

  }

  copyToClipboard(url: string) {
    navigator.clipboard.writeText(url).then(() => {
      
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


  async goToClients() {

    const modal = await this.modalController.create({
      component: ClientsPage,
    });
    return await modal.present();
  }

  async goToKrathseis() {
    this.userService.callGoToKrathseis();
  }

  async goToMessages() {

    const modal = await this.modalController.create({
      component: MessagesPage,
    });
    return await modal.present();
  }

  async goToTeamServices() {

    const modal = await this.modalController.create({
      component: TeamServicesPage,
      backdropDismiss: false
    });
    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        window.location.reload(); // To reload the entire window
        // Or you can implement any other logic to refresh the component/view as needed.
      }
    });
    return await modal.present();

  }

  async goToSettings() {

    const modal = await this.modalController.create({
      component: SettingsPage,
      backdropDismiss: false
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








  async goToImages() {
    const modal = await this.modalController.create({
      component: ImagesPage,
    });
    return await modal.present();
  }



  onMenuOpen() {

    this.image = "error"
    this.name = "error"
    this.email = "error"

    this.userService.getExpertData().subscribe(data => {
      this.name = data.name;

      this.email = data.email;
      this.image = data.image;
      this.initialized = true;

    }, err => {
      this.initialized = true;


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
      if (localStorage.getItem('authenticated') == 'true') {
        this.onMenuOpen();
        this.userService.getAccountId().subscribe(data => {
          this.urlToCopy = "https://www.fyx.gr/book/" + data.id;
        }, err => {});
      }
    });
  
    this.themeService.themeDark$.subscribe(isDark => {
      this.themeToggle = isDark;
    });
  
    this.themeService.initializeTheme();
  
    this.newMessageSubscription = this.userService.newMessage$.subscribe((newMessage) => {
      this.hasNewMessages = newMessage;
    });

    this.platform.ready().then(() => {
      this.platform.backButton.subscribeWithPriority(10, async () => {
        // Check if any modal is open
        const modal = await this.modalController.getTop();
        if (modal) {
          // Dismiss the modal
          await modal.dismiss();
        } else {
          // Navigate back
          this.location.back();
  
        }
      });
    });
  }
  


  // Listen for the toggle check/uncheck to toggle the dark theme
  toggleChange(event: CustomEvent): void {
    this.themeService.toggleDarkTheme(event.detail.checked);
  }

  
async goToContact() {
  const modal = await this.modalController.create({
    component: ContactPage,
  });
  return await modal.present();
}


}




