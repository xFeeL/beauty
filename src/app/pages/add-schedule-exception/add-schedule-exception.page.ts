import { formatDate } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-add-schedule-exception',
  templateUrl: './add-schedule-exception.page.html',
  styleUrls: ['./add-schedule-exception.page.scss'],
})
export class AddScheduleExceptionPage implements OnInit {
  maxDate!: string;
  minDate!: string;
  firstDateTime!: string;
  endDateTime!: string

  exceptionType:any="once";
  constructor(private userService: UserService, private modalController: ModalController) {
    const currentDate = new Date();
    this.firstDateTime = currentDate.toISOString(); // Set the initial value to the current date and time
    this.endDateTime = this.firstDateTime
    const currentYear = currentDate.getFullYear();
    this.maxDate = `2099-12-31T23:59`;
    this.minDate = `2010-01-01T00:00`;
  }



  ngOnInit() {

  }

  ngAfterViewInit() {

  }

  goBack() {

    this.modalController.dismiss()
  }




  saveScheduleException() {
    const formattedFirstDateTime = formatDate(this.firstDateTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    const formattedEndDateTime = formatDate(this.endDateTime, 'yyyy-MM-ddTHH:mm:ss', 'en-US');
    let repeat:boolean = this.exceptionType !== "once";

    // Instead of saving here, dismiss the modal with the formatted data
    this.modalController.dismiss({
      start: formattedFirstDateTime,
      end: formattedEndDateTime,
      repeat: repeat
    });
}

  onSubmit() {

  }
}
