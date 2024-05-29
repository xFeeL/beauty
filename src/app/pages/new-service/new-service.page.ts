import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonContent, IonInput, ModalController, NavParams } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { AlertController } from '@ionic/angular';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';


@Component({
  selector: 'app-new-service',
  templateUrl: './new-service.page.html',
  styleUrls: ['./new-service.page.scss'],
})
export class NewServicePage implements OnInit {

  serviceName = ""
  serviceDuration: any;
  serviceDescription: any = "";
  servicePrice!: number;

  people: any = new Array<any>;

  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;

  categories: any = [];
  serviceCategory: string = '';
  newCategory: string = '';
  services: any = [];
  originalServiceName: any;
  service_id: any = null;
  onboarding: any = false;
  variations: any = []
  @ViewChild(IonContent, { static: false }) content!: IonContent;

  constructor(private alertController: AlertController,private dialog: MatDialog, private modalController: ModalController, private userService: UserService, private navParams: NavParams, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) {
  }
  ngOnInit() { }

  ionViewWillEnter() {
    this.onboarding = this.navParams.get('onboarding');
    
    this.people = this.navParams.get('people');

    this.categories = this.navParams.get('categories');
    this.service_id = this.navParams.get('serviceId');
    if(!this.onboarding){
      this.userService.getServiceVariations(this.service_id).subscribe(data=>{
        
        this.variations=data;
        
  
      },err=>{
  
      })
    }
    
    this.variations = this.navParams.get('variations') || [];
    
    
    this.services = this.navParams.get('services');
    this.serviceCategory = this.navParams.get('serviceCategory');
    this.originalServiceName = this.navParams.get('serviceName');

    // Make all people unselected by default
    this.people.forEach((person: { selected: boolean; }) => person.selected = false);

    // Get the servicePeople from navParams
    let servicePeople = this.navParams.get('servicePeople');

    // If servicePeople is found in the navParams, mark those people as selected

    if (servicePeople && servicePeople.length) {
      servicePeople.forEach((servicePersonName: string) => {
        let person = this.people.find((p: { name: string; surname: string; }) => {
          const combinedName = `${p.name} ${p.surname}`;
          return combinedName === servicePersonName;
        });

        if (person) {
          person.selected = true;
        } else {
        }
      });
    }

    if (this.service_id == null) {
      this.selectAll = true
      this.selectAllPeople();
    } else {
      if (this.people.length == servicePeople.length) {
        this.selectAll = true

      } else {
        this.selectAll = false

      }

    }
  }


  goBack() {
    this.modalController.dismiss()
  }

  async saveService() {
    if (this.servicePrice === undefined || this.serviceName.trim() === '' || this.serviceDuration <= 0) {
      this.userService.presentToast('Παρακαλώ συμπληρώστε όλα τα πεδία.', "danger");
      return;
    }
  
    // Find the category object based on the serviceCategoryName
    let category;
    if (!this.onboarding) {
      category = this.categories.find((cat: { name: string; }) => cat.name === this.serviceCategory);
    } else {
      category = this.categories.find((cat: string) => cat === this.serviceCategory);
    }
  
    if (!category) {
      this.userService.presentToast('Παρακαλώ επιλέξτε κατηγορία.', "danger");
      return;
    }
    const serviceCategoryId = category.id;
  
    const selectedPeople = this.people.filter((person: { selected: any; }) => person.selected);
    const selectedPeopleNames = selectedPeople.map((person: { name: any; surname: any; }) => `${person.name} ${person.surname}`);
  
    if (selectedPeople.length === 0) {
      this.userService.presentToast('Παρακαλώ επιλέξτε τουλάχιστον ένα άτομο.', "danger");
      return;
    }
  
    if (this.serviceExists(this.serviceName, this.originalServiceName)) {
      this.userService.presentToast('Η υπηρεσία με αυτό το όνομα υπάρχει ήδη.', "danger");
      return;
    }
  
    // Calculate minimum duration and price from variations if there are any
    if (this.variations.length > 0) {
      const minPrice = Math.min(...this.variations.map((variation: { price: any; }) => Number(variation.price)));
      const minDuration = Math.min(...this.variations.map((variation: { duration: any; }) => Number(variation.duration)));
  
      this.servicePrice = minPrice;
      this.serviceDuration = minDuration;
    }
  
    // Proceed with the rest of your method...
    if (!this.onboarding) {
      let body = {
        "name": this.serviceName,
        "price": this.servicePrice,
        "duration": this.serviceDuration,
        "description": this.serviceDescription,
        "serviceCategoryName": this.serviceCategory,
        "serviceCategoryId": serviceCategoryId,
        "people": selectedPeople,
        "id": this.service_id,
        "variations": this.variations.map((variation: { price: any; duration: any; }) => ({
          ...variation,
          price: Number(variation.price),
          duration: Number(variation.duration)
        }))
      };
      this.userService.saveService(body).subscribe(res => {
        this.userService.presentToast("Η υπηρεσία αποθηκεύτηκε επιτυχώς.", "success")
        this.modalController.dismiss({
          'edited': true
        });
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ ξαναπροσπαθήστε.", "danger")
      });
    } else {
      await this.modalController.dismiss({
        'id': this.userService.generateUniqueId(), 
        'name': this.serviceName,
        'price': this.servicePrice,
        'people': selectedPeopleNames,
        'duration': this.serviceDuration,
        'description': this.serviceDescription,
        'selectedCategory': this.serviceCategory,
        'categories': this.categories,
        'variations': this.variations
      });
    }
  }
  

