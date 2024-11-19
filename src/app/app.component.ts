import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { UserService } from './services/user.service';
import { register } from 'swiper/element/bundle';
import { StyleRenderer, ThemeVariables, WithStyles, lyl } from '@alyle/ui';
import { ModalController, Platform } from '@ionic/angular';
import { EditProfilePage } from './pages/edit-profile/edit-profile.page';
import { ClientsPage } from './pages/clients/clients.page';
import { ReviewsPage } from './pages/reviews/reviews.page';
import { SettingsPage } from './pages/settings/settings.page';
import { PortfolioPage } from './pages/portfolio/portfolio.page';
import { filter, interval, Subscription } from 'rxjs';
import { MessagesPage } from './pages/messages/messages.page';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TeamServicesPage } from './pages/team-services/team-services.page';
import { StatsPage } from './pages/stats/stats.page';
import { ThemeService } from '../app/services/theme.service';
import { ImagesPage } from './pages/images/images.page';
import { ContactPage } from './pages/contact/contact.page';
import { Location } from '@angular/common';
import { UpdateService } from './services/update.service';
import { Capacitor } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { TeamServicesPromptPage } from './pages/team-services-prompt/team-services-prompt.page';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NgZone } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { SwUpdate, VersionEvent, VersionReadyEvent } from '@angular/service-worker';
import { OneSignal } from 'onesignal-ngx';

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
  private updateSubscription!: Subscription;
  image: any = "Error";
  name: any;
  surname: any;
  email: any;
  initialized: boolean = false;
  readonly classes = this.sRenderer.renderSheet(STYLES, true);
  urlToCopy: string = "";
  isMobile: boolean = false;
  setupNotFinished: boolean = false;
  constructor(private oneSignal: OneSignal, private swUpdate: SwUpdate, private updateService: UpdateService, private location: Location, private platform: Platform,
    private themeService: ThemeService,
    private userService: UserService,
    private rout: Router,
    readonly sRenderer: StyleRenderer,
    private modalController: ModalController,
    private zone: NgZone
  ) {

    this.initializeApp();
  }
  $priority?: number | undefined;
  tabsPresent: boolean = false; // Track if "tabs" is in the URL
  showBanner: boolean = true;


  logout() {
    this.userService.logout().subscribe(data => console.log(data), err => { });

  }




  login() {
    this.rout.navigate(['login']);
  }

  showClipboard: boolean = true;
  fadeState: string = 'in';

  toggleIcon() {
    if (this.setupNotFinished == true) {
      this.promptTeamServices();
    } else {
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

  }

  initializeOneSignalForPWA() {
    const isIos = this.platform.is('ios');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    // Only initialize OneSignal if running as PWA on iOS
    if (isPWA) {
      this.oneSignal.init({
        appId: 'dd10fc16-8bdc-4b16-8a66-5fe450385acc',
        allowLocalhostAsSecureOrigin: true,
        serviceWorkerParam: {
          scope: '/OneSignal/'
        },
        serviceWorkerPath: '/OneSignal/OneSignalSDKWorker.js',
        serviceWorkerUpdaterPath: '/OneSignal/OneSignalSDKUpdaterWorker.js',
        promptOptions: {
          slidedown: {
            enabled: false,
            autoPrompt: false, // Ensures prompt does not auto-display

          },
        }
      }).then(() => {
        const hasAcceptedNotifications = localStorage.getItem('pushNotificationsAccepted');
        if (hasAcceptedNotifications == "true") {
          this.userService.getExpertId().subscribe(data => {
            this.oneSignal.login(data.id);
          }, err => {
            this.userService.presentToast("Κάτι πήγε στραβά.", "danger");
          });
        }

        this.oneSignal.Notifications.addEventListener("click", async (jsonData: any) => {
          console.log("Notification opened:", jsonData);
          const notification = jsonData.notification;
          const data = notification.additionalData;

          if (data) {
            const notificationType = data.type;

            switch (notificationType) {
              case 'appointment':
                const appointmentId = data.id;
                if (appointmentId) {
                  // Navigate to KrathshPage
                  this.userService.goToKrathsh(appointmentId)
                } else {
                  console.warn("No appointment_id found in notification data.");
                }
                break;

              case 'message':
                const conversationId = data.conversation_id;
                if (conversationId) {
                  // Navigate to MessagesPage

                } else {
                  console.warn("No conversation_id found in notification data.");
                }
                break;

              // Add more cases as needed

              default:
                console.warn("Unknown notification type:", notificationType);
                // Optionally navigate to a default page
                break;
            }
          } else {
            console.warn("No additional data found in notification.");
          }
        });


        this.oneSignal.Notifications.addEventListener("foregroundWillDisplay", async (e: any) => {
          console.log("THE EVENT2")
          console.log(e)
          let clickData = await e.notification;
          console.log("Notification Clicked : " + clickData);

          const notification = e.notification;
          const payload = notification.additionalData;
          console.log(payload)
          // Check for specific message conditions
          if (payload.type === "message") {
            // Handle the message
            console.log("Received message: " + payload.body);
            this.userService.messageReceived.next(true);
            this.userService.newMessage$.next(true);
            // Perform actions based on the message content
          } else if (payload.title === "Another Message Title") {
            // Handle the message
            console.log("Received another message: " + payload.body);
            // Perform actions based on the message content
          } else {
            // Handle other messages
            console.log("Received a message: " + payload.body);
            // Perform default actions or ignore
          }
        });
      }).catch((error) => {
        console.error('OneSignal initialization failed:', error);
      });

    } else {
    }
  }

  copyToClipboard(url: string) {

    navigator.clipboard.writeText(url).then(() => {

      // Here, you can also update the tooltip text and change the icon to indicate that the URL has been copied.
    }).catch(err => {
      console.error('Could not copy text: ', err);
    });


  }

  async promptTeamServices() {
    const modal = await this.modalController.create({
      component: TeamServicesPromptPage,

    });
    modal.onWillDismiss().then((dataReturned) => {


    });
    return await modal.present();
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
    console.log("YES")
    this.image = "error"
    this.name = "error"
    this.email = "error"

    this.userService.getExpertData().subscribe(data => {
      this.name = data.name;
      console.log("YES2")

      this.email = data.email;
      this.image = data.image;
      this.initialized = true;

    }, err => {
      this.initialized = true;


    })

    this.userService.checkExpertSetup().subscribe(data => {
      this.setupNotFinished = false

    }, err => {
      this.setupNotFinished = true
    })


  }


  async goToStats() {
    const modal = await this.modalController.create({
      component: StatsPage,
    });
    return await modal.present();
  }




  ngOnInit() {
    this.rout.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.tabsPresent = event.url.includes('tabs');
      });
    //this.initializeOneSignalForPWA()
    if (this.swUpdate.isEnabled) {
      // Subscribe to version updates
      console.log("SW is Enabled")
      this.swUpdate.versionUpdates.subscribe((event: VersionEvent) => {
        console.log("EVENT UPDATE:")
        console.log(event)
        if (event.type === 'VERSION_READY') {
          const versionReadyEvent = event as VersionReadyEvent;
          console.log(`New app version ready: ${versionReadyEvent.latestVersion.hash}`);

          // Activate the update and reload the page
          this.swUpdate.activateUpdate().then(() => {
            console.log('Update activated. Reloading page...');
            document.location.reload();
          });
        }
      });

      // Subscribe to unrecoverable errors
      this.swUpdate.unrecoverable.subscribe(event => {
        console.error('An unrecoverable error occurred:', event.reason);
        document.location.reload();
      });

      // Immediately check for updates
      this.checkForUpdatesSW();

      // Set up periodic update checks every 10 minutes
      this.updateSubscription = interval(600000).subscribe(() => {
        this.checkForUpdatesSW();
      });
    }

    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      this.zone.run(() => {

        const slug = event.url.split(".gr").pop();
        if (slug) {
          this.rout.navigateByUrl(slug);
        }
        // If no match, do nothing - let regular routing
        // logic take over
      });
    });
    StatusBar.show();
    this.isAuthenticated = localStorage.getItem('authenticated') === 'true';
    this.isMobile = this.userService.isMobile();
    console.log("APP INIT")
    this.initializeApp();
    if (Capacitor.isNativePlatform()) {
      this.userService.setupPushNotifications();
      console.log("Setting up push notifications on mobile native app.");
    } else {
      console.log("Not capcitor native platform")
    }
    console.log("APP INI4")

    this.authSubscription = this.userService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      console.log("APP INIT2")

      if (localStorage.getItem('authenticated') == 'true') {
        console.log("APP INIT3")

        this.onMenuOpen();
        this.userService.getAccountId().subscribe(data => {
          this.urlToCopy = "https://www.fyx.gr/book/" + data.id;
        }, err => { });
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

    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe((event) => {
        // Automatically reload the app when an update is available
        console.log('Update available, activating update...');
        this.swUpdate.activateUpdate().then(() => {
          console.log('Update activated. Reloading...');
          window.location.reload(); // Automatically reload the app to apply the update
        });
      });
    }
  }

  checkForUpdatesSW() {
    // Check for updates when this method is called
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate()
        .then(() => {
          console.log('Checked for update');
        })
        .catch((err) => {
          console.error('Error checking for update', err);
        });
    }
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


  async initializeApp() {

    await this.platform.ready();
    console.log('Platform ready.');

    // Initialize the update service to fetch the current app version
    await this.updateService.initialize();
    console.log('UpdateService initialized.');

    // Check for updates only if the app is running as a native app
    if (this.isNativePlatform()) {
      console.log('Running on a native platform. Checking for updates...');
      this.checkForUpdates();

      // Ensure resume event is subscribed only once
      if (!this.isSubscribedToResume) {
        this.platform.resume.subscribe(() => {
          console.log('App resumed. Checking for updates...');
          this.checkForUpdates();
          this.checkForUpdatesSW();

        });
        this.isSubscribedToResume = true;
      }

      // Capacitor App State Change Listener
      if (!this.isSubscribedToAppStateChange) {
        App.addListener('appStateChange', (state) => {
          if (state.isActive) {
            console.log('App state changed to active. Checking for updates...');
            this.checkForUpdates();
          }
        });
        this.isSubscribedToAppStateChange = true;
      }
      CapacitorUpdater.notifyAppReady();
    }

    this.platform.ready().then(() => {
      App.addListener('appUrlOpen', (data: any) => {
        this.handleDeepLink(data.url);
      });
    });

  }




  handleDeepLink(url: string) {
    const parsedUrl = new URL(url);
    const path = parsedUrl.pathname;
    const searchParams = parsedUrl.searchParams;

    if (path === '/successful-payment') {
      const sessionId = searchParams.get('session_id');
      this.rout.navigate(['/successful-payment'], { queryParams: { session_id: sessionId } });
    } else if (path === '/failed-payment') {
      this.rout.navigate(['/failed-payment']);
    } else {
      // Handle other paths or navigate to home
      this.rout.navigate(['/']);
    }
  }

  checkForUpdates() {
    // Prevent multiple update checks
    if (this.isCheckingForUpdates) {
      console.log('Update check already in progress. Skipping...');
      return;
    }

    this.isCheckingForUpdates = true;
    console.log("Checking for updates...");
    this.updateService.checkForUpdates().then(() => {
      console.log('Update process completed');
      this.isCheckingForUpdates = false;
    }).catch(err => {
      console.error('Error during update check:', err);
      this.isCheckingForUpdates = false;
    });
  }

  // Helper method to determine if the app is running as a native app
  isNativePlatform(): boolean {
    const isNative = Capacitor.isNativePlatform();
    console.log(`Is native platform: ${isNative}`);
    return isNative;
  }

  // Additional properties to track subscriptions and state
  private isSubscribedToResume = false;
  private isSubscribedToAppStateChange = false;
  private isCheckingForUpdates = false;

}





