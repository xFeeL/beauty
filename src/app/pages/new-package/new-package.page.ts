import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { IonSelect, ItemReorderEventDetail, ModalController, NavParams } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-new-package',
  templateUrl: './new-package.page.html',
  styleUrls: ['./new-package.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPackagePage implements OnInit {
  services: any = [];
  selectedServices: string[] = [];
  packageName: any = "";
  packageDescription: any = "";
  packagePrice: any = "";
  packageToEdit: any = [];
  editMode: boolean = false;
  packageId: any = null;
  onboarding: any = false;
  showErrors = false; // New flag to show errors

  constructor(
    private userService: UserService,
    private changeDetectorRef: ChangeDetectorRef,
    private navParams: NavParams,
    private modalController: ModalController
  ) {}

  @ViewChild('serviceSelect') serviceSelect!: IonSelect;

  ngOnInit() {}

  ionViewWillEnter() {
    this.onboarding = this.navParams.get('onboarding');
    if (this.onboarding) {
      this.services = this.navParams.get('services');
      this.services = this.services.reduce((acc: any[], service: { variations: any[]; name: any; }) => {
        if (service.variations && service.variations.length > 0) {
          const variationsAsServices = service.variations.map((variation: { name: any; }) => ({
            ...service,
            ...variation,
            name: `${service.name} (${variation.name})`,
            selected: false,
          }));
          acc.push(...variationsAsServices);
        } else {
          acc.push({
            ...service,
            selected: false
          });
        }
        return acc;
      }, []);
      this.packageToEdit = this.navParams.get('package');
      if (this.packageToEdit.name != "") {
        this.editMode = true;
        this.packageName = this.packageToEdit.name;
        this.packageId = this.packageToEdit.id;
        this.packageDescription = this.packageToEdit.description;
        this.packagePrice = this.packageToEdit.price;
        this.selectedServices = this.packageToEdit.services;
        this.changeDetectorRef.detectChanges();
      }
    } else {
      this.userService.getAllServicesAndVariations().subscribe(data => {
        this.services = data.filter((service: { hasVariations: any; }) => !service.hasVariations);
        this.services = this.services.reduce((acc: any[], service: { variations: any[]; name: any; }) => {
          if (service.variations && service.variations.length > 0) {
            const variationsAsServices = service.variations.map((variation: { name: any; }) => ({
              ...service,
              ...variation,
              name: `${service.name} (${variation.name})`,
              selected: false,
            }));
            acc.push(...variationsAsServices);
          } else {
            acc.push({
              ...service,
              selected: false
            });
          }
          return acc;
        }, []);
        this.packageToEdit = this.navParams.get('package');
        if (this.packageToEdit.name != "") {
          this.editMode = true;
          this.packageName = this.packageToEdit.name;
          this.packageId = this.packageToEdit.id;
          this.packageDescription = this.packageToEdit.description;
          this.packagePrice = this.packageToEdit.price;
          this.selectedServices = this.packageToEdit.services;
          this.changeDetectorRef.detectChanges();
        }
      }, err => {
        // Handle error
      });
    }
  }

  goBack() {
    this.modalController.dismiss();
  }

  updateSelectedServices(event: any) {
    this.selectedServices = event.detail.value;
  }

  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const itemToMove = this.selectedServices.splice(ev.detail.from, 1)[0];
    this.selectedServices.splice(ev.detail.to, 0, itemToMove);
    ev.detail.complete();
  }

  getSelectedServiceName(serviceId: string): string {
    const service = this.services.find((s: { id: string; }) => s.id === serviceId);
    return service ? service.name : 'Unknown';
  }

  openServiceSelect() {
    this.serviceSelect.open();
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

  savePackage() {
    this.showErrors = true;

    if (!this.canSavePackage()) {
      this.userService.presentToast("Παρακαλώ συμπληρώστε όλα τα πεδία.", "danger");
      return;
    }

    if (!this.onboarding) {
      const packageData = {
        id: this.packageId,
        name: this.packageName,
        description: this.packageDescription,
        price: this.packagePrice,
        services: this.selectedServices,
        servicesWithIndex: this.selectedServices.map((serviceId, index) => ({
          id: serviceId,
          index
        }))
      };

      this.userService.savePackage(packageData).subscribe((res: any) => {
        this.userService.presentToast("Το πακέτο αποθηκεύτηκε με επιτυχία", "success");
        this.modalController.dismiss({
          'edited': true
        });
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ ξαναπροσπαθήστε.", "danger");
        console.error('Error saving package:', err);
      });
    } else {
      const newPackage = {
        name: this.packageName,
        description: this.packageDescription,
        price: this.packagePrice,
        services: this.selectedServices,
        servicesWithIndex: this.selectedServices.map((serviceName, index) => {
          const service = this.services.find((service: { name: string; }) => service.name === serviceName);
          return {
            id: serviceName,
            index
          };
        })
      };

      this.modalController.dismiss({
        'newPackage': newPackage
      });
    }
  }

  isFieldInvalid(field: any): boolean {
    return !field || field.toString().trim() === '';
  }

  canSavePackage(): boolean {
    return this.packageName.trim() !== "" &&
           this.packagePrice.toString().trim() !== "" &&
           this.selectedServices.length > 0;
  }
  
  deletePackage() {
    if (!this.onboarding) {
      this.userService.deletePackage(this.packageId).subscribe((res: any) => {
        this.userService.presentToast("Το πακέτο διαγράφηκε με επιτυχία", "success");
        this.modalController.dismiss({
          'edited': true
        });
      }, err => {
        this.userService.presentToast("Κάτι πήγε στραβά. Παρακαλώ ξαναπροσπαθήστε.", "danger");
      });
    } else {
      this.modalController.dismiss({
        'deletePackage': true,
        'packageId': this.packageId
      });
    }
  }
}
