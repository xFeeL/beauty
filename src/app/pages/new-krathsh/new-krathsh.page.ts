import { Component, OnInit, ViewChild, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonContent, IonModal, IonPopover, ItemReorderEventDetail, ModalController, NavParams } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { trigger, state, style, animate, transition, AnimationEvent } from '@angular/animations';
import { AddServicesPage } from '../add-services/add-services.page';
import { lastValueFrom } from 'rxjs';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';
import { TeamServicesPromptPage } from '../team-services-prompt/team-services-prompt.page';

@Component({
  selector: 'app-new-krathsh',
  templateUrl: './new-krathsh.page.html',
  styleUrls: ['./new-krathsh.page.scss'],
 /* animations: [
    trigger('moveToBottom', [
      state('void', style({ transform: 'translateY(-50px)', opacity: 0 })),
      state('*', style({ transform: 'translateY(0)', opacity: 1 })),
      transition(':enter', [
        animate('300ms ease-out', style({})),
      ]),
      transition(':leave', [
        animate('300ms ease-in')
      ]),
    ]),
  ],*/
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class NewKrathshPage implements OnInit {
  saveButtonEnabled = false;
  searchTerm: string = '';
  filteredClients!: string[];
  suggestionsNames: any;
  isAddingNewClient: boolean = false;
  newClientName: string = '';
  newClientSurname: string = '';
  newClientPhone: string = '';
  newClientEmail: string="";

  isLoading: boolean = false;
  selectedClient!: any;
  selectedClientPhone!: any;
  theDate!: string | undefined;
  dayValues!: string;
  minDate: string;
  previous!: any;
  month!: any;
  year!: any;
  time_slots: any;
  months = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
  dateSelected: boolean = false;
  timeSelected: boolean = false;
  timeSlotSelected!: any;
  splitChoices: any;
  peopleSelected: boolean = false;
  animationState: 'in' | 'out' = 'in'; // Add this line
  currentService: any = null;
  selectedClientId: any = "";
  selectedClientImage: any = "";
  servicesEmployees: any;

  canSelectDate: boolean = false;
  availableDays: any;
  allEmployeeIds: string = "";
  editing: boolean = false;
  appointment_data: any;
  dataChanged = false;
  appointmentId: string | null = null;
  selectedServicesAndPackages: any = [];
  filteredTimeSlots: any[] = [];
  toggleValue = "all"
  phoneMask: MaskitoOptions = {
    mask: ['+', '3', '0', ' ', '6', '9', /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, /\d/],
  };
  isInputValid: boolean = false;
  readonly options: MaskitoOptions = this.phoneMask;
  readonly maskPredicate: MaskitoElementPredicateAsync = async (el) => (el as HTMLIonInputElement).getInputElement();
  constructor(private modalController: ModalController, private userService: UserService, private navParams: NavParams, private _cd: ChangeDetectorRef) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.animationState = 'in';
  }
  @ViewChild(IonContent, { static: false }) content2!: IonContent;

  @ViewChild('clientModal') clientModal!: IonModal;
  selectedServices: Array<any> = new Array<any>;




  ngOnInit() {

  }



  ionViewWillEnter() {
    if (this.navParams.get("appointment_data") != undefined) {
      this.editing = true;
      this.appointment_data = this.navParams.get("appointment_data");
      this.appointmentId = this.appointment_data.appointmentId;
      this.theDate = this.appointment_data.date;
      // Map services with isSelected and indexOrder
      const mappedServices = this.appointment_data.services.map((service: any) => ({
        ...service,
        isSelected: true,
        indexOrder: service.indexOrder // assuming indexOrder is a property of service
      }));
  
      // Map packages and their services, copying the package's indexOrder, packageId, and packageName to its services
      const packages = this.appointment_data.packages || [];
      const packageServices = packages.flatMap((pkg: any) => {
        return (pkg.serviceObjects || []).map((service: any) => ({
          ...service,
          isSelected: true,
          indexOrder: pkg.indexOrder, // copying indexOrder from package to its services
          packageId: pkg.id, // assuming the package ID is stored in pkg.id
          packageName: pkg.name,
        }));
      });
  
      // Combine services from both individual services and package services
      this.selectedServices = [...mappedServices, ...packageServices]
        .sort((a, b) => a.indexOrder - b.indexOrder);
  
      // If you still need the mappedPackages for other purposes, map them separately
      const mappedPackages = packages.map((pkg: any) => ({
        ...pkg,
        isSelected: true,
        indexOrder: pkg.indexOrder, // assuming indexOrder is a property of package
        servicesObjects: pkg.serviceObjects || [],
        type: 'package'
      }));
  
      // Combine mapped services and packages for any other usage
      this.selectedServicesAndPackages = [...mappedServices, ...mappedPackages]
        .sort((a, b) => a.indexOrder - b.indexOrder);
      let serviceIds = this.selectedServices.map((service: { id: any; }) => service.id).join(',');
  
      this.userService.getEmployeesOfServices(serviceIds).subscribe(response => {
        // Loop through each service in selectedServices
        for (let service of this.selectedServices) {
          let matchingServiceResponse = response.find((res: { serviceId: any; }) => res.serviceId === service.id);
          service.employees = matchingServiceResponse ? matchingServiceResponse.employees : [];
        }
        if (this.selectedServices && this.selectedServices.length > 0) {
          this.currentService = this.selectedServices[0];
        }
        this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);
        this.allEmployeeIds = this.selectedServices.map(s => s.selectedEmployeeId).join(',');
        this.updateServiceEmployees()
        this.onMonthChange();
        this._cd.markForCheck(); // Add this line
  
      }, err => {
        if (err.error == "Service doesn't exist") {
          this.selectedServices = [];
          this._cd.markForCheck(); // Add this line
        }
      });
    } else {
      this.chooseServices();
      this._cd.markForCheck(); // Add this line
    }
  }


  goBack() {
    this.modalController.dismiss(false)
  }



  selectEmployee(service: any, employeeId: string) {
    this.resetView();
    service.selectedEmployeeId = employeeId;
    const currentIndex = this.selectedServices.indexOf(service);
    if (currentIndex < this.selectedServices.length - 1) {
      this.currentService = this.selectedServices[currentIndex + 1];
    } else {
      this.allEmployeeIds = this.selectedServices.map(s => s.selectedEmployeeId).join(',');



      this.onMonthChange();

    }

    this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);
  }



  presentClientPop() {
    this.clientModal.present()
    this.isAddingNewClient = false
  }



  onMonthChange() {
    setTimeout(() => {
      this.previous = ''
      const targetNode = document.querySelector('ion-datetime.mxw') as HTMLElement;
      const config = { attributes: true, childList: true, subtree: true };
      let that = this;
      const callback = (mutationsList: any, observer: any) => {

        for (const mutation of mutationsList) {
          if (mutation.type === 'attributes') {
            let datetimeElement = document.querySelector('ion-datetime.mxw') as HTMLElement;

            if (datetimeElement && datetimeElement.shadowRoot) {
              let labelElement = datetimeElement.shadowRoot.querySelector('ion-label');

              if (labelElement) {
                let e = labelElement.textContent;
           

                if (e !== this.previous) {
                  that.dayValues = ""
                  this.previous = e;
                  if (e) {
                    this.month = that.months.indexOf(e.split(' ')[0]) + 1;
                    this.year = e.split(' ')[1]
                    this.userService.getAvailableDays(this.month, this.year, this.allEmployeeIds).subscribe(data => {
                      let availableDates = data || [];

                      that.dayValues = availableDates.join(',');
                      if (!this.editing) {
                        this.scrollToBottomSetTimeout(150);

                      }
                      this._cd.markForCheck(); // Add this line

                    }, err => {
                    });
                  }
                }
              }
            }
          }
        }
      };
      const observer = new MutationObserver(callback);
      observer.observe(targetNode, config);
      this._cd.markForCheck(); // Add this line

    }, 0);
    if (this.editing && !this.dataChanged) {
      this.dateChanged();
    }
    this._cd.markForCheck(); // Add this line

  }

  calculateTotalDuration(service: any): number {
    return service.serviceObjects.reduce((total: number, obj: { duration: number }) => total + obj.duration, 0);
  }



  dateChanged() {
  this.time_slots = [];

  const temp_date = moment(this.theDate).format('YYYY-MM-DD');
  this.updateServiceEmployees();

  this.userService.getAvailableTimeBooking(temp_date, this.servicesEmployees, this.appointmentId).subscribe(response => {
    if (response.length === 0) {
      // If no time slots are available, clear the time_slots and set flags accordingly
      this.time_slots = [];
      this.filteredTimeSlots = [];
      this.dateSelected = true;  // Set to true to ensure template checks work correctly
      this.timeSelected = false;
      this.timeSlotSelected = null;
      this.scrollToBottomSetTimeout(150);
      this._cd.markForCheck(); // Add this line

      //this.userService.presentToast("No available time slots for the selected date.", "warning");
      return;
    }

    // Populate the time_slots array with the start of the outerTimePeriods
    for (let i = 0; i < response.length; i++) {
      let slot = {
        value: response[i].outerTimePeriod.start.slice(0, 5),
        selected: false
      };
      this.time_slots.push(slot);
    }

    this.dateSelected = true;

    if (this.editing && !this.dataChanged) {
      // Convert the time format from "03:30 μ.μ. - 03:53 μ.μ." to "15:30"
      let convertedTime = this.convertTimeFormatForEdit(this.appointment_data.time.split('-')[0].trim());

      // Find the slot from the time_slots array that matches the converted time
      let foundSlot = this.time_slots.find((slot: { value: string; }) => slot.value === convertedTime);

      this.saveButtonEnabled = true;
      // If the slot is found, call slotSelected on it
      if (foundSlot) {
        this.slotSelected(foundSlot);
      } else {
        // If the slot is not found, add it to the time_slots array and select it
        let newSlot = {
          value: convertedTime,
          selected: true
        };
        this.time_slots.push(newSlot);
        this.timeSlotSelected = newSlot; // Setting the new slot as the selected slot

        // Sort the time_slots array to maintain order
        this.time_slots.sort((a: { value: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any; }; }; }; }, b: { value: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any; }; }; }; }) => {
          let [hourA, minuteA] = a.value.split(':').map(Number);
          let [hourB, minuteB] = b.value.split(':').map(Number);
          if (hourA !== hourB) return hourA - hourB;
          return minuteA - minuteB;
        });
      }
    } else {
      this.scrollToBottomSetTimeout(150);
      this.timeSelected = false;
      this.timeSlotSelected = null;
    }
    this.filteredTimeSlots = [...this.time_slots];
    this._cd.markForCheck(); // Add this line
  });
}



  convertTimeFormatForEdit(time: string): string {
    let timeParts = time.split(' ');
    let hourMinute = timeParts[0].split(':');
    let hour = parseInt(hourMinute[0]);
    // Convert to 24-hour format if it's PM (μ.μ.)
    if (timeParts[1] && timeParts[1].toLowerCase() === 'μ.μ.' && hour !== 12) {
      hour += 12;
    }
    // Ensure the leading zero for hours less than 10
    let formattedHour = hour < 10 ? '0' + hour : '' + hour;
    return `${formattedHour}:${hourMinute[1]}`;
  }





  scrollToBottomSetTimeout(time: number) {
    const scrollDuration = 300; // Duration of the scroll animation in milliseconds

    setTimeout(() => {
      this.content2.scrollToBottom(scrollDuration);
    }, time);
  }




  searchClient() {
    this.suggestionsNames = []
    if (this.searchTerm != "") {
      this.isLoading = true;
  
      this.userService.searchClient(this.searchTerm).subscribe(data => {
        this.suggestionsNames = data;
        this.isLoading = false;
        this._cd.markForCheck(); // Add this line
      }, err => {
        this.isLoading = false;
        this._cd.markForCheck(); // Add this line
      });
    }
  }
  

  validateInputsNewClient() {
    const nameValid = this.newClientName.trim().length > 0;
    const surnameValid = this.newClientSurname.trim().length > 0;
    const phoneValid = !this.newClientPhone || this.validatePhone(this.newClientPhone); // phone is optional but must be valid if filled
    const emailValid = !this.newClientEmail || this.validateEmail(this.newClientEmail); // email is optional but must be valid if filled

    this.isInputValid = nameValid && surnameValid && phoneValid && emailValid;
}

