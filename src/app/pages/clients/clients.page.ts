// clients.page.ts
import {
  Component,
  OnInit,
  ViewChild,
  Renderer2,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import {
  IonContent,
  IonModal,
  IonPopover,
  ItemReorderEventDetail,
  ModalController,
  NavParams,
} from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { PopoverController } from '@ionic/angular';
import * as moment from 'moment';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  AnimationEvent,
} from '@angular/animations';
import { AddServicesPage } from '../add-services/add-services.page';
import { lastValueFrom } from 'rxjs';
import { MaskitoOptions, MaskitoElementPredicateAsync } from '@maskito/core';
import { TeamServicesPromptPage } from '../team-services-prompt/team-services-prompt.page';
import { ClientProfilePage } from '../client-profile/client-profile.page';
import { ChatPage } from '../chat/chat.page';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {
  clients: Array<any> = new Array<any>();
  disableInfiniteScroll: boolean = false;
  loadingClients = false;
  searchTerm: string = '';
  page = 0;
  @ViewChild(IonModal) addClientModal!: IonModal;

  // Variables for Add Client Modal
  isAddingNewClient: boolean = false;
  newClientName: string = '';
  newClientSurname: string = '';
  newClientPhone: string = '';
  newClientEmail: string = '';
  isInputValid: boolean = false;

  phoneMask: MaskitoOptions = {
    mask: [
      '+',
      '3',
      '0',
      ' ',
      '6',
      '9',
      /\d/,
      ' ',
      /\d/,
      /\d/,
      /\d/,
      ' ',
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
  };
  readonly maskPredicate: MaskitoElementPredicateAsync = async (
    el
  ) => (el as HTMLIonInputElement).getInputElement();
  saveButtonEnabled: boolean = false;

  constructor(
    private route: Router,
    private userService: UserService,
    private modalController: ModalController,
    private _cd: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.disableInfiniteScroll = false;
    this.page = 0;
    this.clients.splice(0);
    this.searchTerm = '';

    this.getClients();
    this.page = this.page + 1;
    this.getClients();
    this.userService.sseConnect(window.location.toString());
  }

  loadData(event: any) {
    this.page = this.page + 1;
    this.getClients();
    event.target.complete();
  }

  getClients() {
    this.loadingClients = true;
    this.userService.getAllClients(this.page).subscribe(
      (data) => {
        if (data.length == 0) {
          this.disableInfiniteScroll = true;
        } else {
          for (let j = 0; j < data.length; j++) {
            data[j].name = data[j].name.replace('$', ' ');
            this.clients.push(data[j]);
          }
        }
        this.loadingClients = false;
        this._cd.markForCheck();
      },
      (err) => {
        this.loadingClients = false;
        this._cd.markForCheck();
      }
    );
  }

  goBack() {
    this.modalController.dismiss();
  }

  onSearch(eve: any) {
    if (eve.detail.value.length == 0) {
      this.clients.splice(0);
      this.page = 0;
      this.getClients();
      return;
    }
    this.userService.filterClients(eve.detail.value).subscribe(
      (data) => {
        this.clients = [];
        for (let j = 0; j < data.length; j++) {
          data[j].name = data[j].name.replace('$', ' ');
        }
        this.clients = data;
        this._cd.markForCheck();
      },
      (err) => {
        this._cd.markForCheck();
      }
    );
  }

  getClientsSize() {
    return 2;
  }

  async goToChat(item: any) {
    const modal = await this.modalController.create({
      component: ChatPage,
      componentProps: {
        user_id: item.id,
      },
    });
    return await modal.present();
  }

  async goToClientProfile(item: any) {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        user_id: item.id,
      },
      backdropDismiss: false,
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();

    if (data) {
      this.clients = [];
      this.page = 0;
      this.searchTerm = '';
      this.getClients();
    }
  }

  // FAB Button: Open Add Client Modal
  async openAddClientModal() {
    await this.addClientModal.present();
    this.isAddingNewClient = false;
    this._cd.markForCheck();
  }

  // FAB Button: Close Add Client Modal
  closeAddClientModal() {
    this.addClientModal.dismiss();
    this.isAddingNewClient = false;
    this.resetAddClientForm();
    this._cd.markForCheck();
  }

  // Method to add new client
  addNewClient() {
    this.resetAddClientForm();
    this.isAddingNewClient = true;
    this._cd.markForCheck();
  }

  // Reset Add Client Form
  resetAddClientForm() {
    this.newClientName = '';
    this.newClientSurname = '';
    this.newClientPhone = '';
    this.newClientEmail = '';
    this.isInputValid = false;
  }

  // Validate Inputs for New Client
  validateNewClientInputs() {
    const nameValid = this.newClientName.trim().length > 0;
    const surnameValid = this.newClientSurname.trim().length > 0;
    const phoneValid =
      !this.newClientPhone || this.validatePhone(this.newClientPhone);
    const emailValid =
      !this.newClientEmail || this.validateEmail(this.newClientEmail);

    this.isInputValid = nameValid && surnameValid && phoneValid && emailValid;
    this._cd.markForCheck();
  }

  // Helper function to validate email format
  validateEmail(email: any) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // Helper function to validate phone format
  validatePhone(phone: string): boolean {
    const phonePattern = /^\+30\s69\d{1}\s\d{3}\s\d{4}$/;
    return phonePattern.test(phone);
  }

  // Create New Client
  createClient() {
    if (this.isInputValid) {
      this.userService
        .newManualClient(
          this.newClientName,
          this.newClientSurname,
          this.newClientPhone,
          this.newClientEmail
        )
        .subscribe(
          (data) => {
            const newClient = {
              id: data.clientId,
              name: `${this.newClientName} ${this.newClientSurname}`,
              phone: this.newClientPhone,
              email: this.newClientEmail || null,
              profileImage: data.profileImage,
              isManualClient: true,
            };
            this.clients.unshift(newClient);
            this.userService.presentToast(
              'Ο νέος πελάτης καταχωρήθηκε!',
              'success'
            );
            this.addClientModal.dismiss();
            this.isAddingNewClient = false;
            this.saveButtonEnabled = true;
            this.resetAddClientForm();
            this._cd.markForCheck();
          },
          (err) => {
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
}
