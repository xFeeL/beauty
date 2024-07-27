import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ChartConfiguration, ChartDataset, ChartType } from 'chart.js';
import { UserService } from 'src/app/services/user.service';
import { ClientProfilePage } from '../client-profile/client-profile.page';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPage implements OnInit {

  selectedTimeFrame: string = 'εβδομάδας';
  totalAppointments: number = 0;
  totalRevenue: number = 0;
  topClients: any[] = [];
  statsLoading: boolean = false;
  lineChartLabels: string[] = [];
  statsNumberLoading: boolean = false;
  public lineChartType: ChartType = 'line';
  public lineChartData: ChartDataset[] = [
    {
      data: [],
      label: 'Έσοδα (€)',
      borderColor: 'lightblue',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      fill: true,
      pointBorderColor: 'rgba(61,162,255,1)',
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
      y: {
        position: 'left',
      },
    },
    plugins: {
      legend: { display: true },
    },
  };

  constructor(
    private modalController: ModalController,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() { }

  ionViewWillEnter() {
    this.getStatsNumbers(this.selectedTimeFrame);
    this.getStats(this.selectedTimeFrame);
    this.getTopClients();
  }

  getTopClients() {
    this.userService.getTopClients().subscribe(data => {
      this.topClients = data;
      this.cdr.markForCheck();
    }, err => {
      console.error('Error fetching top clients:', err);
    });
  }

  goBack() {
    this.modalController.dismiss();
  }

  updateSelectedTimeFrame(newTimeFrame: string) {
    this.selectedTimeFrame = newTimeFrame;
    this.getStatsNumbers(this.selectedTimeFrame);
    this.getStats(this.selectedTimeFrame);
  }

  getStatsNumbers(timeFrame: string) {
    this.statsNumberLoading = true;
    this.userService.getStatsNumber(this.fixTimeFrameWording(timeFrame)).subscribe(data => {
      this.totalAppointments = data.appointmentCount;
      this.totalRevenue = data.totalRevenue;
      this.statsNumberLoading = false;
      this.cdr.markForCheck();
    }, err => {
      this.statsNumberLoading = false;
      console.error('Error fetching stats numbers:', err);
    });
  }

  fixTimeFrameWording(timeFrame: string): string {
    switch (timeFrame) {
      case "μήνα":
        return "28";
      case "εβδομάδας":
        return "7";
      case "χρονιάς":
        return "365";
      default:
        return "unknown";
    }
  }

  getStats(timeFrame: string) {
    this.statsLoading = true;
    this.userService.getStats(this.fixTimeFrameWording(timeFrame)).subscribe(data => {
      this.lineChartLabels = Object.keys(data);
      this.lineChartData[0].data = Object.values(data);
      this.statsLoading = false;
      this.cdr.markForCheck();
    }, err => {
      this.statsLoading = false;
      console.error('Error fetching stats:', err);
    });
  }

  async goToClient(user_id: string) {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: { user_id }
    });
    return await modal.present();
  }
}
