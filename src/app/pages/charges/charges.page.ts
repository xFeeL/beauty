// src/app/pages/charges/charges.page.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, LoadingController, AlertController, IonInfiniteScroll } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';

@Component({
  selector: 'app-charges',
  templateUrl: './charges.page.html',
  styleUrls: ['./charges.page.scss'],
})
export class ChargesPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  payments: any[] = [];
  currentPage: number = 0; // Start from 0 since Spring Data is 0-based
  totalPayments: number = 0;

  constructor(
    private userService: UserService,
    private modalController: ModalController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadPayments();
  }


  /**
   * Loads payments from the backend.
   *
   * @param event The infinite scroll event.
   */
  loadPayments(event?: any) {
    this.userService.getPayments(this.currentPage).subscribe(
      async (response: any) => {
        // Append the new payments to the existing array
        this.payments = [...this.payments, ...response.content];
        this.totalPayments = response.totalElements;

        this.currentPage++;

        if (event) {
          event.target.complete();
        } else {
          
        }

        // Disable infinite scroll if all data is loaded
        if (this.payments.length >= this.totalPayments && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      },
      async (error: any) => {
        if (event) {
          event.target.complete();
        }

        const alert = await this.alertController.create({
          header: 'Σφάλμα',
          message: 'Αποτυχία φόρτωσης χρεώσεων. Παρακαλώ δοκιμάστε ξανά αργότερα.',
          buttons: ['OK']
        });
        await alert.present();
      }
    );
  }

  /**
   * Handles the infinite scroll event to load more payments.
   *
   * @param event The infinite scroll event.
   */
  loadMorePayments(event: any) {
    this.loadPayments(event);
  }

  /**
   * Navigates back to the previous page.
   */
  goBack() {
    this.modalController.dismiss();
  }

  /**
   * Formats the amount from cents to a readable string.
   *
   * @param amount The amount in cents.
   * @param currency The currency code.
   * @returns A formatted amount string.
   */
  formatAmount(amount: number, currency: string): string {
    return `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }

  /**
   * Formats the date string to a readable format.
   *
   * @param dateString The ISO date string.
   * @returns A formatted date string.
   */
  formatDate(dateString: string): string {
    return moment(dateString).format('DD MMM YYYY HH:mm');
  }

}
