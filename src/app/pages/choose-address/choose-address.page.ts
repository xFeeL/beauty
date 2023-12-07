import { Component, OnInit } from '@angular/core';
import { ModalController, NavController } from '@ionic/angular';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-choose-address',
  templateUrl: './choose-address.page.html',
  styleUrls: ['./choose-address.page.scss'],
})
export class ChooseAddressPage implements OnInit {
  autocompleteInput = '';
  queryWait = false;
  suggestions: any;
  loadingOn = false

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private nav: NavController
  ) { }

  ngOnInit() { }



  searchAddress() {
    this.suggestions = []
    console.log('search', this.autocompleteInput);
    // whenever a search is triggered
    // a 1 second delay is set to avoid excesive calls to API
    if (this.autocompleteInput.length < 1) {
      console.log('query is too short, bye');
      return;
    }

    if (!this.queryWait) {
      this.loadingOn = true;

      this.queryWait = true;
      setTimeout(() => {

        // when timeout, it triggers the search and always reads the last query
        // this.getAutocompletePredictions();
        this.queryWait = false;
        this.userService.guessAddresses(this.autocompleteInput).subscribe(data => {

          this.suggestions = data
          console.log(data)
          this.loadingOn = false;

        })
      }, 1000);
    } else {
      console.log('wait ...');
    }
  }


  returnAddress(item: any) {
    localStorage.setItem('address', item.address);

    this.modalController.dismiss(item);
  }

  dismiss() {
    this.modalController.dismiss();
  }


  goBack() {
    this.modalController.dismiss();
  }
}
