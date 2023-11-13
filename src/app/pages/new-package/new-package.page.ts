import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IonSelect, ItemReorderEventDetail, ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-new-package',
  templateUrl: './new-package.page.html',
  styleUrls: ['./new-package.page.scss'],
})
export class NewPackagePage implements OnInit {
  services: any = [];
  selectedServices: string[] = [];
  packageName: any="";
  packageDescription: any="";
  packagePrice: any="";
  packageToEdit: any=[];
  editMode: boolean=false;
  packageId: any;
  constructor(private changeDetectorRef: ChangeDetectorRef,private navParams: NavParams, private modalController: ModalController) { }
  @ViewChild('serviceSelect') serviceSelect!: IonSelect;

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.services = this.navParams.get('services');
    console.log("The services before modification:", this.services);
    this.services = this.services.map((service: any) => ({
      ...service,
      selected: false
    }));
    this.packageToEdit=this.navParams.get('package');
    console.log("The services after modification:", this.services);
    console.log("The package to edit is:", this.packageToEdit);
    if(this.packageToEdit.services.length>0){
      this.editMode=true
      this.packageName=this.packageToEdit.name;
      this.packageId=this.packageToEdit.id;
      this.packageDescription=this.packageToEdit.description;
      this.packagePrice=this.packageToEdit.price;
      this.selectedServices=this.packageToEdit.services;
      this.changeDetectorRef.detectChanges();
    }
  }

  goBack() {
    this.modalController.dismiss()
  }

  updateSelectedServices(event: any) {
    this.selectedServices = event.detail.value;
  }
  handleReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // Perform the reorder in the array
    const itemToMove = this.selectedServices.splice(ev.detail.from, 1)[0];
    this.selectedServices.splice(ev.detail.to, 0, itemToMove);
  
    // Complete the reorder and position the item in the DOM based on where the gesture ended
    ev.detail.complete();
  
    console.log('Reordered services:', this.selectedServices);
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
    const newPackage = {
      name: this.packageName,
      description: this.packageDescription,
      price: this.packagePrice,
      services: this.selectedServices,
      id:this.packageId
    }
    console.log("The new package is:", newPackage)
    this.modalController.dismiss({
      'newPackage': newPackage
    });
  }

  canSavePackage(){
    if(this.packageName!="" && this.packagePrice!="" && this.selectedServices.length > 0){
      return true;
    }
    return false;
  }

  deletePackage(){
    this.modalController.dismiss({
      'deletePackage': true
    });
  }
}
