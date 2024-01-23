import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartConfiguration, ChartDataset, ChartType } from 'chart.js';
import { MatMenuModule } from '@angular/material/menu';
import { UserService } from 'src/app/services/user.service';
import { ClientProfilePage } from '../client-profile/client-profile.page';
@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit {

  constructor(private modalController:ModalController, private userService:UserService) { }
  selectedTimeFrame: string = 'εβδομάδας';
  totalAppointments: any = 0;
  totalRevenue: any = 0;
  topClients: any = [];
  statsLoading: boolean = false;
  lineChartLabels: string[] = [];
  statsNumberLoading = false;
  public lineChartType: ChartType = 'line';


  ngOnInit() {
  }

  ionViewWillEnter() {


 
    this.getStatsNumbers(this.selectedTimeFrame);
    this.getStats(this.selectedTimeFrame);
    this.getTopClients();

  }

  getTopClients() {
    this.userService.getTopClients().subscribe(data => {
      this.topClients = data;
    }, err => {

    })
  }


  goBack(){
    this.modalController.dismiss()
  }

  updateSelectedTimeFrame(newTimeFrame: string) {
    this.selectedTimeFrame = newTimeFrame;
    // Call any other function you want here
    this.getStatsNumbers(this.selectedTimeFrame);
    this.getStats(this.selectedTimeFrame)

  }

  getStatsNumbers(timeFrame: string) {

    this.statsNumberLoading = true
    this.userService.getStatsNumber(this.fixTimeFrameWording(timeFrame)).subscribe(data => {
      this.totalAppointments = data.appointmentCount;
      this.totalRevenue = data.totalRevenue;
      this.statsNumberLoading = false

    }, err => {
      this.statsNumberLoading = false

      // Handle your error here
    });
  }

  fixTimeFrameWording(timeFrame: string) {
    let mappedTimeFrame: string;

    switch (timeFrame) {
      case "μήνα":
        mappedTimeFrame = "28";
        break;
      case "εβδομάδας":
        mappedTimeFrame = "7";
        break;
      case "χρονιάς":
        mappedTimeFrame = "365";
        break;
      default:
        // Handle any default or error case
        mappedTimeFrame = "unknown";
    }
    return mappedTimeFrame
  }

  getStats(timeFrame: string) {
    this.statsLoading = true;

    this.userService.getStats(this.fixTimeFrameWording(timeFrame)).subscribe(data => {
      this.lineChartLabels = Object.keys(data); // Extracting the labels from the response data
      this.lineChartData[0].data = Object.values(data); // Extracting the data values from the response data

      this.statsLoading = false;
    }, err => {
      this.statsLoading = false;
      console.error('Error fetching stats:', err);  // You might want to handle this more gracefully in your actual application.
    });
  }


  lineChartData: ChartDataset[] = [
    {
      data: [], label: 'Έσοδα (€)', borderColor: 'lightblue',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      fill: true, pointBorderColor: 'rgba(61,162,255,1)',       // This sets the border color of the points to blue.
      pointBackgroundColor: 'rgba(61,162,255,1)',
    },

  ];

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      y: {
        position: 'left',
      },
    
    },

    plugins: {
      legend: { display: true },

    },
  };

  async goToClient(user_id: string) {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        'user_id': user_id
      }
    });
    return await modal.present();
  }
}
