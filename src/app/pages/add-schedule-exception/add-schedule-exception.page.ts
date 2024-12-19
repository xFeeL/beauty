import { formatDate } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-schedule-exception',
  templateUrl: './add-schedule-exception.page.html',
  styleUrls: ['./add-schedule-exception.page.scss'],
})
export class AddScheduleExceptionPage implements OnInit {
  @Input() firstDateTime!: string;
  @Input() endDateTime!: string;
  @Input() isAvailable?: boolean; // Make optional
  @Input() isRepeatable?: boolean; // Make optional
  @Input() objectId!: string | null; // New Input for Object ID

  maxDate!: string;
  minDate!: string;

  exceptionType: string = "once"; // "once" or "repeated"
  exceptionStatus: string = "closed"; // "closed" or "open"

  constructor(
    private userService: UserService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    const currentDate = new Date();

    // Initialize dates if not provided (for creation)
    if (!this.firstDateTime) {
      this.firstDateTime = formatDate(currentDate, 'yyyy-MM-ddTHH:mm:ss', 'en-US', 'Europe/Athens');
    }
    if (!this.endDateTime) {
      this.endDateTime = this.firstDateTime;
    }

    // Set maxDate and minDate
    this.maxDate = `2099-12-31T23:59`;
    this.minDate = `2010-01-01T00:00`;

    // If editing, set the form fields based on inputs
    if (this.isAvailable !== undefined) {
      this.exceptionStatus = this.isAvailable ? 'open' : 'closed';
    }

    if (this.isRepeatable !== undefined) {
      this.exceptionType = this.isRepeatable ? 'repeated' : 'once';
    }

    if (this.objectId === null) {
      // If adding new exception, always closed
      this.exceptionStatus = 'closed';
      this.isAvailable = false;
      // Optionally, hide or disable the status selection in the template
    }
  }

  goBack() {
    this.modalController.dismiss();
  }

  saveScheduleException() {
    // Validate the input dates
    if (new Date(this.firstDateTime) > new Date(this.endDateTime)) {
      // Display an error message to the user
      // You can implement a toast or alert here
      console.error("Η ημερομηνία 'Από' δεν μπορεί να είναι μετά την ημερομηνία 'Έως'.");
      return;
    }
  
    const formattedFirstDateTime = formatDate(this.firstDateTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US', 'Europe/Athens');
    const formattedEndDateTime = formatDate(this.endDateTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US', 'Europe/Athens');
  
    const repeat: boolean = this.exceptionType !== "once";
    const status: string = this.exceptionStatus; // "closed" or "open"
    const isAvailable: boolean = this.objectId !== null ? (this.exceptionStatus === 'open') : false; // If adding, always false
    const isRepeatable: boolean = repeat;
  
    // Dismiss the modal with the formatted data
    this.modalController.dismiss({
      start: formattedFirstDateTime,
      end: formattedEndDateTime,
      repeat: repeat,
      isAvailable: isAvailable, // Include isAvailable for API consistency
      isRepeatable: isRepeatable // Include isRepeatable for API consistency
    });
  }
}
