import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import * as moment from 'moment';
import { ModalController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.page.html',
  styleUrls: ['./reviews.page.scss'],
})
export class ReviewsPage implements OnInit {
  oneStarReviews = 0.0;
  fiveStarReviews = 0.0;
  fourStarReviews = 0.0;
  threeStarReviews = 0.0;
  twoStarReviews = 0.0;
  stars_array_size = Array(5).fill(4); // [4,4,4,4,4]
  reviews: any[][] = new Array<any>;
  page: number = 0;
  expertReviewsData: string[][] = [[""], [""]];
  expertImage: any;
  showFullMessage = false;


  constructor(private userService: UserService, private navCtrl: NavController, private modalController: ModalController) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.userService.sseConnect(window.location.toString());

    this.page = 0
    this.reviews = []
    this.userService.getExpertReviewsData().subscribe(data => {
      this.expertReviewsData = data
      this.expertImage = data[1]

    }, err => {

    })
    this.getReviews();
  }

  goBack() {
    this.modalController.dismiss()
  }

  numSequence(n: any): Array<any> {
    return Array(n);
  }

  getReviews() {

    this.userService.getExpertReviews(this.page).subscribe(data => {
      for (let i = 0; i < data.length; i++) {
        data[i][9] = ""
        data[i][10] = true
        data[i][4] = data[i][4].replace('$', ' ')
        data[i][5] = moment(data[i][5]).locale("el").format('DD MMM, YYYY')
        data[i][7] = moment(data[i][7]).locale("el").format('DD MMM, YYYY')
        if (data[i][2].length > 70) {
          data[i][10] = false

        }
      }
      this.reviews = data;
      for (var val of this.reviews) {

        if (val[1] == '1')
          this.oneStarReviews++;
        else if (val[1] == '2')
          this.twoStarReviews++;
        else if (val[1] == '3')
          this.threeStarReviews++;
        else if (val[1] == '4')
          this.fourStarReviews++;
        else if (val[1] == '5')
          this.fiveStarReviews++;
      }


      this.oneStarReviews = this.oneStarReviews / this.reviews.length;
      this.twoStarReviews = this.twoStarReviews / this.reviews.length;
      this.threeStarReviews = this.threeStarReviews / this.reviews.length;
      this.fourStarReviews = this.fourStarReviews / this.reviews.length;
      this.fiveStarReviews = this.fiveStarReviews / this.reviews.length;

    }, err => {
      this.reviews = err.error.text;   //epeidi den einai json to response gurnaei error

    }
    );

  }

  sendResponse(review: any) {
    this.userService.sendResponseToReview(review[9], review[8]).subscribe(data => {
      this.userService.presentToast("Η απάντηση σας ανέβηκε με επιτυχία!", "success");
      review[6] = review[9]
      review[7] = moment().locale("el").format('DD MMM, YYYY')
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Προσπαθήστε ξανά.", "danger");

    })
  }
}
