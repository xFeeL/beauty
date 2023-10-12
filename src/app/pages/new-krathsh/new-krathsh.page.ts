import { Component, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { IonContent, IonModal, IonPopover, ModalController } from '@ionic/angular';
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
  theDate!: string;
  dayValues!: string;
  minDate: string;
  previous!: any;
  month!: any;
  year!: any;
  time_slots: any;
  months = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
  dateSelected: boolean = false;
  timeSelected: boolean = false;
  selected!: any;
  splitChoices: any;
  peopleSelected: boolean = false;
  animationState: 'in' | 'out' = 'in'; // Add this line
  currentService: any = null;
  selectedClientId: any = "";
  selectedClientImage: any = "";
  servicesEmployees: any;

  canSelectDate: boolean = false;
  availableDays: any;
  allEmployeeIds: string="";

  
  constructor( private modalController: ModalController, private userService: UserService) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.animationState = 'in';
  }
  @ViewChild(IonContent, { static: false }) content2!: IonContent;

  @ViewChild('clientModal') clientModal!: IonModal;
  selectedServices:Array<any> = new Array<any>;



 
  ngOnInit() {
    
}


  ionViewWillEnter() {
   
  }
  goBack() {
    this.modalController.dismiss(false)
  }

  save() {

  }


  selectEmployee(service: any, employeeId: string) {
    service.selectedEmployeeId = employeeId;

    // Find the index of the current service
    const currentIndex = this.selectedServices.indexOf(service);

    // Check if there's a next service to open and it's not the last one
    if (currentIndex < this.selectedServices.length - 1) {
        this.currentService = this.selectedServices[currentIndex + 1];
    } else {
        // Extract employeeIds from all selected services
        this.allEmployeeIds = this.selectedServices.map(s => s.selectedEmployeeId).join(',');
        this.onMonthChange();

        
    }

    // Check if all services have a selection
    this.canSelectDate = this.selectedServices.every(s => s.selectedEmployeeId);
}



  presentClientPop() {
    this.clientModal.present()
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
                      console.log("Available days");
                      console.log(that.dayValues);
                      this.scrollToBottomSetTimeout(150);
                  }, err => {
                      console.log(err);
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
  }

  dateChanged() {
    this.time_slots = [];

    const temp_date = moment(this.theDate).format('YYYY-MM-DD');
    this.dateSelected = true;
   
    this.scrollToBottomSetTimeout(150);


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
      console.log(data)
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
    if (this.selected != null) {
      this.selected.selected = false;
    }
    this.selected = item;
    item.selected = true;
    this.scrollToBottomSetTimeout(200);

  }

  goBackClientPop() {
    this.clientModal.dismiss();
  }








  saveKrathsh() {
    this.saveButtonEnabled = false;
    let selectedTimeSlot;
    

    this.userService.newAppointment(1, moment(this.theDate).format('YYYY-MM-DD'), "", "", this.selectedClientId,[""]).subscribe(data => {
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
    console.log("Opening")
    console.log(this.selectedServices)

    const modal = await this.modalController.create({
        component: AddServicesPage,
        componentProps: {
          'selectedServices': this.selectedServices
        }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
        // Now, the data variable contains the selected services
        this.selectedServices = data;

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
              
              this.scrollToBottomSetTimeout(150)

            }
            console.log(this.selectedServices);
        }, err => {
            console.log(err);
        });
    }
}


toggleSelectService(service: any) {
  service.isSelected = !service.isSelected; // Toggle the isSelected property

  if (this.selectedServices.includes(service)) {
    this.selectedServices = this.selectedServices.filter((s: any) => s !== service);
  }
}

}
