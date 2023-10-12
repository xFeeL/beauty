import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Observable, Subject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-services',
  templateUrl: './add-services.page.html',
  styleUrls: ['./add-services.page.scss'],
})
export class AddServicesPage implements OnInit {
searchTerm = '';
categoryServiceSegment="all"

isSearching: boolean = false;
filteredServices: any[] = [];
selectedServices :any= [];
  serviceCategories: any;
services: Array<any> = new Array<any>;

initialized=false;

  constructor(private userService:UserService,private modalController:ModalController,private navParams:NavParams) { }

  ngOnInit(): void {
    
  }
  ionViewWillEnter() {
   
    this.initialized = false;
    this.selectedServices = []; // Default initialization
  
    // Get selectedServices from navParams and assign it only if it exists
    const servicesFromNav = this.navParams.get('selectedServices');
    if (servicesFromNav) {
      this.selectedServices = servicesFromNav;
    }
    console.log("Opened with")
    console.log(this.selectedServices)
    this.userService.getServiceCategories().subscribe(data => {
      this.serviceCategories = data;
      this.getServices("all");
      this.initialized = true;

    
    }, err => {
      // Handle error here (e.g., show an error message or log it)
    });
  }
  

  getServices(category: any): Observable<void> {
    // Create a Subject to notify completion
    const completionSubject = new Subject<void>();
  
    this.services = [];
    let categoryToSend;
    if(category=="all"){
      categoryToSend="all"
    }else{
      categoryToSend=category.id
      this.categoryServiceSegment=category.name
    }
    this.userService.getServices(categoryToSend).subscribe(data => {
        this.services = data
            // Filter out services that are already in selectedServices
            .filter((service: any) => !this.selectedServices.some((selectedService: { id: any; }) => selectedService.id === service.id))
            // Map over the filtered services to set isSelected property to false
            .map((service: any) => ({
                ...service,
                isSelected: false
            }));

        // Notify that we're done
        completionSubject.next();
        completionSubject.complete();
    }, err => {
        // Handle the error (optional: you might also want to notify the caller of the error)
        completionSubject.error(err);
    });

    // Return the observable
    return completionSubject.asObservable();
}
  

  goBack(){
    this.modalController.dismiss()
  }

  onSearch(event: any) {
    if (this.categoryServiceSegment != "all") {
        this.categoryServiceSegment = "all";
        this.getServices("all").subscribe(() => {  // Assuming getServices returns an Observable
            this.performSearch(event.target.value.toLowerCase());
        });
    } else {
        this.performSearch(event.target.value.toLowerCase());
    }
}

performSearch(searchTerm: string) {
    if (searchTerm && searchTerm.trim() !== '') {
        this.isSearching = true;
        this.filteredServices = this.services.filter(service => {
            return service.name.toLowerCase().includes(searchTerm);
        });
    } else {
        this.isSearching = false;
        this.filteredServices = this.services;
    }
}

  

  
  toggleSelectService(service: any) {
    service.isSelected = !service.isSelected; // Toggle the isSelected property

    if (this.services.includes(service) || this.filteredServices.includes(service)) {
        // Remove from services and filteredServices, then add to selectedServices
        this.services = this.services.filter(s => s !== service);
        this.filteredServices = this.filteredServices.filter(s => s !== service);
        this.selectedServices.push(service);
    } else if (this.selectedServices.includes(service)) {
        // Remove from selectedServices
        this.selectedServices = this.selectedServices.filter((s: any) => s !== service);
        
        // Add back to services only if the category matches this.categoryServiceSegment
        if (service.serviceCategory === this.categoryServiceSegment || this.categoryServiceSegment=="all") {
            this.services.push(service);
        }

        // If searching is active, push the service back to filteredServices as well
        if (this.isSearching) {
            this.filteredServices.push(service);
        }
    }
}

  

saveServices(){
  this.modalController.dismiss(this.selectedServices)
}

}
