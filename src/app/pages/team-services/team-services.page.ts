import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NewServicePage } from '../new-service/new-service.page';
import { UserService } from 'src/app/services/user.service';
import { AddPersonPage } from '../add-person/add-person.page';

@Component({
  selector: 'app-team-services',
  templateUrl: './team-services.page.html',
  styleUrls: ['./team-services.page.scss'],
})
export class TeamServicesPage implements OnInit {
  selectedSegment: string = 'team';
  serviceCategories: any[] = [];
  people: any[] = [];
  services: any[] = [];
  initialized: boolean = false;
  team: any[] = [];
  days = [
    { name: 'Δευτέρα', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τρίτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τετάρτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Πέμπτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Παρασκευή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Σάββατο', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Κυριακή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] }
  ];

  constructor(private modalController: ModalController, private alertController: AlertController, private userService: UserService, private _cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
      this.goToTeam();

  }

 

  deleteEmployee(employee:any){

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


  goToServices() {
    this.initialized = false;

    this.getEmployees();

    this.userService.getServiceCategories().subscribe(data => {
      this.serviceCategories = data;
      console.log(data)
      this.getServices("all");
      this.initialized = true;


    }, err => {
      // Handle error here (e.g., show an error message or log it)
    });
  }


  getServices(category: any) {
    this.services = [];
    let categoryToSend = category === "all" ? "all" : category.id;

    this.userService.getServices(categoryToSend).subscribe(servicesData => {
      this.services = servicesData;

      this.services.forEach(service => {
        const category = this.serviceCategories.find(cat => cat.id === service.serviceCategory);
        if (category) {
            service.serviceCategoryId = service.serviceCategory;
            service.serviceCategoryName = category.name;
        }
        delete service.serviceCategory;
    });
    console.log("THe services")
    console.log(this.services)
      const serviceIds = this.services.map(service => service.id).join(',');

      this.userService.getEmployeesOfServices(serviceIds).subscribe(employeesData => {
        this.services.forEach(service => {
            const employeesForService = employeesData[service.id] || [];
            service.people = employeesForService.map((person: { image: any; }) => {
                delete person.image;
                return person;
            });
        });
  
    
       
      }, err => {
        // Handle the error from getEmployeesOfServices
      });

    }, err => {
      // Handle the error from getServices
    });
  }


  getEmployees() {
    this.userService.getEmployeesOfExpert().subscribe(data => {
      this.people = data;

    }, err => {
      console.log(err)
    })
  }



  goToTeam() {
    this.userService.getEmployeesOfExpert().subscribe(data => {
      this.team = data;
      this.initialized = true;
    }, err => {
    })
  }


  goBack() {
    this.modalController.dismiss()
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
              this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.", "danger");
              return false;
            } else {
              console.log('Category Added:', data.categoryName);
              const newCategory = {
                id: null,
                name: data.categoryName,
                expertId: null
              };
              this.serviceCategories.push(newCategory);
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
            const categoryExists = this.serviceCategories.some(category => category.name === data.categoryName);
            if (data.categoryName !== currentCategory && categoryExists) {
              this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.", "danger");
              return false; // Keep the alert open
            }

            console.log('Category Updated:', data.categoryName);

            // Find the category object to replace
            const categoryToUpdate = this.serviceCategories.find(category => category.name === currentCategory);
            if (categoryToUpdate) {
              categoryToUpdate.name = data.categoryName;
            }

            // Update the serviceCategory for services
            this.services.forEach(service => {
              if (service.serviceCategoryName === currentCategory) {
                service.serviceCategoryName = data.categoryName;
              }
            });

            console.log("The categories");
            console.log(this.serviceCategories)
            return true;
          }
        }
      ]
    });

    await alert.present();
  }



  async addService() {
    const transformedPeople = this.people.map((person: any) => ({
      name: person.name,
      surname: person.surname,
    }));

    const categoryNames = this.serviceCategories.map((category: any) => category.name);

    const modal = await this.showNewServiceModal(transformedPeople, categoryNames);

    const { data } = await modal.onDidDismiss();

    if (data) {
      this.processAndAddService(data);
      console.log("Service added:", this.services[this.services.length - 1]);
      this._cd.detectChanges();
    }
  }

  async showNewServiceModal(people: any[], categories: string[]) {
    return this.modalController.create({
      component: NewServicePage,
      componentProps: { people, categories, services: this.services }
    }).then(modal => {
      modal.present();
      return modal;
    });
  }

  processAndAddService(data: any) {
    const newService = {
      id: null,
      name: data.name,
      price: data.price,
      duration: data.duration,
      description: data.description,
      serviceCategoryName: data.selectedCategory,
      people: data.people.map((personStr: string) => {
        const [name, surname] = personStr.split(' ');
        return this.people.find((person: any) => person.name === name && person.surname === surname);
      })
    };

    this.services.push(newService);
  }


  getServicesForCategory(categoryName: string): any[] {
    return this.services.filter(service => service.serviceCategoryName === categoryName);
  }

  async deleteCategory(category: any) {
    // Check if there are any services associated with this category
    const servicesWithCategory = this.services.filter(r => r.serviceCategoryName === category.name);

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
              this.services = this.services.filter(r => r.serviceCategoryName !== category);
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
  async editService(service: any) {
    const modalData = this.prepareDataForModal(service);

    const modal = await this.createServiceModal(service, modalData);
    await modal.present();

    const { data } = await modal.onDidDismiss();

    this.handleModalDismiss(data, service);
    this._cd.detectChanges();
  }

  prepareDataForModal(service: any) {
    const transformedPeople = this.people.map((person: any) => ({
      name: person.name,
      surname: person.surname,
      selected: person.selected
    }));

    const category = this.serviceCategories.find(category => category.name === service.serviceCategoryName);
    const categoryName = category ? category.name : undefined;

    const concatenatedNames = service.people.map((person: any) => `${person.name} ${person.surname}`);
    const categoryNames = this.serviceCategories.map((category: any) => category.name);

    return { transformedPeople, categoryName, concatenatedNames, categoryNames };
  }

  async createServiceModal(service: any, modalData: any) {
    return this.modalController.create({
      component: NewServicePage,
      componentProps: {
        people: this.people,
        serviceName: service.name,
        servicePrice: service.price,
        servicePeople: modalData.concatenatedNames,
        serviceDuration: service.duration,
        serviceDescription: service.description,
        categories: modalData.categoryNames,
        serviceCategory: modalData.categoryName,  // Accessing categoryName from modalData here
        editing: true,
        services: this.services
      }
    });
  }


  handleModalDismiss(data: any, service: any) {
    if (data?.deletedServiceName) {
      this.deleteService(data.deletedServiceName);
    } else if (data) {
      const processedService = this.processServiceData(data, service);
      this.updateService(processedService, service);
      console.log("Service edited:", processedService);
    }

    console.log("Actions on service completed");
    console.log(this.services);
  }

  deleteService(deletedServiceName: string) {
    const serviceIndex = this.services.findIndex((s) => s.name === deletedServiceName);
    if (serviceIndex !== -1) {
      this.services.splice(serviceIndex, 1);
      console.log("Service deleted:", deletedServiceName);
    }
  }

  processServiceData(data: any, service: any) {
    const processedService = {
      id: service.id,
      name: data.name,
      price: data.price,
      duration: data.duration,
      description: data.description,
      people: data.people.map((personStr: string) => {
        const [name, surname] = personStr.split(' ');
        return this.people.find((person: any) => person.name === name && person.surname === surname);
      }),
      serviceCategoryName: data.selectedCategory
    };
    return processedService;
  }

  updateService(processedService: any, service: any) {
    const serviceIndex = this.services.findIndex((s) => s.name === service.name);
    if (serviceIndex !== -1) {
      this.services[serviceIndex] = processedService;
    }
  }

  getSaveButtonText(): string {
    switch (this.selectedSegment) {
      case 'team':
        return 'Αποθήκευση ομάδας';
      case 'services':
        return 'Αποθήκευση υπηρεσιών';
      default:
        return 'Αποθήκευση'; // Default text
    }
  }

  isSaveButtonDisabled(): boolean {
    console.log(this.services)
    console.log(this.serviceCategories)
    if (this.services.length == 0 || this.serviceCategories.length == 0) {
      return true;
    }
    let categoriesWithServices = new Set();
    for (let service of this.services) {
      if (typeof service.serviceCategoryName === 'string') {
        categoriesWithServices.add(service.serviceCategoryName);
      }
    }
    for (let category of this.serviceCategories) {
      if (!categoriesWithServices.has(category.id) && !categoriesWithServices.has(category.name)) {
        return true; 
      }
    }

    return false;
}


save(){
  if(this.selectedSegment=="team"){
    this.saveTeam();
  }else{
    this.saveServices();
  }
}

saveTeam(){

}

saveServices(){
  this.userService.saveServices(this.services,this.serviceCategories).subscribe(data=>{
    this.userService.presentToast("Οι υπηρεσίες αποθηκεύτηκαν επιτυχώς.","success")
  },err=>{
    this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.","danger")
  })
}

}
