import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Router } from '@angular/router';
import { ChooseAddressPage } from '../choose-address/choose-address.page';
import Swiper from 'swiper';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { IonicSlides } from '@ionic/angular';
import * as moment from 'moment';
import { LyDialog } from '@alyle/ui/dialog';
import { ImgCropperEvent } from '@alyle/ui/image-cropper';
import { CropperDialog } from './cropper-dialog';
import { Camera, CameraResultType } from '@capacitor/camera';
import { FacebookImagesPage } from '../facebook-images/facebook-images.page';
import { InstagramImagesPage } from '../instagram-images/instagram-images.page';
import { AddPersonPage } from '../add-person/add-person.page';
import { NewServicePage } from '../new-service/new-service.page';
import { BASE64_STRING } from 'src/assets/icon/default-image';
@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.page.html',
  styleUrls: ['./onboarding.page.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1
      })),
      state('closed', style({
        height: '0',
        opacity: 0
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class OnboardingPage {
  days = [
    { name: 'Δευτέρα', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τρίτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τετάρτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Πέμπτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Παρασκευή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Σάββατο', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Κυριακή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] }
  ];
  people: any[] = [];
  services: any[] = [];
  serviceCategories: any[] = [];
  selectedImage = { imageLink: '', selected: false };
  currentAlbumPhotos: any;
  photos: { imageLink: string, selected: boolean }[] = [];



  togglesCounter: number = 0;
  @ViewChild('_fileInput') _fileInput: any;
  albums: { folder_name: string, imageLink: string, id: string }[] = [];
  hours: string[] = [];
  swiperModules = [IonicSlides];
  @ViewChild(IonModal)
  modal!: IonModal;
  expertName: any;
  items: any;
  cropped?: string;
  expertImage: string | undefined = BASE64_STRING;
  new_image: string = "false";
  pagesToChoose: any;
  addressEntered: boolean = false;
  constructor(private alertController:AlertController,private userService: UserService, private router: Router, private modalController: ModalController, private _dialog: LyDialog,
    private _cd: ChangeDetectorRef, private actionSheetController: ActionSheetController) {
    // Initialize start and end times for each day


    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));

  }
  message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
  name: string | undefined;
  address = ""
  omorfia_categories = [
    { title: 'Κομμωτήριο', selected: false },
    { title: 'Ινστιτούτο Ομορφιάς', selected: false },
    { title: 'Studio Νυχιών', selected: false },

    { title: 'Barber Shop', selected: false },
    //{title: 'Spa'},
  ];


  @ViewChild('swiperElRef') swiperContainer!: ElementRef;
  private swiper!: Swiper;

  ionViewWillEnter() {

    this.swiper = new Swiper(this.swiperContainer.nativeElement, {

      scrollbar: {
        el: '.swiper-scrollbar',
      },

    });

  }
  isOpenDayExists(): boolean {
    return this.days.some(day => day.open);
  }


  async deletePerson(person: any) {
    console.log('Considering deletion of person', person);

    // Identify the services that will be affected
    const affectedServices = this.services.filter(service => 
      service.people.includes(person.name) && service.people.length === 1
    );

    if (affectedServices.length > 0) {
      // Generate a list of affected service names for the alert message
      const affectedServiceNames = affectedServices.map(s => s.name).join(', ');

      const alert = await this.alertController.create({
        header: 'Προειδοποίηση',
        message: `Διαγράφοντας αυτό το άτομο θα διαγραφούν και οι ακόλουθες υπηρεσίες: ${affectedServiceNames}. Θέλετε να συνεχίσετε;`,
        buttons: [
          {
            text: 'Ακύρωση',
            role: 'cancel'
          },
          {
            text: 'Συνέχεια',
            handler: () => {
              // Remove the person and affected services
              this.performDeletion(person, affectedServices);
            }
          }
        ]
      });

      await alert.present();
    } else {
      // If no services are affected, proceed directly with the deletion of the person
      this.performDeletion(person);
    }
}

performDeletion(person: any, affectedServices: any[] = []) {
  // Remove the person from the people array
  this.people = this.people.filter(r => r !== person);

  // Remove affected services
  this.services = this.services.filter(s => !affectedServices.includes(s));

  // For unaffected services, just remove the person from their people array
  this.services.forEach(service => {
    service.people = service.people.filter((servicePerson: any) => servicePerson !== person.name);
  });

  console.log('Το άτομο διαγράφηκε. Επηρεασμένες υπηρεσίες:', affectedServices);
}


  deleteService(service: any) {
    console.log('Deleting person', service);
    this.services = this.services.filter(r => r !== service);
  }


  async deleteCategory(category: any) {
    // Check if there are any services associated with this category
    const servicesWithCategory = this.services.filter(r => r.selectedCategory === category);
  
    if (servicesWithCategory.length > 0) {
      // Present a warning alert
      const alert = await this.alertController.create({
        header: 'Προσοχή!',
        message: 'Εάν διαγράψετε αυτήν την κατηγορία, όλες οι υπηρεσίες που ανήκουν σε αυτήν θα διαγραφούν επίσης. Είστε σίγουροι ότι θέλετε να συνεχίσετε;',
        buttons: [
          {
            text: 'Ακυρο',
            role: 'cancel',
            handler: () => {
              console.log('Category deletion cancelled.');
            }
          },
          {
            text: 'Διαγραφη',
            handler: () => {
              // Delete the category and its associated services
              this.serviceCategories = this.serviceCategories.filter((r: any) => r !== category);
              this.services = this.services.filter(r => r.selectedCategory !== category);
              console.log('Category and associated services deleted.');
            }
          }
        ]
      });
  
      await alert.present();
    } else {
      // If no services are associated with the category, just delete the category
      this.serviceCategories = this.serviceCategories.filter((r: any) => r !== category);
    }
  }
  
  



  addTimeInterval(day: any) {
    const previousInterval = day.timeIntervals[day.timeIntervals.length - 1];
    const defaultStart = previousInterval ? previousInterval.end : '9:00';
    const defaultEnd = previousInterval ? this.addHours(previousInterval.end, 2) : '11:00';

    day.timeIntervals.push({ start: defaultStart, end: defaultEnd });
  }

  addHours(time: string, hours: number): string {
    const parsedTime = moment(time, 'HH:mm');

    if (parsedTime.isValid()) {
      const newTime = parsedTime.clone().add(hours, 'hours'); // Use clone() to avoid mutating parsedTime

      // Check if the newTime has crossed over to the next day
      if (newTime.isSame(parsedTime, 'day')) {
        const formattedTime = newTime.format('HH:mm');
        return formattedTime;
      } else {
        // If the day of newTime is not the same as the day of parsedTime, then it has crossed over to the next day
        return '23:59';
      }
    } else {
      console.log('Invalid time format');
      return '';
    }
  }



  deleteTimeInterval(day: any, index: number) {
    day.timeIntervals.splice(index, 1);
  }


  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }




  nextSlide(swiper: any) {
    this.swiper.slideNext();

  }
  previousSlide() {

    this.swiper.slidePrev();

  }

  onStartTimeChange(selectedStartTime: string, timeInterval: any, day: any) {
    console.log('Selected start time: ', selectedStartTime);

    const parsedSelectedStartTime = moment(selectedStartTime, 'HH:mm');

    for (let previousInterval of day.timeIntervals) {
      if (previousInterval === timeInterval) {
        continue; // Skip current interval
      }

      const parsedPreviousStartTime = moment(previousInterval.start, 'HH:mm');
      const parsedPreviousEndTime = moment(previousInterval.end, 'HH:mm');

      if (parsedSelectedStartTime.isBetween(parsedPreviousStartTime, parsedPreviousEndTime, undefined, '[]')) {
        this.userService.presentToast("Η ώρα έναρξης δεν μπορεί να είναι μέσα στο διάστημα άλλων χρονικών διαστημάτων της ίδιας μέρας", "danger")
        console.log(timeInterval.start)

        new Promise(resolve => setTimeout(resolve, 0)).then(() => {
          timeInterval.start = this.addHours(previousInterval.end, 1); // Suggesting next available time slot after last interval's end time
          selectedStartTime = timeInterval.start;
          console.log(this.days);
        });

        break;
      } else {
        timeInterval.start = selectedStartTime; // Only update start time if it's not within any other time intervals
      }
    }

    if (this.firstDayToggled.name == day.name) {
      console.log("MPIKA")
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }


  onEndTimeChange(selectedEndTime: string, timeInterval: any, day: any) {
    console.log('Selected end time: ', selectedEndTime);

    const parsedEndTime = moment(selectedEndTime, 'HH:mm');
    const parsedStartTime = moment(timeInterval.start, 'HH:mm');

    if (parsedEndTime.isBefore(parsedStartTime)) {
      this.userService.presentToast("Η ώρα τερματισμού πρέπει να είναι μετά την ώρα έναρξης", "danger")
      console.log(timeInterval.start)

      // delay setting the new value until next event loop to give the UI a chance to update
      new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        timeInterval.end = this.addHours(timeInterval.start, 2);
        selectedEndTime = timeInterval.end;
        console.log(this.days);
      });

    } else {
      timeInterval.end = selectedEndTime; // Only update end time if it's not before start time
    }

    if (this.firstDayToggled.name == day.name) {
      console.log("MPIKA")
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }


  firstDayTemplate: any[] = [];
  firstDayToggled: any = null;

  onDayToggle(day: any) {
    // Toggle the day
    day.open = !day.open;

    if (day.open) {
      // If this is the first day toggled, store it
      if (!this.firstDayToggled) {
        this.firstDayToggled = day;
      }
      // If another day is toggled and the template is empty, copy the first day's intervals to the template
      else if (this.firstDayToggled.name != day.name && this.firstDayTemplate.length == 0) {
        this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
        for (let d of this.days) {
          if (d.name !== this.firstDayToggled.name) {
            d.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
          }
        }
      }



      // If this is not the first day toggled and the day has no intervals yet, copy the template to the day
      if (this.firstDayToggled !== day && day.timeIntervals.length === 0) {
        day.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
      }
    }
  }







  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.selectedItems.splice(0);
    this.getSelectedItems()
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

  selectedItems: any[] = [];

  getSelectedItems() {
    this.omorfia_categories.forEach((item: { selected: any; }) => {
      if (item.selected) {
        this.selectedItems.push(item);
      }
    });



  }


  sendData() {
    // Check if every category has at least one service associated with it
    for (let category of this.serviceCategories) {
      let hasService = this.services.some(service => service.selectedCategory === category);
      if (!hasService) {
        this.userService.presentToast("Κάποιες κατηγορίες δεν έχουν υπηρεσίες.","danger")
        return // Disable the button if a category has no associated service
      }
    }
    var expertCategories = "";
    for (let i = 0; i < this.selectedItems.length; i++) {
      if (i != this.selectedItems.length - 1) {
        expertCategories = expertCategories + this.selectedItems[i].title + ","
      } else {
        expertCategories = expertCategories + this.selectedItems[i].title

      }
    }
    this.userService.onBoarding(this.expertName, expertCategories, this.address, this.expertImage, this.days, this.people, this.services,this.serviceCategories).subscribe(data => {
      this.userService.presentToast("Τα στοιχεία σας καταχωρήθηκαν με επιτυχία!", "success")
      localStorage.setItem('authenticated', "true");
      this.userService._isAuthenticated.next(true);
      window.location.href = '/tabs/home';

    }, err => {
      console.log(err)
      if (err.error == "Slug") {
        this.userService.presentToast("Το όνομα επιχείρησης υπάρχει ήδη. Πρακαλώ επιλέξτε κάποιο άλλο.", "danger")
        this.swiper.slideTo(1)
      } else if (err.error == "Name") {
        this.userService.presentToast("Το όνομα επιχείρησης δεν είναι έγκυρο. Πρακαλώ επιλέξτε κάποιο άλλο.", "danger")
        this.swiper.slideTo(1)
      } else if (err.error == "Categories") {
        this.userService.presentToast("Κάτι πήγε στραβά με τις κατηγορίες. Πρακαλώ ξανά προσπαθήστε.", "danger")
        this.swiper.slideTo(4)
      }
      else {
        this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε αργότερα.", "danger")

      }

      //this.expertName=err.error.text;
    })
  }

  async chooseAddress() {

    const modal = await this.modalController.create({
      component: ChooseAddressPage,
    });
    modal.onDidDismiss().then((data) => {
      if (data.data != undefined) {
        this.addressEntered = true;
        this.address = data.data

      }
      // Do something with the data returned from the modal
    });
    return await modal.present();
  }


  isScheduleDefault(personschedule: any[]): boolean {
    // create a deep copy of the default schedule and filter for open days
    const defaultScheduleCopy = JSON.parse(JSON.stringify(this.days)).filter((day: { open: boolean; }) => day.open);

    // translate days to match person schedule
    defaultScheduleCopy.forEach((day: { name: string; }) => {
      day.name = day.name;
    });

    // compare schedules
    for (let defaultDay of defaultScheduleCopy) {
      let personDay = personschedule.find((day: { day: any; }) => day.day === defaultDay.name);
      if (!personDay) {
        return false;
      }

      // Convert the timeIntervals array into a format that matches personDay.intervals
      let defaultIntervals = defaultDay.timeIntervals.map((interval: { start: string; end: string; }) => interval.start + '-' + interval.end);

      // If the lengths of the two interval arrays don't match, the schedules can't be the same
      if (defaultIntervals.length != personDay.intervals.length) {
        return false;
      }

      // Sort both intervals arrays and compare them
      defaultIntervals.sort();
      personDay.intervals.sort();

      for (let i = 0; i < defaultIntervals.length; i++) {
        if (defaultIntervals[i] != personDay.intervals[i]) {
          return false;
        }
      }
    }

    return true;
  }





  async managePerson(person?: any) {
    const isEditing = !!person; // if 'person' is provided, we are in editing mode

    const defaultComponentProps = {
      data: this.days,
    };

    const editingComponentProps = isEditing ? {
      personSchedule: person.schedule,
      personName: person.name,
      personSurName: person.surname,

      toggled: !this.isScheduleDefault(person.schedule),
    } : {};

    const modal = await this.modalController.create({
      component: AddPersonPage,
      componentProps: { ...defaultComponentProps, ...editingComponentProps }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      const processedPerson = {
        name: data.personName,
        surname:data.personSurName,
        image: data.image,
        schedule: data.days.filter((day: { open: any; }) => day.open).map((day: { name: any; timeIntervals: any[]; }) => {
          const mappedDay = day.name;
          return {
            day: mappedDay,
            intervals: day.timeIntervals.map(interval => `${interval.start}-${interval.end}`),
          }
        }),
      };

      if (isEditing) {
        let peopleIndex = this.people.findIndex(r => r.name === person.name);
        if (peopleIndex !== -1) {
          this.people[peopleIndex] = processedPerson;
        }
      } else {
        this.people.push(processedPerson);
      }
    }
  }


  async editService(service: any) {
    // Transform the people array to contain only names and selected attributes
    const transformedPeople = this.people.map((person: any) => ({
      name: person.name,
      surname:person.surname,
      selected: person.selected
    }));
    console.log("The categories")
    console.log(this.serviceCategories)
    const modal = await this.modalController.create({
      component: NewServicePage,
      componentProps: {
        people: transformedPeople,
        serviceName: service.name,
        servicePrice: service.price,
        servicePeople: service.people,
        serviceDuration: service.duration,
        serviceDescription: service.description,
        categories: this.serviceCategories,
        serviceCategory: service.selectedCategory,
        editing: true,
        services:this.services
      }
    });
  
    await modal.present();
    
    const { data } = await modal.onDidDismiss();
  
    if (data?.deletedServiceName) {
      // Handle deletion of service
      const serviceIndex = this.services.findIndex((s) => s.name === data.deletedServiceName);
      if (serviceIndex !== -1) {
        this.services.splice(serviceIndex, 1);
        console.log("Service deleted:", data.deletedServiceName);
      }
    } else if (data) {
      const processedService = {
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        people: data.people,
        selectedCategory: data.selectedCategory,
      };
    
      // Find and update the service in the services array
      const serviceIndex = this.services.findIndex((s) => s.name === service.name);
      if (serviceIndex !== -1) {
        this.services[serviceIndex] = processedService;
      }
    }
  
    console.log("Actions on service completed");
    console.log(this.services);
  }
  


  isMobile() {
    return this.userService.isMobile();
  }

  async newCategory() {
    const alert = await this.alertController.create({
      header: 'Νέα Κατηγορία Υπηρεσιών',
      inputs: [
        {
          name: 'categoryName',
          type: 'text',
          placeholder: 'Όνομα Κατηγορίας'
        }
      ],
      buttons: [
        {
          text: 'Ακυρο',
          role: 'cancel'
        },
        {
          text: 'Προσθηκη',
          handler: async (data: { categoryName: any; }) => {
            console.log('Category Attempt:', data.categoryName);
            if (this.categoryExists(data.categoryName)) {
              // Present a toast to the user
             this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.","danger")
             return false;
            } else {
              console.log('Category Added:', data.categoryName);
              this.serviceCategories.push(data.categoryName);
              return true; 

            }
          }
        }
        
      ]
    });

    await alert.present();
  }

  categoryExists(categoryName: string): boolean {
    return this.serviceCategories.includes(categoryName);
  }
  

  async editCategory(currentCategory: string) {
    const alert = await this.alertController.create({
      header: 'Επεξεργασία Κατηγορίας',
      inputs: [
        {
          name: 'categoryName',
          type: 'text',
          placeholder: 'Όνομα Κατηγορίας',
          value: currentCategory // setting the current name as default
        }
      ],
      buttons: [
        {
          text: 'Ακυρο',
          role: 'cancel'
        },
        {
          text: 'Ενημέρωση',
          handler: (data: { categoryName: any; }) => {
            
            // Check if the new category name already exists, but not counting the currentCategory being edited
            if (data.categoryName !== currentCategory && this.serviceCategories.includes(data.categoryName)) {
              this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.", "danger");
              return false; // Keep the alert open
            }
  
            console.log('Category Updated:', data.categoryName);
  
            // Find the index of the category to replace
            const index = this.serviceCategories.indexOf(currentCategory);
            if (index > -1) {
              this.serviceCategories[index] = data.categoryName;
            }
  
            // Update the selectedCategory for services
            this.services.forEach(service => {
              if (service.selectedCategory === currentCategory) {
                service.selectedCategory = data.categoryName;
              }
            });
            return true; 

          }
        }
      ]
    });
  
    await alert.present();
  }
  

  async addService() {
    console.log(this.serviceCategories);
  
    const transformedPeople = this.people.map((person: any) => ({
      name: person.name,
      surname: person.surname,

    }));
  
    const modal = await this.modalController.create({
      component: NewServicePage,
      componentProps: { people: transformedPeople, categories: this.serviceCategories,services:this.services }
    });
    await modal.present();
  
    const { data } = await modal.onDidDismiss();
    console.log(data);
  
    if (data) {
      const service = {
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        selectedCategory: data.selectedCategory,
        people: data.people,
      };
      this.services.push(service);
      this.serviceCategories=data.categories

      console.log("After closing newService")
      console.log(service)
      console.log(this.serviceCategories)
    }
    this._cd.detectChanges();
  }
  

  getServicesForCategory(categoryName: string): any[] {
    return this.services.filter(service => service.selectedCategory === categoryName);
}


  openCropperDialog(imageURL: string | undefined) {
    console.log(imageURL)
    this.cropped = null!;
    this._dialog.open(CropperDialog, {
      data: imageURL,
      width: 320,
      disableClose: true
    }).afterClosed.subscribe((result?: ImgCropperEvent) => {
      if (result) {
        this.cropped = result.dataURL;
        this.expertImage = this.cropped
        this._cd.markForCheck();
        this.new_image = "true"
      }
    });
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



  importFromStorage() {
    this._fileInput.nativeElement.click();
  }

  importFromCamera() {
    this.takePicture()
  }

  async takePicture() {
    const image = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });
    console.log(image)
    // do something with the captured image
    this.openCropperDialog(image.webPath)
  }

  getFileUrl(input: HTMLInputElement): string {
    const file = input.files && input.files[0];
    if (file) {
      return URL.createObjectURL(file); // create a URL for the selected file
    }
    return '';
  }

  async selectImageFromFacebook() {
    const modal = await this.modalController.create({
      component: FacebookImagesPage,

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedImage = data.imageSelected; // Update the person's table types with the returned data
      this.openCropperDialog(this.selectedImage.imageLink)
      console.log(data)
    }
  }

  async selectImageFromInstagram() {
    const modal = await this.modalController.create({
      component: InstagramImagesPage,

    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedImage = data.imageSelected; // Update the person's table types with the returned data
      this.openCropperDialog(this.selectedImage.imageLink)
      console.log(data)
    }
  }


 
  isEndButtonDisabled(): boolean {
   

    if (this.services.length == 0 || this.serviceCategories.length == 0) {
      return true;
    }

    let categoriesWithServices = new Set();

    for (let service of this.services) {
      if (typeof service.selectedCategory === 'string') {
        categoriesWithServices.add(service.selectedCategory);
      }
    }
    for (let category of this.serviceCategories) {
      if (!categoriesWithServices.has(category)) {
        return true; 
      }
    }

    return false;
}


  
}



