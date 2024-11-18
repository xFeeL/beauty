import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { ThemeService } from 'src/app/services/theme.service';
import { TeamServicesPromptPage } from '../team-services-prompt/team-services-prompt.page';
import { NotificationPromptPage } from '../notification-prompt/notification-prompt.page';

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
  changeDetection: ChangeDetectionStrategy.OnPush,

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
  generalScheduleExceptions: any = [];
  private newAppointmentSubscription: Subscription;
  private hasNewNotificationsSubscription: Subscription;
  hasNewNotifications: boolean = false;
  fullCalendarWidth: string = "auto";

  constructor( private router: Router, private themeService: ThemeService, private alertController: AlertController, private popoverController: PopoverController, private cdr: ChangeDetectorRef, private platform: Platform, private rout: Router, private userService: UserService, private navCtrl: NavController, private modalController: ModalController) {
    this.lastKnownMinute = new Date().getMinutes();
    setInterval(() => this.checkAndRun(), 1000);
    this.newAppointmentSubscription = this.userService.refreshAppointment$.subscribe((newAppointment) => {
      if (newAppointment) {
        // Handle the new appointment logic here
        this.userService.refreshAppointment$.next(false);  // Reset the newAppointment flag
        this.getAppointmentsOfRange(this.startDate, this.endDate);
        this.cdr.markForCheck(); // Add this line
      }
    });

    this.hasNewNotificationsSubscription = this.userService.newNotification$.subscribe(hasNewNotif => {
      this.hasNewNotifications = hasNewNotif;
      this.cdr.markForCheck(); // Add this line
    });
  }

  notificationPromptPWA() {


    const isIos =this.platform.is('ios');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    if (  isPWA) {
      this.goToNotificationPrompt()
    }
  }

  ngOnInit(): void {
    this.notificationPromptPWA()
    this.checkScreenWidth();
    this.resizeListener = this.platform.resize.subscribe(() => {
      this.checkScreenWidth();
      this.cdr.markForCheck(); // Add this line
    });

    this.userService.checkOnBoardingStatus().subscribe(data => {

    }, err => {
      this.rout.navigate(['/onboarding']);
    })
    this.userService.invokeGoToKrathseis$.subscribe(() => {
      this.goToKrathseis();
      this.cdr.markForCheck(); // Add this line
    });
  }

  ionViewWillEnter() {
    const currentUrl = this.router.url;

    if (currentUrl === '/successful-payment') {
      this.userService.presentToast("Η πληρωμή ήταν επιτυχής!", "success");
    } else if (currentUrl === '/failed-payment') {
      this.userService.presentToast("Η πληρωμή απέτυχε. Παρακαλώ προσπαθήστε ξανά.", "danger");
    }
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
          this.cdr.markForCheck(); // Add this line
        });
      },
      err => {
        console.error(err);
      }
    );
    this.userService.getWrario().subscribe(data => {
      this.generalScheduleExceptions = data.exceptions;
      this.cdr.markForCheck(); // Add this line
    });
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
        this.getAppointmentsOfRange(this.startDate, this.endDate);

      }
    }
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

 async goToNotificationPrompt() {
  const hasAcceptedNotifications = localStorage.getItem('pushNotificationsAccepted');
  if(!hasAcceptedNotifications){
    const modal = await this.modalController.create({
      component: NotificationPromptPage,
    });
    return await modal.present();
  
  }
     

  }



  async goToNotifications() {
    if (!this.isMobile) {
      const modal = await this.modalController.create({
        component: NotificationsPage,
      });
      return await modal.present();
    } else {
      this.rout.navigate(['/tabs/notifications']);
    }

  }


  async goToKrathsh(item: any) {
    const modal = await this.modalController.create({
      component: KrathshPage,
      componentProps: {
        'appointment_id': item.id
      }
    });
    modal.onWillDismiss().then((dataReturned) => {
      this.getAppointmentsOfRange(this.startDate, this.endDate)
    });
    return await modal.present();
  }


  async newKrathsh() {
    if (this.employees.length == 0) {
      this.promptTeamServices()
    } else {
      const modal = await this.modalController.create({
        component: NewKrathshPage,
        backdropDismiss: false
      });
      modal.onDidDismiss().then((dataReturned) => {
        if (dataReturned.data == true) {
          // Your logic here, 'dataReturned' is the data returned from modal

          this.getAppointmentsOfRange(this.startDate, this.endDate);


        }
      });

      return await modal.present();
    }

  }

  async promptTeamServices() {
    const modal = await this.modalController.create({
      component: TeamServicesPromptPage,

    });
    modal.onWillDismiss().then((dataReturned) => {


    });
    return await modal.present();
  }




  //Agenda

  lastKnownMinute: number = 0;

  ngAfterViewChecked() {
    if (!this.calendarContainer || !this.calendarContainer.nativeElement) {
      return; // Exit the function if calendarContainer is undefined
    } else {
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
  getResourceLabelContent(resourceInfo: any) {
    return {
      html: `<img src="${resourceInfo?.resource?._resource?.extendedProps?.image}" style="width: 45px; height: 45px; vertical-align: middle;"> <p style="font-size: 14px; font-weight: 600; color: var(--ion-color-dark);">${resourceInfo.resource.title}</p>`
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
                this.userService.presentToast("Η κράτηση ενημερώθηκε επιτυχώς!", "success");
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
          if (this.employees.length == 2) {
            if (index !== this.calendarDaysLength && index !== 15) {

              element.classList.add('solid-border');
            }
          } else {
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
        this.calendarDaysLength = 4

      } else if (employees_length <= 3) {
        this.calendarDaysLength = 3

      } else {
        this.calendarDaysLength = 2


      }
      if (this.isMobile) {
        this.calendarDaysLength = 1
        if (employees_length <= 2) {
          this.fullCalendarWidth = "auto";
        } else {
          this.fullCalendarWidth = `${20 + (employees_length - 2) * 15}em`; // Increase by 15em for each employee after 2
        }
        document.documentElement.style.setProperty('--full-calendar-width', this.fullCalendarWidth);

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
        this.cdr.markForCheck(); // Add this line
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
        this.cdr.markForCheck(); // Add this line
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

    if (startDay === endDay && formatDate(startDate, 'MMMM yyyy', 'el') === monthYear) {
      this.dateRangeText = `${startDay} ${monthYear}`;
    } else {
      this.dateRangeText = `${startDay}-${endDay} ${monthYear}`;
    }
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
    console.log(workingPlans)
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
      console.log(this.generalScheduleExceptions)
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

    this.cdr.detectChanges(); // Add this line
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





