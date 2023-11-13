import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { NewServicePage } from '../new-service/new-service.page';
import { UserService } from 'src/app/services/user.service';
import { AddPersonPage } from '../add-person/add-person.page';
import { NewPackagePage } from '../new-package/new-package.page';

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
  reloadAppointments: any = false;
  packages: any = [];

  constructor(private modalController: ModalController, private alertController: AlertController, private userService: UserService, private _cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.goToTeam();

  }



  deleteEmployee(employee: any) {
    this.team = this.team.filter(r => r !== employee);
  }


  addBase64Prefix(image: string) {
    if (image && !image.startsWith("data:")) {
      return "data:image/png;base64," + image;
    }
    return image;
  }


  async managePerson(person?: any) {
    const isEditing = !!person; // if 'person' is provided, we are in editing mode

    const defaultComponentProps = {
      data: this.days,
      onboarding: false,
      isEditing: false
    };

    const editingComponentProps = isEditing ? {
      personSchedule: person.schedule,
      personName: person.name,
      personSurName: person.surname,
      image: this.addBase64Prefix(person.image),
      toggled: !this.isScheduleDefault(person.schedule),
      scheduleExceptions: person.exceptions,
      isEditing: true
    } : {};

    const modal = await this.modalController.create({
      component: AddPersonPage,
      componentProps: { ...defaultComponentProps, ...editingComponentProps }
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      const processedPerson = {
        id: person.id,
        name: data.personName,
        surname: data.personSurName,
        image: data.image.split(",")[1],
        exceptions: data.scheduleExceptions,
        schedule: data.days.filter((day: { open: any; }) => day.open).map((day: { name: any; timeIntervals: any[]; }) => {
          const mappedDay = day.name;
          return {
            day: mappedDay,
            intervals: day.timeIntervals.map(interval => `${interval.start}-${interval.end}`),
          }
        }),
      };

      if (isEditing) {
        let peopleIndex = this.team.findIndex(r => r.name === person.name);
        if (peopleIndex !== -1) {
          this.team[peopleIndex] = processedPerson;
        }

      } else {
        this.team.push(processedPerson);

      }

    }
  }

  isScheduleDefault(personschedule: any[]): boolean {

    // Return false if personschedule is empty or its length differs from this.days
    if (!personschedule.length || this.days.length !== personschedule.length) {
      return false;
    }

    // Loop through each day in the default schedule
    for (let defaultDay of this.days) {
      let personDay = personschedule.find(day => day.day === defaultDay.name);

      // If the default day is open but isn't present in personschedule, return false
      if (defaultDay.open && !personDay) {
        return false;
      }

      // If the day is not open in the default schedule and also not present in personschedule, continue to the next day
      if (!defaultDay.open && !personDay) {
        continue;
      }

      // Compare time intervals if the day is open
      if (defaultDay.open) {
        let defaultIntervals = defaultDay.timeIntervals.map(interval => interval.start + '-' + interval.end);

        // If the number of time intervals differs, return false
        if (defaultIntervals.length !== personDay.intervals.length) {
          return false;
        }

        // Sort and compare each time interval
        defaultIntervals.sort();
        personDay.intervals.sort();
        for (let i = 0; i < defaultIntervals.length; i++) {
          if (defaultIntervals[i] !== personDay.intervals[i]) {
            return false;
          }
        }
      }
    }

    return true;
  }


  goToServices() {
    this.initialized = false;

    this.getEmployeesForServices();

    this.userService.getServiceCategories().subscribe(data => {
      this.serviceCategories = data;
      this.getPackages();
      this.getServices("all");
      this.initialized = true;


    }, err => {
      // Handle error here (e.g., show an error message or log it)
    });
  }

  getPackages() {
    this.packages = [];
    this.userService.getPackages().subscribe(packages => {
      this.packages = packages;
    }, err => {
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

      const serviceIds = this.services.map(service => service.id).join(',');

      this.userService.getEmployeesOfServices(serviceIds).subscribe(employeesData => {
        this.services.forEach(service => {
            // Find the corresponding object in employeesData based on serviceId
            const serviceData = employeesData.find((data: { serviceId: any; }) => data.serviceId === service.id);
            console.log('serviceData for serviceId ' + service.id + ':', serviceData);
    
            // Access the employees directly
            if (serviceData && serviceData.employees) {
                service.people = serviceData.employees.map((person: { [x: string]: any; image: any; }) => {
                    const { image, ...rest } = person;  // Destructure to separate 'image' and the rest of the properties
                    return rest;  // Return the rest of the properties, effectively omitting 'image'
                });
            } else {
                console.log('No employees data found for serviceId:', service.id);
                service.employees = [];
            }
        });
  
    
      



      }, err => {
        // Handle the error from getEmployeesOfServices
      });

    }, err => {
      // Handle the error from getServices
    });
  }


  getEmployeesForServices() {
    this.userService.getEmployeesOfExpert().subscribe(data => {
      this.people = data;

    }, err => {
    })
  }



  goToTeam() {
    this.userService.getEmployeesOfExpert().subscribe(data => {
      this.team = data;

      let employeeIds = this.team.map(employee => employee.id).join(",");

      this.userService.getEmployeeWorkingPlans(employeeIds).subscribe(workingPlans => {
        // For each employee, find their corresponding working plan and attach it
        this.team.forEach(employee => {
          let matchingPlan = workingPlans.find((plan: any) => plan.objectId === employee.id);
          if (matchingPlan) {
            employee.schedule = matchingPlan.personSchedule;
            employee.exceptions = matchingPlan.exceptions;
          }
        });

        this.initialized = true;

      }, err => {
      });

    }, err => {
      // Handle error here
    });

    this.userService.getWrario().subscribe(data => {
      const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const dayNames = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];

      this.days = daysOfWeek.map((day, index) => {
        const dayData = data[day];
        return {
          name: dayNames[index],
          open: dayData !== null,
          timeIntervals: dayData ? dayData.workingHours.map((hour: { start: string | any[]; end: string | any[]; }) => ({
            start: hour.start.slice(0, 5),  // Convert to 'HH:mm' format
            end: hour.end.slice(0, 5)  // Convert to 'HH:mm' format
          })) : []
        };
      });

    }, err => {
    });

  }


  goBack() {
    this.modalController.dismiss(this.reloadAppointments)
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
            if (this.categoryExists(data.categoryName)) {
              // Present a toast to the user
              this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.", "danger");
              return false;
            } else {
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
          text: 'Ενημερωση',
          handler: (data: { categoryName: any; }) => {

            // Check if the new category name already exists, but not counting the currentCategory being edited
            const categoryExists = this.serviceCategories.some(category => category.name === data.categoryName);
            if (data.categoryName !== currentCategory && categoryExists) {
              this.userService.presentToast("Αυτή η κατηγορία υπάρχει ήδη.", "danger");
              return false; // Keep the alert open
            }


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
            }
          },
          {
            text: 'Διαγραφη',
            handler: () => {
              // Delete the category and its associated services
              this.serviceCategories = this.serviceCategories.filter((r: any) => r !== category);
              this.services = this.services.filter(r => r.serviceCategoryName !== category);
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
    console.log("THe modal data")
    console.log(modalData)
    const modal = await this.createServiceModal(service, modalData);
    await modal.present();

    const { data } = await modal.onDidDismiss();
    console.log("Service dismissed with data: ", data)
    this.handleModalDismiss(data, service);
    this._cd.detectChanges();
  }

  prepareDataForModal(service: any) {
    console.log("Preparing data for modal")
    console.log()
    const transformedPeople = this.people.map((person: any) => ({
      name: person.name,
      surname: person.surname,
      selected: person.selected
    }));

    const category = this.serviceCategories.find(category => category.name === service.serviceCategoryName);
    const categoryName = category ? category.name : undefined;

    const concatenatedNames = service.people.map((person: any) => `${person.name} ${person.surname}`);
    const categoryNames = this.serviceCategories.map((category: any) => category.name);
    console.log("Concatenated names")
    console.log(concatenatedNames)
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
      this.updatePackagesAfterServiceChange(data.deletedServiceName, null);
    } else if (data) {
      const processedService = this.processServiceData(data, service);
      this.updateService(processedService, service);
      this.updatePackagesAfterServiceChange(service.name, processedService.name);
    }
  }

  updatePackagesAfterServiceChange(oldServiceName: string, newServiceName: string | null) {
    this.packages.forEach((pkg: { services: string[]; }) => { // 'pkg' is used instead of 'package'
      const serviceIndex = pkg.services.indexOf(oldServiceName);
      if (serviceIndex !== -1) {
        if (newServiceName) {
          pkg.services[serviceIndex] = newServiceName;
        } else {
          pkg.services.splice(serviceIndex, 1);
        }
      }
    });
  }


  deleteService(deletedServiceName: string) {
    const serviceIndex = this.services.findIndex((s) => s.name === deletedServiceName);
    if (serviceIndex !== -1) {
      this.services.splice(serviceIndex, 1);
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
    if (this.selectedSegment != "team") {
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
    } else {
      if (this.team.length == 0) {
        return true;
      }
      return false;
    }
  }


  save() {
    if (this.selectedSegment == "team") {
      this.saveTeam();
    } else {
      this.saveServices();
    }
  }

  saveTeam() {
    this.userService.saveTeam(this.team, false, false, false).subscribe(data => {
      this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς.", "success");
    }, err => {
      if (err.status === 409) {
        console.log("THE ERROR");
        console.log(err.error);
        this.presentChoiceAlert(err.error);
      } else {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
      }
    });
  }

  async presentChoiceAlert(errorObj: any) {
    let message: string = "Unknown error";  // Set a default value
    let buttonText: string = "";
    let handlerFn;

    if (errorObj.deletedEmployee) {
      message = errorObj.deletedEmployee;
      buttonText = 'Ακυρωση ολων';
      handlerFn = () => {
        this.userService.saveTeam(this.team, true, true, false).subscribe(
          data => {
            this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς.", "success");
            this.reloadAppointments = true;

          },
          err => {
            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
          }
        );
      };
    } else if (errorObj.newException) {
      message = errorObj.newException;
      buttonText = 'Ακυρωση ολων';
      handlerFn = () => {
        this.userService.saveTeam(this.team, true, false, true).subscribe(
          data => {
            this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς.", "success");
            this.reloadAppointments = true;
          },
          err => {
            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
          }
        );
      };
    }

    const alert = await this.alertController.create({
      header: 'Προσοχή!',
      message: message,
      buttons: [
        {
          text: buttonText,
          handler: handlerFn
        },
        {
          text: 'Καμια Ακυρωση',
          handler: () => {
            this.userService.saveTeam(this.team, true, false, false).subscribe(
              data => {
                this.userService.presentToast("Η ομάδα αποθηκεύτηκε επιτυχώς χωρίς καμία ακύρωση.", "success");
              },
              err => {
                this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
              }
            );
          }
        },
        {
          text: 'πισω',
          role: 'cancel', // This makes it dismiss the dialog
          handler: () => {
            // Dismisses the dialog without any further action
          }
        },
      ]
    });

    await alert.present();
  }


  saveServices() {
    this.userService.saveServices(this.packages, this.services, this.serviceCategories).subscribe(data => {
      this.userService.presentToast("Οι υπηρεσίες αποθηκεύτηκαν επιτυχώς.", "success")
    }, err => {
      if (err.error == "Empty categories") {
        this.userService.presentToast("Κάποια κατηγορία δεν έχει υπηρεσίες.", "danger")
      } else {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger")

      }
    })
  }


  async newPackage() {
    const modal = await this.modalController.create({
      component: NewPackagePage,
      componentProps: { services: this.services }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data && dataReturned.data.newPackage) {
        const newPackage = dataReturned.data.newPackage;
        const nameExists = this.packages.some((p: { name: any; }) => p.name === newPackage.name);
        if (nameExists) {
          this.userService.presentToast("Υπάρχει ήδη πακέτο με αυτό το όνομα. Παρακαλώ επιλέξτε διαφορετικό όνομα.", "danger")
        } else {
          this.packages.push(newPackage);
          console.log("Package added:", newPackage);
        }
      }
    });

    return modal.present();
  }


  async editPackage(packageToEdit: any) {
    const modal = await this.modalController.create({
      component: NewPackagePage,
      componentProps: {
        package: packageToEdit,
        services: this.services
      }
    });
  
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data) {
        if (dataReturned.data.deletePackage) {
          this.packages = this.packages.filter((p: { name: any; }) => p.name !== packageToEdit.name);
          
        } else if (dataReturned.data.newPackage) {
          const editedPackage = dataReturned.data.newPackage;
          const nameExists = this.packages.some((p: { name: any; }) => p.name === editedPackage.name && p.name !== packageToEdit.name);
  
          if (nameExists) {
            this.userService.presentToast("Υπάρχει ήδη πακέτο με αυτό το όνομα. Παρακαλώ επιλέξτε διαφορετικό όνομα.", "danger");
          } else {
            const index = this.packages.findIndex((p: { name: any; }) => p.name === packageToEdit.name);
            if (index !== -1) {
              this.packages[index] = editedPackage;
            }
          }
        }
      }
    });
  
    return modal.present();
  }
  







}
