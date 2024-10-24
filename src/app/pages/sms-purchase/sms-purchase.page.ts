// sms-purchase.page.ts
import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { loadStripe, Stripe, StripeElements, StripeCardElement } from '@stripe/stripe-js';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sms-purchase',
  templateUrl: './sms-purchase.page.html',
  styleUrls: ['./sms-purchase.page.scss'],
})
export class SmsPurchasePage implements OnInit {
  currentStep: number = 1;
  selectedOption: string = '';
  smsAmount: number = 200;
  threshold: number = 10;

  // Stripe related
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  card: StripeCardElement | null = null;

  isProcessing: boolean = false;
  errorMessage: string = '';

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private userService: UserService
  ) {}

  async ngOnInit() {
    // Initialize Stripe
    this.stripe = await loadStripe("pk_test_51QAWK4EQw15tXsM9QQsDAmfeW5iDTLvtVKLISVxs7ZCXQBkV3TCLA8eRtQuJEYMBnkzCNNGDjmqiG5ySsGD45QzC00pgbxIOq4");
    if (this.stripe) {
      this.elements = this.stripe.elements();
      // Create and mount the card element for auto-renewal
      this.card = this.elements.create('card');
      this.card.mount('#card-element'); // Ensure you have a div with id 'card-element' in your HTML for auto-renewal
    }
  }

  selectOption(option: string) {
    this.selectedOption = option;
  }

  async nextStep() {
    this.currentStep = 2;
    if (this.selectedOption === 'automatic' && this.stripe && this.card) {
      // Optionally, you can display the card input only for auto-renewal
      // Or handle the card setup in a separate modal/page
    }
  }

  calculateOneTimePrice(): number {
    return Math.round(this.smsAmount * 0.08 * 1.24 * 100); // Convert to cents
  }

  goBack() {
    this.modalController.dismiss();
  }

  async activateAutoRenewal() {
    console.log('activateAutoRenewal called');
  
    if (!this.isValidAutoRenewalSettings()) {
      console.log('Invalid auto-renewal settings:', {
        smsAmount: this.smsAmount,
        threshold: this.threshold,
      });
      this.presentAlert('Παρακαλώ εισάγετε έγκυρες ρυθμίσεις αυτόματης ανανέωσης.');
      return;
    }
  
    this.isProcessing = true;
    console.log('isProcessing set to true');
  
    try {
      // Step 1: Create Setup Session on the backend with smsAmount and threshold
      console.log('Creating Setup Session on the backend...');
      const setupSessionResponse = await this.userService.createSetupSession(this.smsAmount, this.threshold).toPromise();
      console.log('Setup Session Response:', setupSessionResponse);
  
      const sessionId = setupSessionResponse.sessionId;
      console.log('Session ID received:', sessionId);
  
      // Step 2: Redirect to Stripe Checkout
      const stripe = await this.stripe;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }
  
      console.log('Redirecting to Stripe Checkout...');
      const { error } = await stripe.redirectToCheckout({ sessionId });
  
      if (error) {
        console.error('Stripe Checkout redirect error:', error);
        this.presentAlert(error.message || 'Σφάλμα κατά την ανακατεύθυνση στο Stripe Checkout.');
      }
    } catch (error) {
      console.error('Error activating auto-renewal:', error);
      this.presentAlert('Σφάλμα κατά την ενεργοποίηση της αυτόματης ανανέωσης. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
      this.isProcessing = false;
      console.log('isProcessing set to false');
    }
  }
  
  
  

  isValidOneTimePurchaseSettings(): boolean {
    return this.smsAmount > 0;
  }

  async processOneTimePurchase() {
    if (!this.isValidOneTimePurchaseSettings()) {
      this.presentAlert('Παρακαλώ εισάγετε έγκυρο αριθμό SMS.');
      return;
    }

    const price = this.calculateOneTimePrice();

    this.isProcessing = true;
    const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/payment-cancelled`;

    try {
      const response = await this.userService.createCheckoutSession(price, successUrl, cancelUrl).toPromise();
      window.location.href = response.url; // Redirect user to Stripe Checkout
    } catch (error) {
      console.error('Error creating Checkout Session:', error);
      this.errorMessage = 'Σφάλμα κατά την επεξεργασία της πληρωμής. Παρακαλώ δοκιμάστε ξανά.';
      this.presentAlert(this.errorMessage);
    } finally {
      this.isProcessing = false;
    }
  }

  async checkPaymentSuccess(sessionId: string) {
    try {
      const response = await this.userService.verifyPayment(sessionId).toPromise();
      if (response.success) {
        this.presentAlert('Η πληρωμή ήταν επιτυχής. Τα SMS σας προστέθηκαν.');
        // You can update the UI or redirect the user as necessary
      } else {
        this.presentAlert('Η πληρωμή απέτυχε.');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      this.presentAlert('Σφάλμα κατά την επαλήθευση της πληρωμής.');
    }
  }

  // Adjust the existing validation to account for both cases
  isValidSettings(): boolean {
    console.log('Selected option:', this.selectedOption);
    
    if (this.selectedOption === 'automatic') {
      const isValid = this.isValidAutoRenewalSettings();
      console.log('Auto-renewal settings validation result:', isValid);
      return isValid;
    }
    
    const isValidOneTime = this.isValidOneTimePurchaseSettings();
    console.log('One-time purchase settings validation result:', isValidOneTime);
    return isValidOneTime;
  }
  

  isValidAutoRenewalSettings(): boolean {
    // Ensure the inputs are treated as numbers
    const smsAmountNum = Number(this.smsAmount);
    const thresholdNum = Number(this.threshold);
  
    console.log('Validating auto-renewal settings...');
    console.log('SMS Amount:', smsAmountNum);
    console.log('Threshold:', thresholdNum);
  
    // Validate auto-renewal settings
    const isValid = smsAmountNum > 0 && thresholdNum > 0 && thresholdNum < smsAmountNum;
    console.log('Auto-renewal settings are valid:', isValid);
  
    return isValid;
  }
  
  

  async presentAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Προσοχή',
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
