import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonPopover, ModalController, NavController, Platform } from '@ionic/angular';
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
import elLocale from '@fullcalendar/core/locales/el';


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
  statsLoading: boolean = false;
  activeSegment: string = 'all'; // default value
  statusChosen: string = "0,0,0,0,0";
  maxMinutesPerReservation: number = 180;
  hideNewReservationButton: boolean = false;
  @ViewChild('krathshPop') krathshPop!: IonPopover;
  @ViewChild('acceptPop') acceptPop!: IonPopover;
  @ViewChild('rejectPop') rejectPop!: IonPopover;
  constructor(private popoverController: PopoverController, private cdr: ChangeDetectorRef, private platform: Platform, private rout: Router, private userService: UserService, private navCtrl: NavController, private modalController: ModalController) {
    this.lastKnownMinute = new Date().getMinutes();
    setInterval(() => this.checkAndRun(), 1000);
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
    if (this.userService.isMobile()) {
      this.rout.navigate(['/tabs/krathseis']);
    }
    //this.ngAfterViewChecked();


  }

  switchToListView() {
    this.projects = []
    this.page = 0
    this.userService.sseConnect(window.location.toString());
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



  public newNotification() {
    return this.userService.newNotification;
  }



  async goToNotifications() {
    const modal = await this.modalController.create({
      component: NotificationsPage,
    });
    return await modal.present();
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
      if (this.userService.getNavData() == true) {
        this.page = 0;
        this.krathseis = []
        this.getKrathseis(this.statusChosen);

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
      console.log(dataReturned)
      if (dataReturned.data == true) {
        // Your logic here, 'dataReturned' is the data returned from modal
        this.page = 0;
        this.krathseis = []
        this.getKrathseis(this.statusChosen);
      }
    });

    return await modal.present();
  }


  getKrathseis(status: string) {
    this.statusChosen = status
    this.dataSource = []
    this.userService.getAppointments(this.statusChosen, this.page, "upcoming", false).subscribe(data => {
      this.dataSource = [];
      console.log(data)
      console.log("HIIII2")

      for (let k = 0; k < data.length; k++) {
        let el = data[k];
        el[11] = el[3]
        el[3] = moment.utc(el[3]).locale("el").format('Do MMM, h:mm a');


        console.log("HIIII")
        console.log(el[3].split('+')[0])
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
      case 'completed':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'pending':
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
      this.userService.presentToast("Η κράτηση έγινε accepted!", "success")

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
      //this.ngAfterViewChecked()

    }
  }





  //Agenda

  lastKnownMinute: number = 0;

  ngAfterViewChecked() {
    this.addBorderToDayChange();
    this.highlightCurrentTimeElement();
  }

  @ViewChild(FullCalendarComponent) calendarComponent: FullCalendarComponent | any;
  @ViewChild('calendarContainer') calendarContainer: ElementRef | any;

  dateExample = new Date().toISOString();
  events: EventInput[] = [
    {
      id: 'event1',
      title: 'Product team mtg',
      start: '2024-05-14T10:00:00',
      end: '2024-05-14T11:00:00',
      backgroundColor: '#FADCD2',
      resourceId: 'b',
      borderColor: '#F7C4B4'
    },
    {
      id: 'event2',
      title: 'Quick mtg with Martin',
      start: '2024-05-15T08:00:00',
      end: '2024-05-15T09:00:00',
      backgroundColor: '#DDF7DF',
      resourceId: 'b',
      borderColor: '#C6F1C9'
    },
    {
      id: 'event3',
      title: 'Business software',
      start: '2024-05-22T10:00:00',
      end: '2024-05-22T11:00:00',
      backgroundColor: '#F1E3F5',
      resourceId: 'c',
      borderColor: '#E8D0EF'
    }
  ];
  eventsPromise: Promise<EventInput[]> | undefined;
  calendarOptions: CalendarOptions = {
    timeZone: 'local',
    locale: elLocale,
    initialView: 'resourceTimeGridWeek',
    datesAboveResources: true,
    plugins: [timeGridPlugin, interactionPlugin, resourceTimeGridPlugin, dayGridPlugin],
    views: {
      resourceTimeGridWeek: {
        type: 'resourceTimeGrid',
        duration: { days: 2 },
        buttonText: 'Week',
        allDaySlot: false
      }
    },
    events: this.events,
    eventLongPressDelay: 1000,
    resources: [
      { id: 'a', title: 'Ryan', color: '#FADCD2', borderColor: '#F7C4B4', image: '../../assets/ryan.png' },
      { id: 'b', title: 'Kate', color: '#DDF7DF', borderColor: '#C6F1C9', image: '../../assets/kate.png' },
      { id: 'c', title: 'John', color: '#F1E3F5', borderColor: '#E8D0EF', image: '../../assets/john.png' },
      { id: 'd', title: 'John', color: '#F1E3F5', borderColor: '#E8D0EF', image: '../../assets/john.png' },
      { id: 'e', title: 'John', color: '#F1E3F5', borderColor: '#E8D0EF', image: '../../assets/john.png' },
      { id: 'f', title: 'John', color: '#F1E3F5', borderColor: '#E8D0EF', image: '../../assets/john.png' },

    ],
    headerToolbar: false,
    weekends: true,
    editable: true,
    height: 'auto',
    stickyHeaderDates: true,
    slotDuration: '00:15:00',
    //slotLabelInterval: { hour: 1 },
    //slotLabelFormat: { hour: 'numeric' },

    slotLabelInterval: { minutes: 30 },
    slotLabelFormat: { hour: 'numeric', minute: '2-digit' },
    slotMinTime: '08:00',
    slotMaxTime: '24:00',
    dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' },
    dateClick: this.addEvent.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    dayHeaderContent: this.dayHeaderContent.bind(this),
    resourceLabelContent: this.getResourceLabelContent.bind(this),
    eventContent: this.eventContent.bind(this),
    eventResize: this.eventResize.bind(this),
  };
  eventContent(arg: any) {
    const timeAndTitle = `<div class="event-hover" style="color: black; font-size:12px; font-weight:600;border-left:5px solid ${arg?.borderColor}; height:100%; padding:5px; position:relative; z-index:-1">${arg.event.title}<br><p class="event-hover" style="margin-top: 5px;font-size:1em; font-weight:400">${arg.timeText}</p></div>`;
    document.body.addEventListener('mousemove', (event) => {
      this.handleMouseEnter(event, arg.event);
    });
    return { html: timeAndTitle };
  }
  dayHeaderContent(arg: any) {
    const date = arg.date;
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const html = `
       <div class="custom-day-header" style="display: flex; justify-content: space-between; width: 100%;margin: 5px; padding: 5px;">
       <div>
         <div style="font-weight: bold;">${dayOfWeek}</div>
         <div style="font-weight: normal; text-align: left;">${formattedDate}</div>
         </div>
       <div>
         <div style="background:#acf3a3; border: none; font-size: 12px; font-weight:400; color:#555; border-radius: 12px; padding: 0px 10px; text-align: center;">
           Product Shipping
         </div>
       </div>
       </div>
    `;
    return { html: html };
  }
  getResourceLabelContent(resourceInfo: any) {
    return {
      html: `<img src="${resourceInfo?.resource?._resource?.extendedProps?.image}" style="width: 40px; height: 40px; vertical-align: middle;"> <p style="font-size: 14px; font-weight:600; color: #000;">${resourceInfo.resource.title}</p>`
    };
  }


  handleMouseEnter(event: MouseEvent, calendarEvent: any) {

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
  eventResize(info: any) {
    this.handleEventDrop(info)
  }
  handleEventDrop(info: any) {
    const event = info.event;
    const newResource = info.newResource;
    const index = this.events.findIndex((e: any) => e.id === event.id);
    if (index !== -1) {
      this.events[index].start = event.start;
      this.events[index].end = event.end;
    }
    if (newResource) {
      event.setExtendedProp('resourceId', newResource.id);
      const newColor = newResource.extendedProps.color;
      const newBorderColor = newResource.extendedProps.borderColor;
      event.setProp('backgroundColor', newColor);
      event.setProp('borderColor', newBorderColor);
      this.events[index].resourceId = newResource.id;
      this.events[index].backgroundColor = newColor;
      this.events[index].borderColor = newBorderColor;
    }
    this.calendarOptions.events = this.events;
  }

  addEvent(info: any) {
    if (info.jsEvent.detail === 2 || info.jsEvent.type === 'touchend') {
      const startTime = new Date(info.date);
      startTime.setMinutes(0);
      startTime.setSeconds(0);
      startTime.setMilliseconds(0);

      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
      const newEvent: EventInput = {
        id: 'event' + (this.events.length + 1),
        title: 'New Event',
        start: startTime,
        end: endTime.toISOString(),
        backgroundColor: info.resource.extendedProps.color,
        resourceId: info.resource.id,
        borderColor: info.resource?.extendedProps?.borderColor
      };
      this.events = [...this.events, newEvent];
      this.calendarOptions.events = this.events;
    }
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
    const month = currentDate.toLocaleString('default', { month: 'short' });
    const year = currentDate.getFullYear();
    this.dateExample = `${month} ${year}`;
  }
  onDateSelected(event: any) {
    const selectedDate = new Date(event.detail.value);
    this.calendarComponent.getApi().gotoDate(selectedDate);
    this.dismissPopover();
  }

  dismissPopover() {
    this.popoverController.dismiss();
  }
  addBorderToDayChange() {
    const elementsWithDataDate = Array.from(this.calendarContainer.nativeElement.querySelectorAll('[data-date]'));
    let prevDate: any = null;
    elementsWithDataDate.forEach((element: any, index: number) => {

      const currentDate = element.getAttribute('data-date');

      if (prevDate && prevDate !== currentDate) {
        if (index !== 5 && index !== 20) {

          element.classList.add('solid-border');
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
};





