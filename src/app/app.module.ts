import { LOCALE_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { Push } from '@awesome-cordova-plugins/push/ngx';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LightgalleryModule } from 'lightgallery/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HAMMER_GESTURE_CONFIG,
  HammerModule
} from '@angular/platform-browser';
import {
  LyTheme2,
  StyleRenderer,
  LY_THEME,
  LY_THEME_NAME,
  LyHammerGestureConfig
} from '@alyle/ui';
import { NgChartsModule } from 'ng2-charts';
import { LyButtonModule } from '@alyle/ui/button';
import { LyToolbarModule } from '@alyle/ui/toolbar';
import { LyImageCropperModule } from '@alyle/ui/image-cropper';
import { LySliderModule } from '@alyle/ui/slider';
import { LyIconModule } from '@alyle/ui/icon';
import { LyDialogModule } from '@alyle/ui/dialog';

import { CropperDialog } from '../app/pages/edit-profile/cropper-dialog';
/** Import themes */
import { MinimaLight, MinimaDark } from '@alyle/ui/themes/minima';
import { GalleryModule } from  'ng-gallery';
import { LightboxModule } from  'ng-gallery/lightbox';
// Import from library
import {
  NgxAwesomePopupModule,
  DialogConfigModule,
  ConfirmBoxConfigModule,
  ToastNotificationConfigModule
} from '@costlydeveloper/ngx-awesome-popup';
import {MatMenuModule} from '@angular/material/menu'; 
import {MatIconModule} from '@angular/material/icon'; 
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatListModule} from '@angular/material/list';
import {MatCardModule} from '@angular/material/card'; 
import { MatRadioModule } from '@angular/material/radio';
import { CustomHttpInterceptorService } from '../app/services/custom-http-interceptor.service';
import { FullCalendarModule } from '@fullcalendar/angular';
import { registerLocaleData } from '@angular/common';
import localeEl from '@angular/common/locales/el';
import {MatAutocompleteModule} from '@angular/material/autocomplete'; 
import { NgxStripeModule } from 'ngx-stripe';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { provideNgxMask } from 'ngx-mask';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { DownloadBannerComponent } from './components/download-banner/download-banner.component';
registerLocaleData(localeEl, 'el');
@NgModule({
  declarations: [AppComponent,CropperDialog,DownloadBannerComponent ],
  imports: [FormsModule,BrowserModule,LightgalleryModule, IonicModule.forRoot(), AppRoutingModule,HttpClientModule,BrowserAnimationsModule, BrowserAnimationsModule,
    LyButtonModule,
    LyToolbarModule,
    FullCalendarModule,
    MatBottomSheetModule,
    LyImageCropperModule,
    LyDialogModule,
    LyIconModule,
    LySliderModule,
    GalleryModule,
    NgChartsModule,
    LightboxModule,
    MatMenuModule,
    MatDialogModule,
    MatRadioModule,
    MatCardModule,
    HammerModule,
    MatIconModule,
    MatCheckboxModule,
    MatListModule,
    FormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    ReactiveFormsModule,
    NgxStripeModule.forRoot('pk_test_51QAWK4EQw15tXsM9QQsDAmfeW5iDTLvtVKLISVxs7ZCXQBkV3TCLA8eRtQuJEYMBnkzCNNGDjmqiG5ySsGD45QzC00pgbxIOq4'),
    MatFormFieldModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatInputModule,
    NgxAwesomePopupModule.forRoot(), // Essential, mandatory main module.
    DialogConfigModule.forRoot(), // Needed for instantiating dynamic components.
    ConfirmBoxConfigModule.forRoot(), // Needed for instantiating confirm boxes.
    ToastNotificationConfigModule.forRoot(),
  ],
    
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },Push,
    [ LyTheme2 ],
    [ StyleRenderer ],
    provideNgxMask(), // Provide NgxMask globally if needed
    // Theme that will be applied to this module
    { provide: LY_THEME_NAME, useValue: 'minima-light' },
    { provide: LY_THEME, useClass: MinimaLight, multi: true }, // name: `minima-light`
    { provide: LY_THEME, useClass: MinimaDark, multi: true }, // name: `minima-dark`
    // Gestures
    { provide: HAMMER_GESTURE_CONFIG, useClass: LyHammerGestureConfig }, // Required for <ly-carousel>,
   { provide: LOCALE_ID, useValue: 'el' },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptorService,
      multi: true // Important: This allows multiple interceptors and doesn't overwrite existing ones
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
