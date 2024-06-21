import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonPopover, ModalController, NavController, Platform } from '@ionic/angular';
import { UserService } from 'src/app/services/user.service';
import { NotificationsPage } from '../notifications/notifications.page';
import { ClientsPage } from '../clients/clients.page';
import { ReviewsPage } from '../reviews/reviews.page';
import { EditProfilePage } from '../edit-profile/edit-profile.page';
import { PortfolioPage } from '../portfolio/portfolio.page';
import { KrathshPage } from '../krathsh/krathsh.page';
import * as moment from 'moment';
import { MatChipsModule } from '@angular/material/chips';
import { animate, query, stagger, state, style, transition, trigger } from '@angular/animations';
import { MatTableDataSource, } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { KrathseisPage } from '../krathseis/krathseis.page';
import { MatMenuModule } from '@angular/material/menu';
import { ChangeDetectorRef } from '@angular/core';
import { ChartConfiguration, ChartDataset, ChartType } from 'chart.js';
import { ClientProfilePage } from '../client-profile/client-profile.page';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NewKrathshPage } from '../new-krathsh/new-krathsh.page';
import { MatTooltip } from '@angular/material/tooltip';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'
import { FullCalendarComponent } from '@fullcalendar/angular';
import { PopoverController } from '@ionic/angular';
import { formatDate } from '@angular/common';
import elLocale from '@fullcalendar/core/locales/el';
import { Subscription } from 'rxjs';

export interface PeriodicElement {
  avatar: string;
  name: string;
  date: string;
  employee: string;
  service: string;
  price: string,
  status: string;

  id: string;
  serviceEmployeeMapping?: string // This will map each service to its respective employee
}
const ELEMENT_DATA: PeriodicElement[] = [


];

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    trigger('buttonAnimation', [
      state('collapsed', style({
        width: '80px',  // replace with the initial width of the button
      })),
      state('expanded', style({
        width: '110px',  // replace with the expanded width of the button
      })),
      transition('collapsed <=> expanded', animate('300ms ease-out'))
    ]),
    trigger('checkmarkAnimation', [
      state('void', style({
        opacity: 0,
        transform: 'scale(0.5)'
      })),
      state('*', style({
        opacity: 1,
        transform: 'scale(1)'
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('300ms ease-in'))
    ]),
    trigger('tableAnimation', [
      transition('* <=> *', [
        query(':enter',
          [
            style({ opacity: 0, transform: 'translateY(-15px)' }),
            stagger('50ms', animate('550ms ease-out', style({ opacity: 1, transform: 'translateY(0px)' })))
          ], { optional: true }
        ),
        query(':leave',
          animate('50ms', style({ opacity: 0 })), { optional: true }
        )
      ])
    ]),
    trigger('removeRow', [
      state('in', style({ opacity: 1, height: '*' })),
      transition('* => void', [
        animate('300ms', style({ opacity: 0, height: '0px', margin: '0px' }))
      ]),
    ]),
  ]



})
export class HomePage implements OnInit {
  lineChartLabels: string[] = [];
  isListView = false;
  public lineChartType: ChartType = 'line';
  projects: Array<any> = new Array<any>;
  proposals: Array<any> = new Array<any>;
  isMobile: boolean = false;
  page: number = 0;
  expertAddress: any;
  categories: any;
  initialCategories: any;
  categories_length: any;
  counter: number = 0;
  status: string = "all";
  krathseis: Array<any> = new Array<any>;
  newKrathseis: Array<any> = new Array<any>;
  selectedTimeFrame: string = 'εβδομάδας';
  listView = false
  initialized: boolean = false;
  cancelReason: string = "";
  statsNumberLoading = false;
  displayedColumns: string[] = ['avatar', 'name', 'date', 'employee', 'service', 'price', 'status'];
  dataSource = ELEMENT_DATA;
  clickedRows = new Set<PeriodicElement>();
  resizeListener: any;
  pendingAppointments: any = 0;
  totalAppointments: any = 0;
  totalRevenue: any = 0;
  topClients: any = [];
  private backgroundEvents: EventInput[] = [];
  statsLoading: boolean = false;
  activeSegment: string = 'all'; // default value
  statusChosen: string = "0,0,0,0,0";
  maxMinutesPerReservation: number = 180;
  hideNewReservationButton: boolean = false;
  @ViewChild('krathshPop') krathshPop!: IonPopover;
  @ViewChild('acceptPop') acceptPop!: IonPopover;
  @ViewChild('rejectPop') rejectPop!: IonPopover;
  employees: any = [];
  startDate: any;
  endDate: any;
  dateRangeText: string = "";
  calendarDaysLength: number = 2;
  employeeIds: any = "";
  generalScheduleExceptions: any=[];
  private newAppointmentSubscription: Subscription;
  private hasNewNotificationsSubscription: Subscription;
  hasNewNotifications: boolean=false;

  constructor(private alertController: AlertController, private popoverController: PopoverController, private cdr: ChangeDetectorRef, private platform: Platform, private rout: Router, private userService: UserService, private navCtrl: NavController, private modalController: ModalController) {
    this.lastKnownMinute = new Date().getMinutes();
    setInterval(() => this.checkAndRun(), 1000);
    this.newAppointmentSubscription = this.userService.refreshAppointment$.subscribe((newAppointment) => {
      console.log("NEW APPOINTEMNT INC")
      if (newAppointment) {
        // Handle the new appointment logic here
        this.userService.refreshAppointment$.next(false);  // Reset the newAppointment flag
        console.log("Calling new appointemtns")

        this.getAppointmentsOfRange(this.startDate,this.endDate)
      }
    });

    this.hasNewNotificationsSubscription = this.userService.newNotification$.subscribe(hasNewNotif => {
      this.hasNewNotifications = hasNewNotif

    });
  }




  ngOnInit(): void {
    this.checkScreenWidth();
    this.resizeListener = this.platform.resize.subscribe(() => {
      this.checkScreenWidth();
    });

    this.userService.invokeGoToKrathseis$.subscribe(() => {
      this.goToKrathseis();
    });
  }