  serviceExists(serviceName: string, originalServiceName?: string): boolean {
    for (const service of this.services) {
      if (service.name === serviceName) {
        if (originalServiceName && service.name === originalServiceName) {
          // If we're checking the same service as the one being edited, continue to the next iteration
          continue;
        }
        return true;
      }
    }
    return false;
  }

  deleteService() {
    this.userService.deleteService(this.service_id).subscribe((res: any) => {
      this.userService.presentToast("Η υπηρεσία διαγράφηκε επιτυχώς.", "success")
      this.modalController.dismiss({
        'edited': true
      });
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ ξαναπροσπαθήστε.", "danger")
    })

  }


  onDurationInput(ev: any) {
    const value = ev.target!.value;

    // Remove all characters except numbers
    let filteredValue = value.replace(/[^0-9]+/g, '');

    // Set the value of the input field to the filtered value
    ev.target.value = filteredValue;

    
  }

  isSaveDisabled() {
    // Check if all required main service fields are filled out
    const mainFields = [this.serviceName, this.servicePrice, this.serviceDuration, this.serviceCategory];
    const areMainFieldsFilled = mainFields.every(field => field); // Every main field must be filled
  
    // Check variations only if there are any
    let areVariationsValid = true; // Assume valid if there are no variations
    if (this.variations.length > 0) {
      // If there are variations, check that each one has a name, price, and duration filled out
      areVariationsValid = this.variations.every((variation: { name: any; price: any; duration: any; }) => variation.name && variation.price && variation.duration);
    }
  
    // Disable save if any main field is empty or if variations are present and not valid
    return !areMainFieldsFilled || !areVariationsValid;
  }
  
  


  onInput(ev: any) {
    const value = ev.target!.value;
    let filteredValue = value.replace(/[^0-9.]+/g, '');
    const allCommas = filteredValue.split('.');
    if (allCommas.length > 2) {
      filteredValue = allCommas[0] + '.' + allCommas.slice(1).join('');
    }
    const parts = filteredValue.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      filteredValue = parts[0] + '.' + parts[1].slice(0, 2);
    }
    if (filteredValue.endsWith('.0') || filteredValue.endsWith('.00')) {
      filteredValue = parts[0];
    }
    ev.target.value = filteredValue;
  }

  selectAll: boolean = true; // Default checked for "Select All"


  // This method will be triggered when "Select All" checkbox state changes
  selectAllPeople() {
    for (let person of this.people) {
      person.selected = this.selectAll;
    }
  }


  checkIfAllSelected() {
    if (this.people.every((person: { selected: any; }) => person.selected)) {
      this.selectAll = true;
    } else {
      this.selectAll = false;
    }
  }

  isMobile() {
    return this.userService.isMobile()
  }


  newVariation() {
    // Function to generate a unique ID
  
    // Check if this is the first variation being created
    if (this.variations.length === 0) {
      // If yes, create a variation that copies values from this.servicePrice and this.serviceDuration
      const initialVariation = {
        id: this.userService.generateUniqueId(), 
        name: '',
        price: this.servicePrice,
        duration: this.serviceDuration,
      };
      this.variations.push(initialVariation);
    }
  
    // Create the new variation with empty or default values and a unique ID
    const variation = {
      id: this.userService.generateUniqueId(), 
      name: '',
      price: '',
      duration: '',
    };
    this.variations.push(variation); // Add the new variation to the variations array
  
    this.scrollToBottomSetTimeOut(20);
  }
  
  

  scrollToBottomSetTimeOut(time: number) {

    setTimeout(() => {
      this.content.scrollToBottom();
    }, time);
  }

  async deleteVariation(index: any) {
    const alert = await this.alertController.create({
      header: 'Επιβεβαίωση διαγραφής', // 'Delete Confirmation' in Greek
      message: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή τον τρόπο τιμολόγησης;', // 'Are you sure you want to delete this variation?' in Greek
      buttons: [
        {
          text: 'Ακυρωση', // 'Cancel' in Greek
          role: 'cancel',
          handler: () => {
            
          }
        },
        {
          text: 'Διαγραφη', // 'Delete' in Greek
          handler: () => {
            // Check if the index is valid
            if (index > -1 && index < this.variations.length) {
              // Remove the variation at the specified index
              this.variations.splice(index, 1);
            }
          }
        }
      ]
    });
  
    await alert.present();
  }

}

