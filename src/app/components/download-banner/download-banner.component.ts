import { Component, Input, OnInit } from '@angular/core';
import { Platform, ModalController } from '@ionic/angular';
import { PwaInstallationPage } from 'src/app/pages/pwa-installation/pwa-installation.page';

@Component({
  selector: 'app-download-banner',
  templateUrl: './download-banner.component.html',
  styleUrls: ['./download-banner.component.scss']
})
export class DownloadBannerComponent implements OnInit {
  @Input() tabsPresent: boolean = false; // Input to receive the tabs presence status
  showBanner: boolean = true;
  private readonly WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
  private readonly MAX_SHOW_COUNT = 3; // Maximum number of times to show the banner

  constructor(
    private platform: Platform,
    private modalController: ModalController // Inject ModalController
  ) {}

  ngOnInit() {
    console.log("DownloadBannerComponent initialized");
    this.checkIfBannerShouldBeShown();
  }

  checkIfBannerShouldBeShown() {
    const isIos = this.platform.is('ios');
    const isAndroid = this.platform.is('android');
    const isStandalonePWA = window.matchMedia('(display-mode: standalone)').matches;
    const lastDismissedTimestamp = localStorage.getItem('bannerDismissedTimestamp');
    const showCounter = parseInt(localStorage.getItem('bannerShowCounter') || '0', 10);

    console.log("Platform is iOS:", isIos);
    console.log("Platform is Android:", isAndroid);
    console.log("Running as standalone PWA:", isStandalonePWA);
    console.log("Banner last dismissed timestamp:", lastDismissedTimestamp);
    console.log("Banner show counter:", showCounter);

    // Check if a week has passed since the banner was last dismissed
    const oneWeekPassed = lastDismissedTimestamp
      ? Date.now() - parseInt(lastDismissedTimestamp, 10) > this.WEEK_IN_MS
      : true;

    // Show the banner only if the counter is less than the maximum, on a mobile browser, not dismissed within a week, and not in standalone mode
    if (!isStandalonePWA && oneWeekPassed && (isIos || isAndroid) && showCounter < this.MAX_SHOW_COUNT) {
      console.log("Conditions met to show banner.");
      this.showBanner = true;
    } else {
      console.log("Conditions not met, banner will not be shown.");
      this.showBanner = false;
    }
  }

  async downloadApp() {
    const isIos = this.platform.is('ios');
    if (isIos) {
      console.log("Opening PWA installation modal.");
      await this.presentPwaInstallationModal();
    } else {
      const appStoreLink = 'https://play.google.com/store/apps/details?id=com.fyx.beauty'; // Replace with your Android Play Store link
      console.log("Opening app store link:", appStoreLink);
      window.open(appStoreLink, '_blank');
    }
  }

  async presentPwaInstallationModal() {
    try {
      const modal = await this.modalController.create({
        component: PwaInstallationPage,
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();

      if (data?.dismissed) {
        console.log("PWA installation modal dismissed.");
        // You can perform additional actions here if needed
      }
    } catch (error) {
      console.error("Error presenting PWA installation modal:", error);
    }
  }

  dismissBanner() {
    console.log("Banner dismissed by user");

    // Increment the show counter and update the dismissal timestamp
    let showCounter = parseInt(localStorage.getItem('bannerShowCounter') || '0', 10);
    showCounter++;
    localStorage.setItem('bannerShowCounter', showCounter.toString());
    localStorage.setItem('bannerDismissedTimestamp', Date.now().toString());

    this.showBanner = false;
  }
}
