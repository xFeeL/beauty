import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonInput, ModalController, NavParams } from '@ionic/angular';
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
  people: any = new Array<any>;
  servicePrice!: number;

  @ViewChild('ionInputEl', { static: true }) ionInputEl!: IonInput;
  serviceDuration: any;
  serviceDescription: any = "";
  categories: any = [];
  serviceCategory: string = '';
  newCategory: string = '';
  services: any = [];
  originalServiceName: any;
  service_id: any = null;

  constructor(private dialog: MatDialog, private modalController: ModalController, private userService: UserService, private navParams: NavParams, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) {
  }
  ngOnInit() { }

  ionViewWillEnter() {
    this.people = this.navParams.get('people');
    console.log("THE PEOPLE")
    console.log(this.people)
    this.categories = this.navParams.get('categories');
    this.service_id = this.navParams.get('serviceId');

    this.services = this.navParams.get('services');
    this.serviceCategory = this.navParams.get('serviceCategory');
    this.originalServiceName = this.navParams.get('serviceName');
    console.log("The categories are")
    console.log(this.serviceCategory)
    // Make all people unselected by default
    this.people.forEach((person: { selected: boolean; }) => person.selected = false);

    // Get the servicePeople from navParams
    let servicePeople = this.navParams.get('servicePeople');
    console.log(this.people)
    console.log(servicePeople)
    // If servicePeople is found in the navParams, mark those people as selected

    if (servicePeople && servicePeople.length) {
      servicePeople.forEach((servicePersonName: string) => {
        console.log(`Looking for: ${servicePersonName}`);
        let person = this.people.find((p: { name: string; surname: string; }) => {
          const combinedName = `${p.name} ${p.surname}`;
          console.log(`Checking against: ${combinedName}`);
          return combinedName === servicePersonName;
        });

        if (person) {
          person.selected = true;
        } else {
          console.log(`Person not found for: ${servicePersonName}`);
        }
      });
    }



    console.log("Opening New Service Modal");
    console.log(this.people)
    console.log(servicePeople)
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
    console.log("Save service")
    console.log(typeof (this.servicePrice))
    console.log(this.serviceName)
    console.log(this.serviceDuration)
    if (this.servicePrice == undefined || this.serviceName.trim() === '' || this.serviceDuration <= 0) {
      this.userService.presentToast('Παρακαλώ συμπληρώστε όλα τα πεδία.', "danger");
      return;
    }
    console.log('Categories:', this.categories);
    console.log('Selected Category Name:', this.serviceCategory);
    
    // Find the category object based on the serviceCategoryName
    const category = this.categories.find((cat: { name: string; }) => cat.name === this.serviceCategory);

    // Check if selected category exists in categories
    if (!category) {
      this.userService.presentToast('Παρακαλώ επιλέξτε κατηγορία.', "danger");
      return;
    }
    const serviceCategoryId = category.id;

    // Filter to get selected people objects
    const selectedPeople = this.people.filter((person: { selected: any; }) => person.selected);
    const selectedPeopleNames = selectedPeople.map((person: { name: string; surname: string; }) => `${person.name} ${person.surname}`);

    // Check if no people are selected
    if (selectedPeople.length === 0) {
      this.userService.presentToast('Παρακαλώ επιλέξτε τουλάχιστον ένα άτομο.', "danger");
      return;
    }

    // Check if the service already exists
    if (this.serviceExists(this.serviceName, this.originalServiceName)) {
      this.userService.presentToast('Η υπηρεσία με αυτό το όνομα υπάρχει ήδη.', "danger");
      return;
    }

    let body = {
      "name": this.serviceName,
      "price": this.servicePrice,
      "duration": this.serviceDuration,
      "description": this.serviceDescription,
      "serviceCategoryName": this.serviceCategory,
      "serviceCategoryId": serviceCategoryId,
      "people": selectedPeople, // Sending the whole objects of selected people
      "id": this.service_id
    }
    this.userService.saveService(body).subscribe((res: any) => {
      this.userService.presentToast("Η υπηρεσία αποθηκεύτηκε επιτυχώς.", "success")
      this.modalController.dismiss({
        'edited': true
      });
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ ξαναπροσπαθήστε.", "danger")
    })
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
        'edited':true
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

    console.log(filteredValue);
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





}