  ionViewWillEnter() {
    /*if (this.userService.isMobile()) {
      this.rout.navigate(['/tabs/krathseis']);
    }*/
    this.userService.sseConnect(window.location.toString());

    this.userService.getEmployeesOfExpert().subscribe(
      data => {
        this.employees = data;
        this.employeeIds = this.employees.map((employee: any) => employee.id).join(',');
        this.calendarOptions.resources = this.employees.map((employee: any) => {
          const color = this.getRandomLightColor();
          return {
            id: employee.id,
            title: employee.name + " " + employee.surname[0] + ".",
            color: color,
            borderColor: this.darkenColor(color),
            image: employee.image === "default" ? '../../assets/icon/default-profile.png' : employee.image
          };
        });
        this.changeAgendaDuration(data.length);
        this.ngAfterViewChecked();

        if (!this.startDate) {
          this.startDate = new Date();
        }
        if (!this.endDate) {
          this.endDate = new Date();
          this.endDate.setDate(this.startDate.getDate() + this.calendarDaysLength);
        }

        this.getAppointmentsOfRange(this.startDate, this.endDate);
        this.calendarComponent.getApi().setOption('locale', 'el');

        this.userService.getEmployeeWorkingPlans(this.employeeIds).subscribe(data2 => {
          this.addBackgroundEvents(data2);
          this.updateDateRangeText();

        });
      },
      err => {
        console.error(err);
      }
    );
    this.userService.getWrario().subscribe(data=>{
      this.generalScheduleExceptions=data.exceptions
   

    })

   
  }








  switchToListView() {
    this.projects = []
    this.page = 0
    this.getKrathseis(this.statusChosen);

    setInterval(() => {
      this.getKrathseis(this.statusChosen);
      this.getPendingAppointmentsNumber()

    }, 300000);
    this.getStatsNumbers(this.selectedTimeFrame);
    this.getStats(this.selectedTimeFrame);
    this.getPendingAppointmentsNumber()
    this.getTopClients();
  }


  ngOnDestroy() {
    // Cleanup the event listener when the component is destroyed
    if (this.resizeListener) {
      this.resizeListener();
    }
  }

