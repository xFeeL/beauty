import { Injectable } from '@angular/core';
import { PaymentSheetEventsEnum, Stripe } from '@capacitor-community/stripe';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor() {
    // Initialize Stripe with your publishable key
    Stripe.initialize({
      publishableKey: 'YOUR_PUBLISHABLE_KEY', // Replace with your key
    });
  }

  setupPaymentSheetListeners() {
    Stripe.addListener(PaymentSheetEventsEnum.Loaded, () => {
      // Handle event
    });
  }

  async createPaymentSheet(clientSecret: string) {
    return Stripe.createPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: 'Your Company Name',
    });
  }


}
