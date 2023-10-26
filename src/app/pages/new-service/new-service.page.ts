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
  editing = false;
  services: any = [];
  originalServiceName: any;

  constructor(private dialog: MatDialog, private modalController: ModalController, private userService: UserService, private navParams: NavParams, private actionSheetCtrl: ActionSheetController, private alertCtrl: AlertController) {
  }
  ngOnInit() { }

  ionViewWillEnter() {
    this.people = this.navParams.get('people');
    console.log("THE PEOPLE")
    console.log(this.people)
    this.categories = this.navParams.get('categories');
    this.editing = this.navParams.get('editing');
    this.services = this.navParams.get('services');
    this.serviceCategory=this.navParams.get('serviceCategory');
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
    if (!this.editing) {
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
      this.userService.presentToast('Παρακαλώ συμπληρώστε όλα τα  πεδία.', "danger");
      return;
    }

    // Check if selected category exists in categories
    if (!this.categories.includes(this.serviceCategory)) {
      this.userService.presentToast('Παρακαλώ επιλέξτε κατηγορία.', "danger");
      return;
    }
    const selectedPeople = this.people.filter((person: { selected: any; }) => person.selected);
    const selectedPeopleNames = selectedPeople.map((person: { name: string; surname: string; }) => `${person.name} ${person.surname}`);

    // Check if no people are selected
    if (selectedPeopleNames.length === 0) {
      this.userService.presentToast('Παρακαλώ επιλέξτε τουλάχιστον ένα άτομο.', "danger");
      return;
    }

    // Check if the service already exists
    if (this.serviceExists(this.serviceName, this.originalServiceName)) {
      this.userService.presentToast('Η υπηρεσία με αυτό το όνομα υπάρχει ήδη.', "danger");
      return;
    }

    await this.modalController.dismiss({
      'name': this.serviceName,
      'price': this.servicePrice,
      'people': selectedPeopleNames,  // Using the names only array here
      'duration': this.serviceDuration,
      'description': this.serviceDescription,
      'selectedCategory': this.serviceCategory,
      'categories': this.categories
    });

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
    this.modalController.dismiss({
      'deletedServiceName': this.serviceName // assuming this.serviceName contains the name of the service you want to delete
    });
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

    // Remove all characters except numbers and a comma
    let filteredValue = value.replace(/[^0-9.]+/g, '');

    // If more than one comma exists, keep only the first comma
    const allCommas = filteredValue.split('.');
    if (allCommas.length > 2) {
      filteredValue = allCommas[0] + '.' + allCommas.slice(1).join('');
    }

    // Check if the string has a comma and make sure only two numbers follow it
    const parts = filteredValue.split('.');

    if (parts.length > 1 && parts[1].length > 2) {
      // If there are more than two characters after the comma, truncate them
      filteredValue = parts[0] + '.' + parts[1].slice(0, 2);
    }

    // Remove trailing ,0 or ,00
    if (filteredValue.endsWith('.0') || filteredValue.endsWith('.00')) {
      filteredValue = parts[0];
    }

    // Set the value of the input field to the filtered value
    ev.target.value = filteredValue;

    console.log(filteredValue);
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