  private checkScreenWidth(): void {
    const width = this.platform.width();
    if (width <= 500) {
      this.hideNewReservationButton = true
    } else {
      this.hideNewReservationButton = false

    }
    if (width <= 600) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  handleRefresh(event: any) {
    window.location.reload();

  }



  getTopClients() {
    this.userService.getTopClients().subscribe(data => {
      this.topClients = data;
    }, err => {

    })
  }

  getPendingAppointmentsNumber() {
    this.pendingAppointments = null;

    this.userService.getPendingAppointmentsNumber().subscribe(data => {
      this.pendingAppointments = data;
    }, err => {

    })


  }


  calculateTimeSince(dateString: string): string {
    let eventDate = new Date(dateString);
    let currentDate = new Date();
    let timeDifference = currentDate.getTime() - eventDate.getTime();
    let minutes = Math.round(timeDifference / (1000 * 60));
    if (minutes < 60) {
      return `πριν ${minutes} λεπ.`;
    }

    let hours = Math.round(timeDifference / (1000 * 60 * 60));
    if (hours < 24) {
      return `πριν ${hours} ώρ.`;
    }

    let days = Math.round(timeDifference / (1000 * 60 * 60 * 24));
    if (days < 30) {
      return `πριν ${days} ημ.`;
    }

    let months = (currentDate.getFullYear() - eventDate.getFullYear()) * 12 + (currentDate.getMonth() - eventDate.getMonth());
    return `πριν ${months} μήν.`;
  }




  async goToNotifications() {
    if(!this.isMobile){
      const modal = await this.modalController.create({
        component: NotificationsPage,
      });
      return await modal.present();
    }else{
      this.rout.navigate(['/tabs/notifications']);
    }
  
  }


  async goToProfile() {
    const modal = await this.modalController.create({
      component: EditProfilePage,
    });
    return await modal.present();
  }

  async goToClients() {
    const modal = await this.modalController.create({
      component: ClientsPage,
    });
    return await modal.present();
  }

  async goToClient(user_id: string) {
    const modal = await this.modalController.create({
      component: ClientProfilePage,
      componentProps: {
        'user_id': user_id
      }
    });
    return await modal.present();
  }


  async goToReviews() {
    const modal = await this.modalController.create({
      component: ReviewsPage,
    });
    return await modal.present();
  }

  async goToPortfolio() {
    const modal = await this.modalController.create({
      component: PortfolioPage,
    });
    return await modal.present();
  }



  async goToKrathshMobile(item: any) {
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': item
      }
    });
    modal.onWillDismiss().then((dataReturned) => {
      // Your logic here, 'dataReturned' is the data returned from modal
      if (this.userService.getNavData() == true) {
        this.page = 0;
        this.krathseis = []
        this.getKrathseis(this.statusChosen);

        //this.getKrathseisNew();

      }

    });
    return await modal.present();
  }

  async goToKrathsh(item: any) {
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': item.id
      }
    });
    modal.onWillDismiss().then((dataReturned) => {
      
      // Your logic here, 'dataReturned' is the data returned from modal
      if (this.userService.getNavData() == true || dataReturned) {
        if(this.listView){

       
        this.page = 0;
        this.krathseis = []
        this.getKrathseis(this.statusChosen);
      }else{
        this.getAppointmentsOfRange(this.startDate,this.endDate)
      }
        //this.getKrathseisNew();

      }

    });
    return await modal.present();
  }


  async newKrathsh() {
    const modal = await this.modalController.create({
      component: NewKrathshPage,
      backdropDismiss: false
    });
    modal.onDidDismiss().then((dataReturned) => {
      if (dataReturned.data == true) {
        // Your logic here, 'dataReturned' is the data returned from modal
        if (this.listView) {
          this.page = 0;
          this.krathseis = []
          this.getKrathseis(this.statusChosen);
        } else {
          this.getAppointmentsOfRange(this.startDate, this.endDate);
        }

      }
    });

    return await modal.present();
  }


  getKrathseis(status: string) {
    this.statusChosen = status
    this.dataSource = []
    this.userService.getAppointments(this.statusChosen, this.page, "upcoming", false).subscribe(data => {
      this.dataSource = [];
   

      for (let k = 0; k < data.length; k++) {
        let el = data[k];
        el[11] = el[3]
        el[3] = moment.utc(el[3]).locale("el").format('Do MMM, h:mm a');


      
        el[4] = el[4].split('$')[0] + " " + el[4].split('$')[1];
        this.krathseis.push(el);
        if (el[2] === "accepted") {
          el[2] = el[5] === "false" ? "not_checked_in" : "checked_in";
        }

        let uniqueNames = Array.from(new Set(el[6].split(',').map((name: string) => name.trim()))).join(', ');
        if (k < 5) {
          const periodicElement: PeriodicElement = {
            avatar: el[10],
            name: el[4],
            date: el[3],
            employee: uniqueNames,  // Using unique names now
            service: el[7],  // Assuming tables is a string representation of the number of tables
            status: el[2],
            price: '€' + el[9],
            id: el[0],
            serviceEmployeeMapping: this.mergeServicesForEmployees(el[8])

          };
          this.dataSource.push(periodicElement);
        }
      }



      this.cdr.detectChanges();


      this.cdr.detectChanges();


      this.initialized = true;
    }, err => {
      this.initialized = true;
    });
  }

  mergeServicesForEmployees(input: string): string {
    const serviceByEmployee = new Map<string, string[]>();

    const pairs = input.split(', ');

    for (let pair of pairs) {
      const [employeeWithParenthesis, service] = pair.split(' (');
      const employee = employeeWithParenthesis.trim(); // Cleaning up employee name
      const cleanService = service.replace(')', '');   // Removing trailing parenthesis from service name

      if (serviceByEmployee.has(employee)) {
        serviceByEmployee.get(employee)!.push(cleanService);
      } else {
        serviceByEmployee.set(employee, [cleanService]);
      }
    }

    const result = [];
    for (let [employee, services] of serviceByEmployee.entries()) {
      let combinedService = services.join(' & ');
      result.push(`${employee}. (${combinedService})`);
    }

    return result.join(', ');
  }

  noShow(appointment: any) {
    this.userService.noShow(appointment.id).subscribe(data => {
      setTimeout(() => {
        const index = this.dataSource.findIndex(e => e.id === appointment.id);
        if (index !== -1) {
          this.dataSource.splice(index, 1);
          // Since dataSource is an array, re-assign it for Angular to detect the change:
          this.dataSource = [...this.dataSource];
        }

        this.getKrathseis(this.statusChosen);

      }, 0);
      this.userService.presentToast("Η κράτηση ενημερώθηκε!", "success")

    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

    })
  }


  isAfterOneHourAgo(appointment: any): boolean {
    const foundAppointment = this.krathseis.find(a => a[0] === appointment.id);
    if (!foundAppointment) {
      return false;
    }
    const appointmentStartTime = new Date(foundAppointment[11]);
    const currentDate = new Date();
    const appointmentStartTimeMinusOneHour = new Date(appointmentStartTime.getTime() - 3600000);
    const isAfterToday = appointmentStartTime.getFullYear() > currentDate.getFullYear() ||
      (appointmentStartTime.getFullYear() === currentDate.getFullYear() && appointmentStartTime.getMonth() > currentDate.getMonth()) ||
      (appointmentStartTime.getFullYear() === currentDate.getFullYear() && appointmentStartTime.getMonth() === currentDate.getMonth() && appointmentStartTime.getDate() > currentDate.getDate());
    if (isAfterToday) {
      return true;
    }
    const isCurrentTimeAfterAppointmentTimeMinusOneHour = currentDate.getTime() > appointmentStartTimeMinusOneHour.getTime();
    if (isCurrentTimeAfterAppointmentTimeMinusOneHour) {
      return false;
    }
    return true;
  }








  getColorForStatus(status: string): string {
    switch (status) {
      case 'canceled':
        return 'danger';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'accepted':
        return 'primary';
      default:
        return 'medium';
    }
  }

  getDate(datetime: string): string {
    return moment.utc(datetime, 'Do MMM, h:mm a', 'el').format('D MMM');
  }

  getTime(datetime: string): string {
    return moment.utc(datetime, 'Do MMM, h:mm a', 'el').format('h:mm a');
  }


  getEmployees(employeeString: string): string[] {
    return employeeString.split(',').map(item => item.trim());
  }

  getAllEmployeeNames(employeeString: string): string {
    return this.getEmployees(employeeString).join(', ');
  }


  openAcceptPopover() {
    this.cancelReason = ""

    this.acceptPop.present()
  }

  closeAcceptPopover() {
    this.acceptPop.dismiss()

  }
  acceptAppointment(event: Event, appointment: any) {
    event.stopPropagation();
    this.userService.acceptAppointment(appointment.id).subscribe(data => {
      appointment.status = "not_checked_in"
      this.userService.presentToast("Η κράτηση έγινε αποδεκτή!", "success")

      setTimeout(() => {
        const index = this.dataSource.findIndex(e => e.id === appointment.id);
        if (index !== -1) {
          this.dataSource.splice(index, 1);
          // Since dataSource is an array, re-assign it for Angular to detect the change:
          this.dataSource = [...this.dataSource];
        }
      }, 300);
      this.getPendingAppointmentsNumber()
      this.getKrathseis(this.statusChosen);




    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.acceptPop.dismiss()

  }


  checkIn(appointment: any) {

    this.userService.changeCheckInStatus(appointment.id, "true").subscribe(data => {
      appointment.status = "checked_in"
      setTimeout(() => {
        const index = this.dataSource.findIndex(e => e.id === appointment.id);
        if (index !== -1) {
          this.dataSource.splice(index, 1);
          // Since dataSource is an array, re-assign it for Angular to detect the change:
          this.dataSource = [...this.dataSource];
        }

        this.getKrathseis(this.statusChosen);

      }, 700);

    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

    })



  }

  closeRejectPopover() {
    this.rejectPop.dismiss()

  }
  openRejectionPopover(event: Event, appointment: any) {
    this.cancelReason = ""
    event.stopPropagation();
    this.rejectPop.present()
  }

  applyRejectPopover(appointment_id: string) {
    this.userService.rejectAppointment(appointment_id, this.cancelReason).subscribe(data => {
      this.getKrathseis(this.statusChosen);
      this.getPendingAppointmentsNumber;
      this.userService.presentToast("Η κράτηση ακυρώθηκε!", "success")
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά. Δοκιμάστε αργότερα.", "danger")

    })
    this.rejectPop.dismiss();
    this.acceptPop.dismiss();

  }

  appendToTextArea(reason: string) {
    this.cancelReason = ""
    this.cancelReason = reason;
  }

  async goToKrathseis() {
    if (this.isMobile) {
      this.rout.navigate(['/tabs/krathseis']);
    } else {
      const modal = await this.modalController.create({
        component: KrathseisPage,
        backdropDismiss: false
      });

      // Present the modal
      await modal.present();

      // Listen for the modal to be dismissed
      const { data } = await modal.onDidDismiss();
      if (data === true) {
        // Execute the desired action when the returned data is true
        this.getKrathseis(this.statusChosen);
      }
    }
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

  isDatePassed(dateStr: string): boolean {
    const date = this.convertGreekDate(dateStr);

    return date < new Date();
  }

  shouldDisplayBadgeColumn(): boolean {
    return this.dataSource.some(data => this.isDatePassed(data.date)) && !this.isMobile;
  }


  convertGreekDate(dateStr: string): Date {
    const parts = dateStr.split(' ');

    const day = parseInt(parts[0], 10);

    const monthMap: { [key: string]: number } = {
      'Ιαν': 0, 'Φεβ': 1, 'Μαρ': 2, 'Απρ': 3, 'Μάι': 4, 'Ιουν': 5,
      'Ιουλ': 6, 'Αυγ': 7, 'Σεπ': 8, 'Οκτ': 9, 'Νοε': 10, 'Δεκ': 11
    };

    // Remove any commas
    const monthStr = parts[1].replace(',', '');

    const month = monthMap[monthStr];

    const [hour, minute] = parts[2].split(':').map(val => parseInt(val, 10));

    const finalHour = parts[3] === 'μμ' && hour !== 12 ? hour + 12 : hour;

    return new Date(new Date().getFullYear(), month, day, finalHour, minute);
  }

  getHoursLeft(date: string): string {
    const now = new Date();
    const reservationDate = this.convertGreekDate(date);
    let diffMs = now.getTime() - reservationDate.getTime(); // milliseconds since the reservation started

    if (diffMs <= 0) return "Δεν έχει ξεκινήσει ακόμη";  // If the reservation hasn't started yet.

    diffMs = Math.round(diffMs / (1000 * 60)); // Convert to minutes
    diffMs -= this.maxMinutesPerReservation;
    if (diffMs <= -60) {
      const diffHrs = Math.floor(diffMs / 60);
      return -diffHrs + ' ω';
    } else {
      return -diffMs + ' λ';
    }
  }

  getTooltipHoursLeft(date: string): string {
    const hoursLeft = this.getHoursLeft(date);

    if (hoursLeft.includes('ω')) {
      return hoursLeft.replace('ω', ' ώρες');
    } else if (hoursLeft.includes('λ')) {
      return hoursLeft.replace('λ', ' λεπτά');
    }

    return hoursLeft;
  }

  toggleTooltip(tooltip: MatTooltip, event: Event): void {
    event.stopPropagation();
    if (tooltip._isTooltipVisible()) {
      tooltip.hide();
    } else {
      tooltip.show();
    }

  }

  getAllServiceNames(services: string): string {
    return services.split(',').map(service => service.trim()).join(', ');
  }


  setView(view: string) {
    this.isListView = view === 'list';
  }

  handleDateClick(arg: any) {
    alert('date click! ' + arg.dateStr);
  }

  switchView() {
    this.listView = !this.listView
    if (this.listView) {
      this.switchToListView()
    } else {
      this.ionViewWillEnter()

    }
  }



  //Agenda

  lastKnownMinute: number = 0;

  ngAfterViewChecked() {
    if (!this.calendarContainer || !this.calendarContainer.nativeElement) {
      return; // Exit the function if calendarContainer is undefined
    }else{
      this.calendarComponent.local = 'el'
      this.addBorderToDayChange();
      this.highlightCurrentTimeElement();
    }
   
     
    

  }

  @ViewChild(FullCalendarComponent) calendarComponent: FullCalendarComponent | any;
  @ViewChild('calendarContainer') calendarContainer: ElementRef | any;

  dateExample = new Date().toISOString();
  events: EventInput[] = [

  ];

  eventsPromise: Promise<EventInput[]> | undefined;
  calendarOptions: CalendarOptions = {
    initialView: 'resourceTimeGridWeek',
    datesAboveResources: true,
    timeZone: 'local',
    plugins: [timeGridPlugin, interactionPlugin, resourceTimeGridPlugin, dayGridPlugin],
    views: {
      resourceTimeGridWeek: {
        type: 'resourceTimeGrid',
        duration: { days: 2 },
        buttonText: 'Week',
        allDaySlot: false,
      }
    },
    events: [],  // Initialize with an empty array
    eventLongPressDelay: 1000,
    resources: [],
    headerToolbar: false,
    weekends: true,
    eventDurationEditable: false,
    editable: true,
    height: 'auto',
    stickyHeaderDates: true,
    locale: elLocale,  // Use the imported locale here
    slotDuration: '00:15:00',
    slotLabelInterval: { minutes: 30 },
    slotLabelFormat: { hour: 'numeric', minute: '2-digit' },
    slotMinTime: '00:00',  // Will be dynamically updated
    slotMaxTime: '24:00',  // Will be dynamically updated
    dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' },
    datesSet: this.handleDatesSet.bind(this), // Add this line
    dateClick: this.addEvent.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventClick: this.handleEventClick.bind(this),
    dayHeaderContent: this.dayHeaderContent.bind(this),
    resourceLabelContent: this.getResourceLabelContent.bind(this),
    eventContent: this.eventContent.bind(this),
  };


  eventContent(arg: any) {
    let timeAndTitle = `<div class="event-hover" style="color: black; font-size:12px; font-weight:600;border-left:3.5px solid ${arg?.borderColor}; height:100%; padding:5px; position:relative; z-index:-1">${arg.event.title}<br><p class="event-hover" style="margin-top: 5px;font-size:1em; font-weight:400">${arg.timeText}</p></div>`;
  
    // Check if the event status is pending
    if (arg.event.extendedProps.status === 'pending') {
      // Add a striped background
      timeAndTitle = `<div class="event-hover" style="color: black; font-size:12px; font-weight:600;border-left:3.5px solid ${arg?.borderColor}; height:100%; padding:5px; position:relative; z-index:-1; background-image: linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent); background-size: 20px 20px;">${arg.event.title}<br><p class="event-hover" style="margin-top: 5px;font-size:1em; font-weight:400">${arg.timeText}</p></div>`;
    }
  
    document.body.addEventListener('mousemove', (event) => {
      this.handleMouseEnter(event, arg.event);
    });
    return { html: timeAndTitle };
  }
  
  dayHeaderContent(arg: any) {
    const date = arg.date;
    const dayOfWeek = date.toLocaleString('el-GR', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('el-GR', { month: 'long', day: 'numeric' });
    const html = `
       <div class="custom-day-header" style="display: flex; justify-content: space-between; width: 100%;margin: 5px; padding: 5px;">
       <div>
         <div style="font-weight: bold;text-align: left;">${dayOfWeek}</div>
         <div style="font-weight: normal; text-align: left;">${formattedDate}</div>
         </div>
       <div>
         <!--<div style="background:#acf3a3; border: none; font-size: 12px; font-weight:400; color:#555; border-radius: 12px; padding: 0px 10px; text-align: center;">
           Product Shipping
         </div>-->
       </div>
       </div>
    `;
    return { html: html };
  }
  getResourceLabelContent(resourceInfo:any) {
    return {
      html: `<img src="${resourceInfo?.resource?._resource?.extendedProps?.image}" style="width: 40px; height: 40px; vertical-align: middle;"> <p style="font-size: 14px; font-weight: 600; color: var(--ion-color-dark);">${resourceInfo.resource.title}</p>`
    };
  }



  handleMouseEnter(event: MouseEvent, calendarEvent: any) {
    if (this.listView) {
      return; // Exit the function if listView is true
    }
    const target = event.target as HTMLElement;
    if (this.calendarContainer.nativeElement.contains(event.target)) {
      if (target.classList.contains('fc-timegrid-slot') && target.classList.contains('fc-timegrid-slot-lane') && target.classList.contains('fc-timegrid-slot-minor') && target.getAttribute('data-time')) {
        const dataTime = target.getAttribute('data-time');
        const labelElements = document.querySelectorAll('.fc-timegrid-slot-label');
        labelElements.forEach((labelElement) => {
          if (!labelElement.classList.contains('current-time')) {
            const labelDataTime = labelElement.getAttribute('data-time');
            if (labelDataTime == dataTime) {
              labelElement.classList.add('highlighted');
              const existingDiv = labelElement.querySelector('div');
              if (!existingDiv) {
                const div = document.createElement('div');
                div.textContent = this.formatTime(dataTime);
                labelElement.appendChild(div);
              }
            } else {
              if (!labelElement.classList.contains('fc-scrollgrid-shrink')) {
                labelElement.classList.remove('highlighted');
                const existingDiv = labelElement.querySelector('div');
                if (existingDiv) {
                  existingDiv.remove();
                }
              }
            }
          }
        });
      }
      else {
        if (target.classList.contains('event-hover')) {
          var timeElement: any = target.querySelector('p.event-hover');
          if (timeElement) {
            var timeParts = timeElement.textContent.trim().split('-');
            var startTime = timeParts[0].trim();
            var [hours, minutes] = startTime.split(':');
            hours = hours.padStart(2, '0');
            var timeText = `${hours}:${minutes}:00`;
            let labelElements = document.querySelectorAll('.fc-timegrid-slot-label');
            labelElements.forEach((labelElement) => {
              if (!labelElement.classList.contains('current-time')) {
                let labelDataTime = labelElement.getAttribute('data-time');
                if (labelDataTime == timeText) {
                  if (!labelElement.classList.contains('fc-scrollgrid-shrink')) {
                    labelElement.classList.add('highlighted');
                    const existingDiv = labelElement.querySelector('div');
                    if (!existingDiv) {
                      const div = document.createElement('div');
                      div.textContent = this.formatTime(timeText);
                      labelElement.appendChild(div);
                    }
                  }
                } else {
                  if (!labelElement.classList.contains('fc-scrollgrid-shrink')) {
                    labelElement.classList.remove('highlighted');
                    const existingDiv = labelElement.querySelector('div');
                    if (existingDiv) {
                      existingDiv.remove();
                    }
                  }
                }
              }
            });
          }
        }
      }
    }
  }

  handleEventDrop(info: any) {
    const event = info.event;
    const newResource = info.newResource;
    const oldResource = info.oldEvent.getResources()[0]; // Get the old resource

    
    const originalResourceId = oldResource ? oldResource.id : null;
   

    // Show confirmation alert
    this.alertController.create({
        header: 'Επιβεβαίωση',
        message: 'Είστε σίγουρος ότι θέλετε να μετακινήσετε αυτό το ραντεβού;',
        buttons: [
            {
                text: 'Όχι',
                role: 'cancel',
                handler: () => {
                    this.getAppointmentsOfRange(this.startDate, this.endDate); // Fetch appointments again
                }
            },
            {
                text: 'Ναι',
                handler: () => {
                    const newEmployeeId = newResource ? newResource.id : originalResourceId;

                    const groupId = event.groupId;
                    const groupEvents = this.calendarComponent.getApi().getEvents().filter((e: any) => e.groupId === groupId);

                    const earliestStartTime = groupEvents.reduce((earliest: any, currentEvent: any) => {
                        const currentStartTime = moment(currentEvent.start);
                        return currentStartTime.isBefore(earliest) ? currentStartTime : earliest;
                    }, moment(event.start));

                    const updates = groupEvents.map((groupEvent: any) => {
                        const originalEmployeeId = groupEvent.getResources()[0].id || null;
                        const employeeId = newResource ? newEmployeeId : originalEmployeeId;

                        return {
                            yphresiaId: groupEvent.extendedProps.yphresiaId,
                            employeeId: employeeId
                        };
                    });

                    this.userService.saveAppointment(
                        updates,
                        earliestStartTime.format('YYYY-MM-DD'),
                        earliestStartTime.format('HH:mm:ss'),
                        "", //blank clientId because it is update so it doesnt need
                        event.id
                    ).subscribe(
                        response => {
                            this.getAppointmentsOfRange(this.startDate, this.endDate);
                            this.userService.presentToast("Η κράτηση ενημερώθηκε επιτυχώς!","success");
                        },
                        error => {
                            this.userService.presentToast("Βεβαιωθείτε ότι το μέλος της ομάδας μπορεί να κάνει όλες τις υπηρεσίες.", "danger");
                            this.getAppointmentsOfRange(this.startDate, this.endDate);
                        }
                    );
                }
            }
        ]
    }).then(alert => {
        alert.present();
    });
}


  addEvent(info: any) {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
    
    // Check if the clicked date is within a background event for the specific resource
    const clickedDate = info.date;
    const clickedResourceId = info.resource.id;
  
    // Get all events and background events for the clicked resource
    const resourceEvents = events.filter((event: { getResources: () => any[]; }) => event.getResources().some((resource: { id: any; }) => resource.id === clickedResourceId));
    
    for (let event of resourceEvents) {
      if (event.extendedProps.isBackgroundEvent) {
        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);
        if (clickedDate >= eventStart && clickedDate < eventEnd) {
          
          return;
        }
      }
    }
  
    // Ensure that the new event does not overlap with any existing events for the same resource
    for (let event of resourceEvents) {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      const clickedEndDate = new Date(clickedDate.getTime() + 30 * 60000); // Assuming new event duration is 30 minutes
  
      if ((clickedDate >= eventStart && clickedDate < eventEnd) || (clickedEndDate > eventStart && clickedEndDate <= eventEnd)) {
        
        return;
      }
    }
  
    // If the click is not on a background event and does not overlap, open the new reservation modal
    this.newKrathsh();
  }
  
  prev() {
    this.calendarComponent.getApi().prev();
    this.updateCurrentMonth();

  }

  today() {
    this.calendarComponent.getApi().today();
    this.updateCurrentMonth();
  }

  next() {
    this.calendarComponent.getApi().next();
    this.updateCurrentMonth();
  }
  updateCurrentMonth() {
    const calendarApi = this.calendarComponent.getApi();
    const currentDate = calendarApi.view.currentStart;
    const endDate = calendarApi.view.currentStart;
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    this.dateExample = `${month} ${year}`;
    this.updateDateRangeText();
    this.getAppointmentsOfRange(this.startDate, this.endDate)

  }
  onDateSelected(event: any) {
    const selectedDate = new Date(event.detail.value);
    this.calendarComponent.getApi().gotoDate(selectedDate);
    this.dismissPopover();
    this.updateDateRangeText();
  }

  dismissPopover() {
    this.popoverController.dismiss();
  }
  addBorderToDayChange() {
    if (!this.calendarContainer || !this.calendarContainer.nativeElement) {
      return; // Exit the function if calendarContainer is undefined
    }
  
    const elementsWithDataDate = Array.from(this.calendarContainer.nativeElement.querySelectorAll('[data-date]'));
    let prevDate: any = null;

    elementsWithDataDate.forEach((element: any, index: number) => {

      const currentDate = element.getAttribute('data-date');

      if (prevDate && prevDate !== currentDate) {
        if (this.calendarDaysLength == 2) {
          if (this.employees.length >= 4) {
            // Calculate the border index dynamically
            const baseIndex = 10; // Base index for 4 employees
            const extraEmployees = this.employees.length - 4;
            const borderIndex = baseIndex + (extraEmployees * 2);
  
            if (index !== this.calendarDaysLength && index !== borderIndex) {
              element.classList.add('solid-border');
            }
          }
         
        } else if (this.calendarDaysLength == 5) {
          if(this.employees.length==2){
            if (index !== this.calendarDaysLength && index !== 15) {

              element.classList.add('solid-border');
            }
          }else{
            if (index !== this.calendarDaysLength && index !== 10) {

              element.classList.add('solid-border');
            }
          }
          

        } else if (this.calendarDaysLength == 3) {
          if (index !== this.calendarDaysLength && index !== 12) {

            element.classList.add('solid-border');
          }

        }
      }
      prevDate = currentDate;
    });
  }
  highlightCurrentTimeElement() {
    const now = new Date();
    let hours = now.getHours();
    let minutes: any = now.getMinutes();
    let slotMinutes = Math.floor(minutes / 15) * 15;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(slotMinutes).padStart(2, '0');
    minutes = String(minutes).padStart(2, '0');
    const formattedExactTime = `${formattedHours}:${minutes}:00`;
    const formattedSlotTime = `${formattedHours}:${formattedMinutes}:00`;
    const labelElements = document.querySelectorAll('.fc-timegrid-slot-lane');
    if (labelElements && labelElements.length > 0) {
      labelElements.forEach((labelElement) => {
        const labelDataTime = labelElement.getAttribute('data-time');
        // formattedSlotTime
        if (labelDataTime == formattedSlotTime) {
          const existingCurrentSlot = document.querySelector('.current-slot');
          if (existingCurrentSlot) {
            existingCurrentSlot.classList.remove('current-slot');
          }
          labelElement.classList.add('current-slot');

          const existingCurrentHr: any = document.querySelector('.blue-line');
          if (existingCurrentHr) {
            existingCurrentHr.parentNode.removeChild(existingCurrentHr);
          }
          const hrElement = document.createElement('hr');
          hrElement.classList.add('blue-line');
          labelElement.appendChild(hrElement);
          const outerElements = document.querySelectorAll('.fc-timegrid-slot-label');
          const divElements = document.querySelectorAll('div.time-div');
          divElements.forEach((div: any) => {
            div.remove();
          });
          outerElements.forEach((outerElement: any) => {
            const outerElementDataTime = outerElement.getAttribute('data-time');
            // formattedSlotTime
            if (outerElementDataTime == formattedSlotTime) {
              const existingCurrentTime: any = document.querySelector('.current-time');

              if (!outerElement.classList.contains('fc-scrollgrid-shrink')) {
                if (existingCurrentTime) {
                  existingCurrentTime.classList.remove('current-time');
                }
                const existingDiv = outerElement.querySelector('div');
                if (!existingDiv) {
                  outerElement.classList.add('current-time');
                  const div = document.createElement('div');
                  // formattedExactTime
                  div.textContent = this.formatTime(formattedExactTime);
                  div.classList.add('time-div');
                  outerElement.appendChild(div);
                }
              }
              else {
                if (existingCurrentTime) {
                  existingCurrentTime.classList.remove('current-time');
                }
                outerElement.classList.add('current-time');
                const div = document.createElement('div');
                // formattedExactTime
                div.textContent = this.formatTime(formattedExactTime);
                div.classList.add('time-div');
                outerElement.appendChild(div);
              }
            }
          })
        }
      })
    }
  }
  // Function to check if the minute has changed
  checkAndRun() {
    const currentMinute = new Date().getMinutes();
    if (currentMinute !== this.lastKnownMinute) {
      this.highlightCurrentTimeElement();
      this.lastKnownMinute = currentMinute;
    }
  }
  // ngAfterViewInit() {
  //   setTimeout(() => {
  //     this.highlightCurrentTimeElement();
  //   }, 5000);
  // }

  formatTime(timeString: any) {
    const [hours, minutes] = timeString.split(':');
    const parsedHours = parseInt(hours, 10);
    const parsedMinutes = parseInt(minutes, 10);

    let formattedHours = parsedHours % 12 || 12;
    const amPm = parsedHours < 12 ? 'π.μ.' : 'μ.μ.';

    const formattedMinutes = parsedMinutes < 10 ? `0${parsedMinutes}` : parsedMinutes.toString();

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  }

  changeAgendaDuration(employees_length: number) {
    if (this.calendarOptions.views && this.calendarOptions.views['resourceTimeGridWeek']) {
      if (employees_length <= 2) {
        this.calendarDaysLength = 5

      } else if (employees_length <= 3) {
        this.calendarDaysLength = 3

      } else {
        this.calendarDaysLength = 2


      }
      this.calendarOptions.views['resourceTimeGridWeek'].duration = { days: this.calendarDaysLength };

      this.calendarOptions = { ...this.calendarOptions };
    } else {
      console.error('View "resourceTimeGridWeek" is not defined in calendarOptions.views');
    }
    // Trigger a re-render of the calendar
    this.calendarOptions = { ...this.calendarOptions };
    this.updateDateRangeText();

  }

  getRandomLightColor() {
    const letters = 'CDEF'; // Limiting to higher range to ensure lighter colors
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 4)];
    }
    return color;
  }

  darkenColor(hex: string, amount: number = 40) {
    let usePound = false;

    if (hex[0] === "#") {
      hex = hex.slice(1);
      usePound = true;
    }

    let num = parseInt(hex, 16);

    let r = (num >> 16) - amount;
    let b = ((num >> 8) & 0x00FF) - amount;
    let g = (num & 0x0000FF) - amount;

    r = r < 0 ? 0 : r;
    b = b < 0 ? 0 : b;
    g = g < 0 ? 0 : g;

    const newColor = (r << 16) | (b << 8) | g;
    return (usePound ? "#" : "") + newColor.toString(16).padStart(6, '0');
  }
  getAppointmentsOfRange(startDate: Date, endDate: Date) {
    if (!startDate || !endDate) {
      console.error('startDate or endDate is undefined');
      return;
    }
  
    const formattedStartDate = this.formatDateForAPI(startDate);
    const formattedEndDate = this.formatDateForAPI(endDate);
    const calendarApi = this.calendarComponent.getApi();
    
    this.userService.getAppointmentsRange(formattedStartDate, formattedEndDate).subscribe(
      data => {
        // Clear only appointment events
        const allEvents = calendarApi.getEvents();
        allEvents.forEach((event: { extendedProps: { isBackgroundEvent: any; }; remove: () => void; }) => {
          if (!event.extendedProps.isBackgroundEvent) {
            event.remove();
          }
        });
        this.events = this.transformToEventInput(data);
  
        // Merge and update the calendar with all events
        this.mergeAndSetEvents();
      },
      err => {
        // Clear only appointment events in case of error
        const allEvents = calendarApi.getEvents();
        allEvents.forEach((event: { extendedProps: { isBackgroundEvent: any; }; remove: () => void; }) => {
          if (!event.extendedProps.isBackgroundEvent) {
            event.remove();
          }
        });
        console.error('Error fetching appointments:', err);
      }
    );
  }
  




  formatDateForAPI(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      console.error('Invalid date provided:', date);
      return '';
    }
    return formatDate(date, 'yyyy-MM-dd', 'el-GR');
  }


  handleDatesSet(arg: any) {
    this.startDate = arg.start;
    this.endDate = arg.end;
    this.updateDateRangeText(this.startDate, this.endDate);

    // Fetch appointments for the new date range
    this.getAppointmentsOfRange(this.startDate, this.endDate);
  }



  updateDateRangeText(start?: Date, end?: Date) {
    const calendarApi = this.calendarComponent.getApi();
    const view = calendarApi.view;
    
    
    const startDate = start || view.activeStart;
    const endDate = end ? new Date(end) : new Date(startDate);

    endDate.setDate(endDate.getDate() + this.calendarDaysLength);

    // Subtract one day from the endDate
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() - 1);

    const startDay = formatDate(startDate, 'dd', 'el');
    const endDay = formatDate(adjustedEndDate, 'dd', 'el');
    const monthYear = formatDate(adjustedEndDate, 'MMMM yyyy', 'el');

    this.dateRangeText = `${startDay}-${endDay} ${monthYear}`;
  }

  transformToEventInput(data: any[]): EventInput[] {
    return data.map(appointment => {
      const resource = this.calendarComponent.getApi().getResourceById(appointment.resourceId);
      const backgroundColor = resource ? resource.extendedProps.color : '#b7d7d7';
      const borderColor = resource ? resource.extendedProps.borderColor : '#b7d7d7';
  
      return {
        id: appointment.appointmentId, // Use appointmentId as the event ID
        groupId: appointment.appointmentId,
        title: appointment.title.replace("$", " ") || 'No Title',
        start: this.formatDateForIncomingAPI(appointment.start),
        end: this.formatDateForIncomingAPI(appointment.end),
        backgroundColor: backgroundColor,  // Use resource background color
        borderColor: borderColor,  // Use resource border color
        resourceIds: [appointment.resourceId],  // Ensure this is an array
        extendedProps: {
          employeeAppointmentId: appointment.employeeAppointmentId, // Add employeeAppointmentId as an extra property,
          yphresiaId: appointment.yphresiaId,
          status: appointment.status // Include the status in the extendedProps
        }
      };
    });
  }

  




  formatDateForIncomingAPI(date: any): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Europe/Athens',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };

    const dateTimeFormat = new Intl.DateTimeFormat('en-GB', options);

    // Format the date in the Greek timezone
    const [
      { value: day }, ,
      { value: month }, ,
      { value: year }, ,
      { value: hour }, ,
      { value: minute }, ,
      { value: second }
    ] = dateTimeFormat.formatToParts(new Date(date));

    // Construct ISO string
    const isoString = `${year}-${month}-${day}T${hour}:${minute}:${second}`;

    return isoString;
  }
  printRenderedEvents() {
    const calendarApi = this.calendarComponent.getApi();
    const events = calendarApi.getEvents();
    const resources = calendarApi.getResources();

    
    events.forEach((event: { id: any; title: any; start: any; end: any; getResources: () => any[]; }) => {
      
    });

    
    resources.forEach((resource: { id: any; title: any; }) => {
      
    });
  }


  async handleEventClick(info: any) {
    // Check if the clicked event is a background event
    if (info.event.extendedProps.isBackgroundEvent) {
      
      return;
    }

    const eventId = info.event.id;
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': eventId
      }
    });
    modal.onWillDismiss().then((dataReturned) => {
      if (this.userService.getNavData() == true || dataReturned) {
        this.getAppointmentsOfRange(this.startDate, this.endDate);
      }
    });
    return await modal.present();
  }
  
  addBackgroundEvents(workingPlans: any[]) {
    const backgroundEvents: EventInput[] = [];
    let minStartTime = '24:00';
    let maxEndTime = '00:00';

    const daysOfWeek = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];

    // Get the current background event color from the Ionic CSS variable
    const backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-medium').trim();

    workingPlans.forEach(plan => {
        const resourceId = plan.objectId; // Assuming each working plan has an objectId
        const daysWithSchedule: { [key: string]: boolean } = {};

        plan.personSchedule.forEach((schedule: any) => {
            daysWithSchedule[schedule.day] = true;
            const unavailableIntervals = this.getUnavailableIntervals(schedule.intervals);
            unavailableIntervals.forEach((interval: string) => {
                const [start, end] = interval.split('-');
                backgroundEvents.push({
                    resourceId: resourceId, // Assign resourceId to each event
                    startTime: start,
                    endTime: end,
                    daysOfWeek: [this.getDayOfWeek(schedule.day)],
                    display: 'background',
                    color: backgroundColor, // Use Ionic CSS variable for color
                    editable: false,
                    extendedProps: {
                        isBackgroundEvent: true // Custom property to indicate background event
                    }
                });

                // Update minStartTime and maxEndTime based on the available intervals
                schedule.intervals.forEach((availableInterval: string) => {
                    const [availableStart, availableEnd] = availableInterval.split('-');
                    if (availableStart < minStartTime) {
                        minStartTime = availableStart;
                    }
                    if (availableEnd > maxEndTime) {
                        maxEndTime = availableEnd;
                    }
                });
            });
        });

        // Block days not in the schedule
        daysOfWeek.forEach((day, index) => {
            if (!daysWithSchedule[day]) {
                backgroundEvents.push({
                    resourceId: resourceId, // Assign resourceId to each event
                    startTime: '00:00',
                    endTime: '24:00',
                    daysOfWeek: [index],
                    display: 'background',
                    color: backgroundColor, // Use Ionic CSS variable for color
                    editable: false,
                    extendedProps: {
                        isBackgroundEvent: true // Custom property to indicate background event
                    }
                });
            }
        });

        if (plan.exceptions) {
            plan.exceptions.forEach((exception: any) => {
                const start = new Date(exception.start);
                const end = new Date(exception.end);
                end.setHours(end.getHours()); // Manually add 1 hour to the end time

                backgroundEvents.push({
                    resourceId: resourceId, // Assign resourceId to each event
                    start: start.toISOString(),
                    end: end.toISOString(),
                    display: 'background',
                    color: backgroundColor, // Use Ionic CSS variable for color
                    editable: false,
                    extendedProps: {
                        isBackgroundEvent: true // Custom property to indicate background event
                    }
                });
            });
        }
    });

    // Add general schedule exceptions
    if (this.generalScheduleExceptions) {
        this.generalScheduleExceptions.forEach((exception: any) => {
            const start = new Date(exception.start);
            const end = new Date(exception.end);
            end.setHours(end.getHours()); // Manually add 1 hour to the end time

            backgroundEvents.push({
                start: start.toISOString(),
                end: end.toISOString(),
                display: 'background',
                color: backgroundColor, // Use Ionic CSS variable for color
                editable: false,
                extendedProps: {
                    isBackgroundEvent: true // Custom property to indicate background event
                }
            });
        });
    }

    // Store background events
    this.backgroundEvents = backgroundEvents;

    // Set minStartTime and maxEndTime for the calendar
    this.calendarOptions.slotMinTime = minStartTime;
    this.calendarOptions.slotMaxTime = maxEndTime;

    // Merge and update the calendar with all events
    this.mergeAndSetEvents();
}




  convertToLocalTimezone(dateString: string): Date {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate;
  }


  mergeAndSetEvents() {
    const mergedEvents = [...this.events, ...this.backgroundEvents];

    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(mergedEvents);

    // Apply the updated options
    calendarApi.setOption('slotMinTime', this.calendarOptions.slotMinTime);
    calendarApi.setOption('slotMaxTime', this.calendarOptions.slotMaxTime);
    calendarApi.setOption('events', mergedEvents);

    this.cdr.detectChanges();
  }


  getUnavailableIntervals(availableIntervals: string[]): string[] {
    const fullDayStart = '00:00';
    const fullDayEnd = '24:00';
    let lastEnd = fullDayStart;

    const unavailableIntervals = availableIntervals.reduce((acc: string[], interval: string) => {
      const [start, end] = interval.split('-');
      if (start > lastEnd) {
        acc.push(`${lastEnd}-${start}`);
      }
      lastEnd = end;
      return acc;
    }, []);

    if (lastEnd < fullDayEnd) {
      unavailableIntervals.push(`${lastEnd}-${fullDayEnd}`);
    }

    return unavailableIntervals;
  }

  getDayOfWeek(day: string): number {
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    return days.indexOf(day);
  }




};





