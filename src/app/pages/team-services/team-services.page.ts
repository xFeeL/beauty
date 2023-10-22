import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-team-services',
  templateUrl: './team-services.page.html',
  styleUrls: ['./team-services.page.scss'],
})
export class TeamServicesPage implements OnInit {
  selectedSegment: string = 'team'; 


  constructor(private modalController:ModalController) { }

  ngOnInit() {
  }

  loadTeam(){
    
  }

  loadServices(){

  }

  goBack() {
    this.modalController.dismiss()
  }

}
