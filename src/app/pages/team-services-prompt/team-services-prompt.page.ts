import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { TeamServicesPage } from '../team-services/team-services.page';

@Component({
  selector: 'app-team-services-prompt',
  templateUrl: './team-services-prompt.page.html',
  styleUrls: ['./team-services-prompt.page.scss'],
})
export class TeamServicesPromptPage implements OnInit {

  constructor(private modalController:ModalController) { }

  ngOnInit() {
  }

  goBack() {
    this.modalController.dismiss()
  }

  async goToTeamServices() {

    const modal = await this.modalController.create({
      component: TeamServicesPage,
      backdropDismiss: false
    });
    modal.onDidDismiss().then((result) => {
      if (result.data === true) {
        window.location.reload(); // To reload the entire window
        // Or you can implement any other logic to refresh the component/view as needed.
      }
    });
    return await modal.present();

  }


}