// Helper function to validate email format
validateEmail(email:any) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}



  validatePhone(phone: string): boolean {
    const phonePattern = /^\+30\s69\d{1}\s\d{3}\s\d{4}$/;
    return phonePattern.test(phone);
  }


  addNewClient() {
    this.newClientName = ""
    this.newClientPhone = ""
    this.newClientSurname = ""
    this.isAddingNewClient = true;
  }
  formatDate(date: string) {
    return moment(date).locale("el").format('Do MMM, h:mm a')
  }

  goBackPop() {
    this.isAddingNewClient = false;
  }

  createClient() {
    if (this.isInputValid) {
      // Handle new client creation here
      this.selectedClient = `${this.newClientName} ${this.newClientSurname}`;
      this.selectedClientPhone = this.newClientPhone;
      this.userService.newManualClient(this.newClientName, this.newClientSurname, this.selectedClientPhone,this.newClientEmail).subscribe(data => {
        this.selectedClientId = data.clientId
        this.selectedClientImage = data.profileImage
        this.userService.presentToast("Ο νέος πελάτης καταχωρήθηκε!", "success")
        this.clientModal.dismiss();
        this.isAddingNewClient = false;
        this.saveButtonEnabled = true
        this._cd.markForCheck(); // Add this line
      },err => {
        // Extract the error code from the back-end response
        const errorMessage = err.error.error;
    
        // Handle specific error messages
        switch (errorMessage) {
            case 'invalid_name':
                this.userService.presentToast("Το όνομα δεν είναι έγκυρο.", "danger");
                break;
            case 'invalid_surname':
                this.userService.presentToast("Το επώνυμο δεν είναι έγκυρο.", "danger");
                break;
            case 'invalid_phone':
                this.userService.presentToast("Ο αριθμός τηλεφώνου δεν είναι έγκυρος.", "danger");
                break;
            case 'invalid_email':
                this.userService.presentToast("Η διεύθυνση email δεν είναι έγκυρη.", "danger");
                break;
          
            default:
                this.userService.presentToast("Κάτι πήγε στραβά.", "danger");
        }
        this._cd.markForCheck();
    });
    
  }
 
}

  selectClient(suggestion: any) {
    this.selectedClient = suggestion.name;
    this.selectedClientPhone = suggestion.phone;
    this.selectedClientId = suggestion.id
    this.selectedClientImage = suggestion.image
    this.saveButtonEnabled = true
    this.clientModal.dismiss();
  }




  resetFields() {

    this.dateSelected = false;
    this.timeSelected = false;
    this.selectedClient = undefined;
    this.selectedClientPhone = undefined;
    // Reset other fields as needed
  }




  slotSelected(item: any) {
    this.timeSelected = true;
    if (this.timeSlotSelected != null) {
      this.timeSlotSelected.selected = false;
    }
    this.timeSlotSelected = item;
    item.selected = true;
    if (!this.editing) {
      this.scrollToBottomSetTimeout(200);

    }

  }

  goBackClientPop() {
    this.clientModal.dismiss();
  }

  saveKrathsh() {
    this.saveButtonEnabled = false;

    this.userService.saveAppointment(this.servicesEmployees, moment(this.theDate).format('YYYY-MM-DD'), this.timeSlotSelected.value, this.selectedClientId, this.appointmentId).subscribe(data => {
      this.userService.presentToast("Το ραντεβού αποθηκεύτηκε με επιτυχία.", "success")
      this.modalController.dismiss(true)
      this.saveButtonEnabled = true

    }, err => {
      this.saveButtonEnabled = true


      if (err.error == "Slot taken") {
        this.userService.presentToast("Η συγκεκριμένη χρονική περιόδος δεν είναι πλέον διαθέσιμη.", "danger")
      } else {
        this.userService.presentToast("Η συγκεκριμένη χρονική περιόδος δεν είναι πλέον διαθέσιμη.", "danger")
      }
    })
  }
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {


    // Reorder the selectedServicesAndPackages array
    const itemToMove = this.selectedServicesAndPackages.splice(ev.detail.from, 1)[0];
    this.selectedServicesAndPackages.splice(ev.detail.to, 0, itemToMove);


    this.processSelectedServices(this.selectedServicesAndPackages)
    this.updateServiceEmployees()


    if (this.theDate != undefined) {
      this.dateChanged()
    } else {

    }

    ev.detail.complete();
  }


  updateServiceEmployees() {
    this.servicesEmployees = [];
    this.selectedServices.forEach((service, index) => {
      // Determine the appropriate id to use based on whether chosenVariation is not null
      const idToUse = service.chosenVariation ? service.chosenVariation.id : service.id;

      // Initialize the serviceEmployee entry with the determined id
      let serviceEmployeeEntry: ServiceEmployee = { yphresiaId: idToUse, employeeId: service.selectedEmployeeId };

      // Add packageId to the entry if it exists
      if (service.packageId) {
        serviceEmployeeEntry.packageId = service.packageId;
      }

      // Push the constructed entry to the servicesEmployees array
      this.servicesEmployees.push(serviceEmployeeEntry);
    });
  }



  async chooseServices() {
    const modal = await this.modalController.create({
      component: AddServicesPage,
      componentProps: {
        'selectedServicesAndPackages': this.selectedServicesAndPackages
      }
    });

    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {


      if (this.editing) {
        this.dateChanged();
      }
      this._cd.detectChanges();
      this.processSelectedServices(data);
    }
  }

  processSelectedServices(data: any) {
    // Store the previous selectedServices in a temporary variable
    const previousSelectedServices = this.selectedServices ? [...this.selectedServices] : [];

    this.selectedServicesAndPackages = data;

    this.selectedServices = data.reduce((acc: any[], item: { serviceObjects: any[]; id: any; name: any; }) => {
      if (item.serviceObjects && Array.isArray(item.serviceObjects)) {
        acc.push(...item.serviceObjects.map((service: any) => {
          // Find the matching service in the previous selectedServices
          const previousService = previousSelectedServices.find(prev => prev.id === service.id);

          return {
            ...service,
            // Copy the selectedEmployeeId from the previous service, if it exists
            selectedEmployeeId: previousService?.selectedEmployeeId ?? null,
            packageId: item.id,
            packageName: item.name
          };
        }));
      } else {
        // For services not in serviceObjects, retain them as they are
        acc.push(item);
      }
      return acc;
    }, []);






    this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);


    if (this.editing && this.canSelectDate) {
      this.dateSelected = true;
    } else {
      this.resetDateAndTimeSelection();
    }

    this.fetchEmployeeData();
  }

  resetDateAndTimeSelection() {
    this.dateSelected = false;
    this.time_slots = [];
    this.timeSelected = false;
    this.timeSlotSelected = null;
    this.dataChanged = true;
  }

  fetchEmployeeData() {
    let serviceIds = this.selectedServices.map(service => service.id).join(',');
    this.userService.getEmployeesOfServices(serviceIds).subscribe(response => {
      for (let service of this.selectedServices) {
        let matchingServiceResponse = response.find((res: { serviceId: any; }) => res.serviceId === service.id);
        service.employees = matchingServiceResponse ? matchingServiceResponse.employees : [];
      }
  
      if (this.selectedServices && this.selectedServices.length > 0) {
        this.currentService = this.selectedServices[0];
        this.scrollToBottomSetTimeout(150);
      }
      this._cd.markForCheck(); // Add this line
  
    }, err => {
      if (err.error == "Service doesn't exist") {
        this.selectedServices = [];
        this._cd.markForCheck(); // Add this line
      }
    });
  }


  toggleSelectService(service: any) {



    service.isSelected = !service.isSelected; // Toggle the isSelected property

    // Check if the service is a package
    if (service.type === "package") {
      // Remove services with matching packageId from selectedServices
      this.selectedServices = this.selectedServices.filter((s: any) => s.packageId !== service.id);

      // Remove the package from selectedServicesAndPackages if it's already selected
      if (this.selectedServicesAndPackages.includes(service)) {
        this.selectedServicesAndPackages = this.selectedServicesAndPackages.filter((s: any) => s !== service);
      }
    } else {
      // For non-package services, remove only the first occurrence without a packageId
      const index = this.selectedServices.findIndex((s: any) => s.id === service.id && (s.packageId === null || s.packageId === undefined));
      if (index !== -1) {
        this.selectedServices.splice(index, 1);
      }

      if (this.selectedServicesAndPackages.includes(service)) {
        this.selectedServicesAndPackages = this.selectedServicesAndPackages.filter((s: any) => s !== service);
      }
    }

    this.resetView();
  }




  resetView() {
    this.dateSelected = false
    this.time_slots = [];
    this.timeSelected = false;
    this.timeSlotSelected = null;
    this.dataChanged = true;

    this.theDate = undefined;
    if (this.selectedServices.length != 0) {
      this.canSelectDate = this.selectedServices.every((s: { selectedEmployeeId: any; }) => s.selectedEmployeeId);
    } else {
      this.canSelectDate = false
    }
  }

  filterTimeSlots() {
    if (this.toggleValue === 'all') {

      this.filteredTimeSlots = [...this.time_slots];


    } else {
      this.filteredTimeSlots = this.time_slots.filter((slot: { value: string; }) => this.isInPeriod(slot.value, this.toggleValue));
    }
  }

  isInPeriod(value: string, period: string): boolean {
    const hour = this.getHour(value);
    switch (period) {
      case 'morning':
        return hour >= 6 && hour < 12;
      case 'afternoon':
        return hour >= 12 && hour < 15;
      case 'evening':
        return hour >= 15 && hour < 18;
      case 'night':
        return hour >= 18 || hour < 6;
      default:
        return false;
    }
  }

  getHour(time: string): number {
    return parseInt(time.split(':')[0], 10);
  }

  async goToNextAvailable() {
    const temp_date = moment(this.theDate).format('YYYY-MM-DD');

    try {
      const response = await lastValueFrom(this.userService.getNextAvailableDay(temp_date, this.servicesEmployees, this.appointmentId));

      if (response && response.nextAvailableDate) {
        this.theDate = response.nextAvailableDate;

        const timeSlotsResponse = await lastValueFrom(this.userService.getAvailableTimeBooking(response.nextAvailableDate, this.servicesEmployees, this.appointmentId));

        if (timeSlotsResponse && timeSlotsResponse.length > 0) {
          this.time_slots = timeSlotsResponse.map((slot: { outerTimePeriod: { start: string | any[]; }; }) => ({
            value: slot.outerTimePeriod.start.slice(0, 5),
            selected: false
          }));
          this.filteredTimeSlots = [...this.time_slots];
          this.dateSelected = true;
          this.timeSelected = false;
          this.timeSlotSelected = null;
        } else {
          this.userService.presentToast("Δεν βρέθηκαν διαθέσιμες ώρες για την επιλεγμένη ημέρα.", "danger");
        }
      } else {
        this.userService.presentToast("Δεν βρέθηκαν διαθέσιμες ημέρες εντός 6 μηνών.", "danger");
      }
      this._cd.markForCheck(); // Add this line

    } catch (error) {
      console.error('Error fetching available time slots', error);
      this.userService.presentToast("Προέκυψε σφάλμα κατά την εύρεση διαθέσιμων ημερών.", "danger");
    }
  }



}
interface ServiceEmployee {
  yphresiaId: any;  // You can replace 'any' with more specific types if known
  employeeId: any;
  packageId?: any;  // '?' makes this property optional
}
