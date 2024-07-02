import { Component, OnInit } from '@angular/core';
import { ChangePasswordPage } from '../change-password/change-password.page';
import { ModalController } from '@ionic/angular';
import { async } from 'rxjs';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-reservation-settings',
  templateUrl: './reservation-settings.page.html',
  styleUrls: ['./reservation-settings.page.scss'],
})
export class ReservationSettingsPage implements OnInit {

  constructor(private modalController: ModalController, private userService: UserService) {
  }
  ngOnInit() {
    this.loadKrathseisSettings()
  }


 

maxReservationMinutes: number = 60;
slotInterval: string = "15";

needAccept: boolean = false;
isVisible: boolean = true;


loadKrathseisSettings() {

  this.userService.getAppointmentsSettings().subscribe(data => {
    
    

    this.maxReservationMinutes = data.maxReservationMinutes;
    this.slotInterval = data.slotInterval.toString();

    // Assuming needAccept from server is 0 or 1, convert it to boolean
    this.needAccept = data.needAccept === 0;

    // Assuming isVisible from server is a string "true" or "false", convert it to boolean
    this.isVisible = data.isVisible === "true";

  }, err => {
    console.error("Error fetching Krathseis settings:", err);
  });
}

saveKrathseisSettings() {
  this.userService.saveAppointmentsSettings(this.slotInterval, this.needAccept, this.isVisible).subscribe(data => {
    this.userService.presentToast("Οι ρυθμίσεις για τις κρατήσεις αποθηκεύτηκαν με επιτυχία.", "success")
  }, err => {
    this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

  });
}

goBack() {
  this.modalController.dismiss()
}





}
