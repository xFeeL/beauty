import { Component, OnInit, ViewChild, Renderer2, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { IonContent, IonModal, IonPopover, ModalController, NavParams } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import { trigger, state, style, animate, transition, AnimationEvent } from '@angular/animations';
import { AddServicesPage } from '../add-services/add-services.page';

@Component({
  selector: 'app-new-krathsh',
  templateUrl: './new-krathsh.page.html',
  styleUrls: ['./new-krathsh.page.scss'],
  animations: [
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
  ],
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
    console.log(this.theDate)
    if (this.navParams.get("appointment_data") != undefined) {
      this.editing = true
      this.appointment_data = this.navParams.get("appointment_data")
      console.log("THE DATA")
      console.log(this.appointment_data)
      this.appointmentId = this.appointment_data.appointmentId
      this.theDate = this.appointment_data.date
      this.selectedServices = this.appointment_data.services.map((service: any) => ({
        ...service,
        isSelected: true
      }));
      let serviceIds = this.selectedServices.map((service: { id: any; }) => service.id).join(',');

      this.userService.getEmployeesOfServices(serviceIds).subscribe(response => {
        // Loop through each service in selectedServices
        for (let service of this.selectedServices) {
          // Check if the service ID exists in the response
          if (response[service.id]) {
            service.employees = response[service.id];
          } else {
            service.employees = []; // If no employees are found for the service, initialize an empty array
          }
        }
        if (this.selectedServices && this.selectedServices.length > 0) {
          this.currentService = this.selectedServices[0];


        }
        this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);
        this.allEmployeeIds = this.selectedServices.map(s => s.selectedEmployeeId).join(',');
        this.servicesEmployees = {};
        this.selectedServices.forEach(service => {
          this.servicesEmployees[service.id] = service.selectedEmployeeId;
        });
        this.onMonthChange();


      }, err => {
        if (err.error == "Service doesn't exist") {
          console.log("MPIKA")
          this.selectedServices = []
        }
      });
    }

  }
  goBack() {
    this.modalController.dismiss(false)
  }



  selectEmployee(service: any, employeeId: string) {
    this.resetView();
    service.selectedEmployeeId = employeeId;

    // Find the index of the current service
    const currentIndex = this.selectedServices.indexOf(service);

    // Check if there's a next service to open and it's not the last one
    if (currentIndex < this.selectedServices.length - 1) {
      this.currentService = this.selectedServices[currentIndex + 1];
    } else {
      // Extract employeeIds from all selected services
      this.allEmployeeIds = this.selectedServices.map(s => s.selectedEmployeeId).join(',');
      // Construct servicesEmployeesMap from this.selectedServices
      this.servicesEmployees= [];

      this.selectedServices.forEach((service, index) => {
        this.servicesEmployees.push({ yphresiaId: service.id, employeeId: service.selectedEmployeeId });
      });


      console.log("THE SERVICES EMPLOYEES")
      console.log(this.servicesEmployees)
      this.onMonthChange();

    }

    // Check if all services have a selection
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
    }, 0);
    if (this.editing && !this.dataChanged) {
      this.dateChanged();
    }
  }

  calculateTotalDuration(service: any): number {
    return service.serviceObjects.reduce((total: number, obj: { duration: number }) => total + obj.duration, 0);
  }



  dateChanged() {
    this.time_slots = [];

    const temp_date = moment(this.theDate).format('YYYY-MM-DD');

    this.userService.getAvailableTimeBooking(temp_date, this.servicesEmployees).subscribe(response => {

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
        console.log("MPAASDASDASDASD")
        // Convert the time format from "03:30 μ.μ. - 03:53 μ.μ." to "15:30"
        let convertedTime = this.convertTimeFormatForEdit(this.appointment_data.time.split('-')[0].trim());

        // Find the slot from the time_slots array that matches the converted time
        let foundSlot = this.time_slots.find((slot: { value: string; }) => slot.value === convertedTime);
        console.log(convertedTime)
        console.log(this.appointment_data.time)
        this.saveButtonEnabled = true
        // If the slot is found, call slotSelected on it
        if (foundSlot) {
          console.log("Found slot")
          this.slotSelected(foundSlot);
        } else {
          console.log("Not Found slot")

          // If the slot is not found, add it to the time_slots array and select it
          let newSlot = {
            value: convertedTime,
            selected: true
          };
          this.time_slots.push(newSlot);
          this.timeSlotSelected = newSlot; // Setting the new slot as the selected slot

          // Sort the time_slots array to maintain order
        }
        console.log("Timne slots before sorting")
        console.log(this.time_slots)
        this.time_slots.sort((a: { value: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any; }; }; }; }, b: { value: { split: (arg0: string) => { (): any; new(): any; map: { (arg0: NumberConstructor): [any, any]; new(): any; }; }; }; }) => {
          let [hourA, minuteA] = a.value.split(':').map(Number);
          let [hourB, minuteB] = b.value.split(':').map(Number);
          if (hourA !== hourB) return hourA - hourB;
          return minuteA - minuteB;
        });
        console.log("Timne slots after sorting")
        console.log(this.time_slots)

      }
      else {
        this.scrollToBottomSetTimeout(150);
        this.timeSelected = false;
        this.timeSlotSelected = null;

      }
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
        this.suggestionsNames = data
        this.isLoading = false;
      }, err => {
        this.isLoading = false;
      })
    }

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
    // Handle new client creation here
    this.selectedClient = `${this.newClientName} ${this.newClientSurname}`;
    this.selectedClientPhone = this.newClientPhone;
    this.userService.newManualClient(this.newClientName, this.newClientSurname, this.selectedClientPhone).subscribe(data => {
      this.selectedClientId = data.clientId
      this.selectedClientImage = data.profileImage
      this.userService.presentToast("Ο νέος πελάτης καταχωρήθηκε!", "success")
      this.clientModal.dismiss();
      this.isAddingNewClient = false;
      this.saveButtonEnabled = true
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

    })
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

      console.log(err)
      if (err.error == "Slot taken") {
        this.userService.presentToast("Η συγκεκριμένη χρονική περιόδος δεν είναι πλέον διαθέσιμη.", "danger")
      } else {
        this.userService.presentToast("Η συγκεκριμένη χρονική περιόδος δεν είναι πλέον διαθέσιμη.", "danger")
      }
    })
  }

  async chooseServices() {


    const modal = await this.modalController.create({
      component: AddServicesPage,
      componentProps: {
        'selectedServices': this.selectedServices
      }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.selectedServicesAndPackages = data;

      this.selectedServices = data.reduce((acc: any[], item: { serviceObjects: any[]; id: any; name: string; }) => {
        if (item.serviceObjects && Array.isArray(item.serviceObjects)) {
          // For items with a 'serviceObjects' property, add each service object to the accumulator
          acc.push(...item.serviceObjects.map((service: any) => ({
            ...service,
            packageId: item.id,
            packageName: item.name // Add packageName property
          })));
        } else {
          // For items without a 'serviceObjects' property, add the item itself
          acc.push(item);
        }
        return acc;
      }, []);

    }
    console.log("HERE")
    console.log(this.selectedServices)
    console.log(this.selectedServicesAndPackages)
    this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);
    console.log("Can select date: " + this.canSelectDate)
    console.log(this.canSelectDate)
    if (this.editing && this.canSelectDate) {
      this.dateSelected = true

    } else {
      this.dateSelected = false
      this.time_slots = [];
      this.timeSelected = false;
      this.timeSlotSelected = null;
      this.dataChanged = true;
      this.theDate = undefined;
    }
    let serviceIds = this.selectedServices.map((service: { id: any; }) => service.id).join(',');

    this.userService.getEmployeesOfServices(serviceIds).subscribe(response => {
      console.log("MPIKA EDW");

      // Loop through each service in selectedServices
      for (let service of this.selectedServices) {
        // Find the response object that matches the current service ID
        let matchingServiceResponse = response.find((res: { serviceId: any; }) => res.serviceId === service.id);

        // If a matching response object is found, use its employees, else set to an empty array
        service.employees = matchingServiceResponse ? matchingServiceResponse.employees : [];
      }

      if (this.selectedServices && this.selectedServices.length > 0) {
        this.currentService = this.selectedServices[0];

        this.scrollToBottomSetTimeout(150);
      }

    }, err => {
      console.log("THE ERROR")
      console.log(err)
      if (err.error == "Service doesn't exist") {
        console.log("MPIKA")
        this.selectedServices = []
      }
    });
  }



  toggleSelectService(service: any) {
    service.isSelected = !service.isSelected; // Toggle the isSelected property

    if (this.selectedServices.includes(service)) {
      this.selectedServices = this.selectedServices.filter((s: any) => s !== service);
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



}
