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



async deleteEmployee(employee: any) {
  const confirmAlert = await this.alertController.create({
    header: 'Διαγραφή ατόμου',
    message: 'Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το άτομο από την ομάδα σας;',
    buttons: [
      {
        text: 'Ακυρο',
        role: 'cancel',
        cssClass: 'secondary'
      }, {
        text: 'Επιβεβαιωση',
        handler: () => {
          this.userService.deleteEmployee(employee.id, false, false).subscribe(
            data => {
              this.userService.presentToast("Το άτομο διαγράφηκε επιτυχώς.", "success");
              this.goToTeam();
            },
            async err => {
              if (err.status === 409) { // Conflict status code
                const conflictAlert = await this.alertController.create({
                  header: 'pendingς κρατήσεις',
                  message: 'Το άτομο έχει μη ολοκληρωμένες κρατήσεις. Επιλέξτε ενέργεια:',
                  buttons: [
                    {
                      text: 'Πισω',
                      handler: () => {
                      }
                    },
                    {
                      text: 'Ακυρωση ολων',
                      handler: () => {
                        this.userService.deleteEmployee(employee.id, true, true).subscribe(
                          successData => {
                            this.userService.presentToast("Το άτομο διαγράφηκε επιτυχώς.", "success");
                            this.goToTeam();
                          },
                          errorData => {
                            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
                          }
                        );
                      }
                    },
                    {
                      text: 'Χωρις ακυρωση',
                      handler: () => {
                        this.userService.deleteEmployee(employee.id, true, false).subscribe(
                          successData => {
                            this.userService.presentToast("Το άτομο διαγράφηκε επιτυχώς.", "success");
                            this.goToTeam();
                          },
                          errorData => {
                            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
                          }
                        );
                      }
                    }
                  ]
                });
                await conflictAlert.present();
              } else {
                this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
              }
            }
          );
        }
      }
    ]
  });

  await confirmAlert.present();
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
      personId: person.id,
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
    if (data.edited) {
      this.goToTeam();

    }
  }

  isScheduleDefault(personschedule: any[]) {
    console.log("PERSON SCHEDULE");
    console.log(personschedule);
    console.log("DAYS");
    console.log(this.days);
  
    const personScheduleMap = new Map(personschedule.map(day => [day.day, day]));
  
    const openDefaultDays = this.days.filter(day => day.open);
  
    for (let defaultDay of openDefaultDays) {
      const personDay = personScheduleMap.get(defaultDay.name) as any; // Type assertion
  
      if (!personDay) {
        return false;
      }
  
      let defaultIntervals = defaultDay.timeIntervals.map(interval => interval.start + '-' + interval.end);
      defaultIntervals.sort();
  
      // Type assertion for personDay.intervals
      const personIntervals = personDay.intervals as string[]; 
  
      if (!personIntervals || defaultIntervals.length !== personIntervals.length) {
        return false;
      }
  
      personIntervals.sort();
      for (let i = 0; i < defaultIntervals.length; i++) {
        if (defaultIntervals[i] !== personIntervals[i]) {
          return false;
        }
      }
    }
  
    for (let personDay of personschedule) {
      const personDayEntry = personDay as any; // Type assertion
  
      if (!this.days.find(defaultDay => defaultDay.name === personDayEntry.day && defaultDay.open)) {
        return false;
      }
    }
  
    return true;
  }
  
  
  


  goToServices() {
    this.initialized = false;
    this.packages=[]
    this.serviceCategories=[]
    this.services=[]
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
              this.userService.saveServiceCategory(newCategory).subscribe(response => {
                this.serviceCategories.push(newCategory);
                this.userService.presentToast("Η κατηγορία προστέθηκε επιτυχώς.", "success");
                this.goToServices();
              }, err => {
                this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
              })
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
        
            console.log("THE CATEGORY");
            console.log(categoryToUpdate);
        
            // Use a Promise to handle the asynchronous operation
            return new Promise((resolve, reject) => {
                this.userService.saveServiceCategory(categoryToUpdate).subscribe(response => {
                    // Update the serviceCategory for services
                    this.services.forEach(service => {
                        if (service.serviceCategoryName === currentCategory) {
                            service.serviceCategoryName = data.categoryName;
                        }
                    });
                    this.userService.presentToast("Η κατηγορία ενημερώθηκε επιτυχώς.", "success");
                    resolve(true);
                }, err => {
                    reject(false);
                });
            });
        }
        
        }
      ]
    });

    await alert.present();
  }



  async addService() {
    const transformedPeople = this.people.map((person: any) => ({
      id: person.id,
      name: person.name,
      surname: person.surname,
    }));

    const modal = await this.showNewServiceModal(transformedPeople, this.serviceCategories);

    const { data } = await modal.onDidDismiss();

    if (data.edited) {
      this.goToServices()
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




  getServicesForCategory(categoryName: string): any[] {
    return this.services.filter(service => service.serviceCategoryName === categoryName);
  }

  async deleteCategory(category: any) {
    // Check if there are any services associated with this category
    const servicesWithCategory = this.services.filter(r => r.serviceCategoryName === category.name);

    if (servicesWithCategory.length > 0) {
        // If there are services associated with the category, show a toast message
        this.userService.presentToast('Αυτή η κατηγορία δεν μπορεί να διαγραφεί επειδή έχει συσχετισμένες υπηρεσίες. Διαγράψτε τις υπηρεσίες ή αντιστοιχίστε τις σε άλλη κατηγορία πρώτα.', 'warning');
    } else {
        // If no services are associated with the category, just delete the category
        if(category.id!=null || category.id!=undefined){
          this.userService.deleteServiceCategory(category.id).subscribe(response => {
            this.serviceCategories = this.serviceCategories.filter((r: any) => r !== category);
            this.userService.presentToast("Η κατηγορία διαγράφηκε επιτυχώς.", "success");
          }, err => {
            this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ δοκιμάστε ξανά.", "danger");
          });
        }else{
          this.serviceCategories = this.serviceCategories.filter((r: any) => r !== category);
          this.userService.presentToast("Η κατηγορία διαγράφηκε επιτυχώς.", "success");

        }
       
    }
}


  async editService(service: any) {
    const modalData = this.prepareDataForModal(service);
    const modal = await this.createServiceModal(service, modalData);
    await modal.present();
    const { data } = await modal.onDidDismiss();
    this.handleModalDismiss(data, service);
  }

  prepareDataForModal(service: any) {
  
    const transformedPeople = this.people.map((person: any) => ({
      id: person.id,
      name: person.name,
      surname: person.surname,
      selected: person.selected
    }));
    const category = this.serviceCategories.find(category => category.name === service.serviceCategoryName);
    const categoryName = category ? category.name : undefined;
    const concatenatedNames = service.people.map((person: any) => `${person.name} ${person.surname}`);
    return { transformedPeople, categoryName, concatenatedNames };
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
        categories: this.serviceCategories,
        serviceCategory: modalData.categoryName,  // Accessing categoryName from modalData here
        services: this.services,
        serviceId: service.id
      }
    });
  }


  handleModalDismiss(data: any, service: any) {
    if (data.edited) {
      this.goToServices();
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

  /*saveTeam() {
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
  }*/


  async newPackage() {
    const modal = await this.modalController.create({
      component: NewPackagePage,
      componentProps: { services: this.services }
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data && dataReturned.data.edited) {
        this.goToServices();
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
      if (dataReturned.data && dataReturned.data.edited) {
        this.goToServices();
      }
    });

    return modal.present();
  }


}

interface ScheduleDay {
  day: string;
  intervals: string[];
}