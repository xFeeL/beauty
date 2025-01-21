import { ChangeDetectionStrategy, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
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
import { interval, Subject, Subscription, takeUntil } from 'rxjs';
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
  private mouseMoveListener!: () => void;
  private destroy$ = new Subject<void>();


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
  calendarDaysLength: number = 1;
  employeeIds: any = "";
  generalScheduleExceptions: any = [];
  private newAppointmentSubscription: Subscription;
  private hasNewNotificationsSubscription: Subscription;
  hasNewNotifications: boolean = false;
  fullCalendarWidth: string = "auto";
  private timerSubscription: Subscription;

  constructor(private renderer: Renderer2, private router: Router, private themeService: ThemeService, private alertController: AlertController, private popoverController: PopoverController, private cdr: ChangeDetectorRef, private platform: Platform, private rout: Router, private userService: UserService, private navCtrl: NavController, private modalController: ModalController) {
    this.lastKnownMinute = new Date().getMinutes();
    this.timerSubscription = interval(60000) // 60,000 ms = 1 minute
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.checkAndRun();
      });
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


    const isIos = this.platform.is('ios');
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    if (isIos && isPWA) {
      this.goToNotificationPrompt()
    }
  }

  ngOnInit(): void {
    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', (event) => {
      this.handleMouseEnter(event);
    });
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

    // Fetch general exceptions first
    this.userService.getWrarioGeneralExceptions().subscribe(
      data => {
        console.log('General Exceptions fetched:', data); // Debugging Log
        this.generalScheduleExceptions = data;
        this.cdr.markForCheck(); // Update view

        // Now fetch employees
        this.userService.getEmployeesOfExpert().subscribe(
          employeesData => {
            console.log('Employees fetched:', employeesData); // Debugging Log
            this.employees = employeesData;
            this.employeeIds = this.employees.map((employee: any) => employee.id).join(',');
            this.calendarOptions.resources = this.employees.map((employee: any) => {
              const color = this.getRandomLightColor();
              return {
                id: employee.id,
                title: `${employee.name} ${employee.surname[0]}.`,
                color: color,
                borderColor: this.darkenColor(color),
                image: employee.image === "default" ? '../../assets/icon/default-profile.png' : employee.image
              };
            });
            this.changeAgendaDuration(this.employees.length);
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

            // Fetch employee working plans after employees are loaded
            this.userService.getEmployeeWorkingPlans(this.employeeIds).subscribe(
              workingPlansData => {
                console.log('Employee Working Plans fetched:', workingPlansData); // Debugging Log
                this.addBackgroundEvents(workingPlansData);
                this.updateDateRangeText();
                this.cdr.markForCheck();
              },
              err => {
                console.error('Error fetching employee working plans:', err);
              }
            );
          },
          err => {
            console.error('Error fetching employees:', err);
          }
        );
      },
      err => {
        console.error('Error fetching general schedule exceptions:', err);
      }
    );
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
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();

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
    if (!hasAcceptedNotifications) {
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
    //eventResize: this.handleEventResize.bind(this),
  };


  eventContent(arg: any) {
    const yphresiaName = arg.event.extendedProps.yphresiaName || '';

    let timeAndTitle = `
      <div class="event-container" style="position: relative; padding: 5px; border-left: 3.5px solid ${arg.borderColor}; height: 100%; color: black;">
        <div class="event-title" style="font-size: 12px; font-weight: 600;">${arg.event.title}</div>
        <div class="event-service" style="font-size: 11px; font-weight: 400;">${yphresiaName}</div>
        <div class="event-time" style="font-size: 11px; font-weight: 400;">${arg.timeText}</div>
        <!--
        <div class="resize-handle" style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 4px; background: gray; border-radius: 2px; cursor: ns-resize;">
        </div>
        -->
      </div>
    `;

    return { html: timeAndTitle };
  }


  handleEventResize(info: any) {
    const event = info.event;

    // Get the employeeAppointmentId from the extendedProps
    const employeeAppointmentId = event.extendedProps.employeeAppointmentId;

    // Get the new start and end times
    const newStart = event.start.toISOString();
    const newEnd = event.end.toISOString();

    // Confirm with the user
    this.alertController.create({
      header: 'Επιβεβαίωση',
      message: 'Είστε σίγουρος ότι θέλετε να αλλάξετε το χρονικό διάστημα αυτής της υπηρεσίας;',
      buttons: [
        {
          text: 'Όχι',
          role: 'cancel',
          handler: () => {
            // Revert changes
            info.revert();
          }
        },
        {
          text: 'Ναι',
          handler: () => {
            // Save changes to backend
            /* this.userService.updateEmployeeAppointment(
               employeeAppointmentId,
               newStart,
               newEnd
             ).subscribe(
               response => {
                 this.getAppointmentsOfRange(this.startDate, this.endDate);
                 this.userService.presentToast("Η υπηρεσία ενημερώθηκε επιτυχώς!", "success");
               },
               error => {
                 this.userService.presentToast("Σφάλμα κατά την ενημέρωση της υπηρεσίας.", "danger");
                 this.getAppointmentsOfRange(this.startDate, this.endDate);
               }
             );*/
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
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



  handleMouseEnter(event: MouseEvent) {

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
      /*if (employees_length <= 2) {
        this.calendarDaysLength = 1

      } else if (employees_length <= 3) {
        this.calendarDaysLength = 1

      } else {
        this.calendarDaysLength = 1


      }*/
      this.calendarDaysLength = 1

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
    this.dateRangeText = `${startDay} ${monthYear}`;

    /*if (startDay === endDay && formatDate(startDate, 'MMMM yyyy', 'el') === monthYear) {
      this.dateRangeText = `${startDay} ${monthYear}`;
    } else {
      this.dateRangeText = `${startDay}-${endDay} ${monthYear}`;
    }*/
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
          appointmentId: appointment.appointmentId, // Keep for reference
          employeeAppointmentId: appointment.employeeAppointmentId,
          yphresiaId: appointment.yphresiaId,
          yphresiaName: appointment.yphresiaName, // Add yphresiaName here
          status: appointment.status
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

  // In addBackgroundEvents method, modify the logic:
  // In addBackgroundEvents method
  addBackgroundEvents(workingPlans: any[]) {
    const backgroundEvents: EventInput[] = [];
    const daysOfWeek = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
  
    // Ορισμός global ορίων για τις διαθέσιμες ώρες.
    let globalEarliestStart = '24:00';
    let globalLatestEnd = '00:00';
  
    console.log('--- Add Background Events: Starting processing ---');
  
    workingPlans.forEach(plan => {
      const resourceId = plan.objectId;
      const daysWithSchedule: { [key: string]: boolean } = {};
      let unavailableIntervals: { dayName: string; start: string; end: string }[] = [];
  
      console.log(`\nProcessing Working Plan for Employee ID: ${resourceId}`);
  
      // 1. Δημιουργία αρχικών "unavailable" intervals με βάση το personSchedule.
      plan.personSchedule.forEach((schedule: any) => {
        const dayName = schedule.day;
        daysWithSchedule[dayName] = true;
        const availableIntervals = schedule.intervals; // π.χ. ["09:00-17:00"]
        console.log(`  Schedule for ${dayName} available intervals: ${availableIntervals.join(', ')}`);
  
        const computedUnavailable = this.getUnavailableIntervals(availableIntervals, dayName);
        console.log(`    Computed base unavailable for ${dayName}:`, JSON.stringify(computedUnavailable));
        unavailableIntervals = unavailableIntervals.concat(computedUnavailable);
  
        // Ενημέρωση global ορίων από τα διαθέσιμα intervals.
        availableIntervals.forEach((interval: string) => {
          const [start, end] = interval.split('-');
          if (start < globalEarliestStart) { 
            globalEarliestStart = start; 
          }
          if (end > globalLatestEnd) { 
            globalLatestEnd = end; 
          }
        });
      });
  
      // Εάν κάποια ημέρα δεν έχει schedule, αποκλείστε ολόκληρη την ημέρα.
      daysOfWeek.forEach(day => {
        if (!daysWithSchedule[day]) {
          console.log(`  No schedule for ${day} so blocking full day.`);
          unavailableIntervals.push({ dayName: day, start: '00:00', end: '24:00' });
        }
      });
  
      console.log(`  Unavailable intervals after base schedule for Employee ${resourceId}:`, JSON.stringify(unavailableIntervals));
  
      // 2. Επεξεργασία γενικών (general) exceptions (όπου δεν είναι διαθέσιμες).
      const closedGeneralExceptions = this.generalScheduleExceptions.filter((ex: any) => !ex.available);
      console.log(`  Found ${closedGeneralExceptions.length} general closed exception(s):`, JSON.stringify(closedGeneralExceptions));
      closedGeneralExceptions.forEach((exception: any) => {
        const exStart = new Date(exception.startDatetime);
        const exEnd   = new Date(exception.endDatetime);
        const totalDays = Math.ceil((exEnd.getTime() - exStart.getTime()) / (1000 * 60 * 60 * 24));
        for (let i = 0; i < totalDays; i++) {
          let curDay = new Date(exStart);
          curDay.setDate(curDay.getDate() + i);
          const curDayStr = curDay.toDateString();
          const startDayStr = exStart.toDateString();
          const endDayStr = exEnd.toDateString();
          let startTime: string;
          let endTime: string;
  
          if (curDayStr === startDayStr && curDayStr === endDayStr) {
            startTime = exStart.toTimeString().slice(0, 5);
            endTime = exEnd.toTimeString().slice(0, 5);
          } else if (curDayStr === startDayStr) {
            startTime = exStart.toTimeString().slice(0, 5);
            endTime = "24:00";
          } else if (curDayStr === endDayStr) {
            startTime = "00:01";
            endTime = exEnd.toTimeString().slice(0, 5);
          } else {
            // Για ενδιάμεσες ημέρες, αποκλείστε ολόκληρη την ημέρα.
            startTime = "00:00";
            endTime = "24:00";
          }
  
          const dayName = daysOfWeek[curDay.getDay()];
          console.log(`    Adding general closed exception for ${dayName} on ${curDay.toDateString()}: ${startTime} - ${endTime}`);
          unavailableIntervals.push({ dayName, start: startTime, end: endTime });
        }
      });
  
      // 3. Επεξεργασία employee-specific exceptions (που δεν είναι διαθέσιμες).
      if (plan.exceptions) {
        const closedEmployeeExceptions = plan.exceptions.filter((ex: any) => !ex.available);
        console.log(`  Found ${closedEmployeeExceptions.length} employee closed exception(s) for employee ${resourceId}:`, JSON.stringify(closedEmployeeExceptions));
        closedEmployeeExceptions.forEach((exception: any) => {
          const exceptionStart = new Date(exception.startDatetime);
          const dayName = daysOfWeek[exceptionStart.getDay()];
          const startTime = exceptionStart.toTimeString().slice(0, 5);
          const endTime = new Date(exception.endDatetime).toTimeString().slice(0, 5);
          console.log(`    Adding employee closed exception for ${dayName}: ${startTime}-${endTime}`);
          unavailableIntervals.push({ dayName, start: startTime, end: endTime });
        });
      }
  
      // 4. Επαναφορά (subtraction) των available exceptions για προτεραιότητα.
      if (plan.exceptions) {
        const availableExceptions = plan.exceptions.filter((ex: any) => ex.available);
        if (availableExceptions.length > 0) {
          console.log(`  Final subtraction of available exceptions for employee ${resourceId}:`, JSON.stringify(availableExceptions));
          availableExceptions.forEach((exception: any) => {
            const exceptionStart = new Date(exception.startDatetime);
            const dayName = daysOfWeek[exceptionStart.getDay()];
            const startTime = exceptionStart.toTimeString().slice(0, 5);
            const endTime = new Date(exception.endDatetime).toTimeString().slice(0, 5);
            console.log(`    Subtracting available exception for ${dayName}: ${startTime}-${endTime}`);
            unavailableIntervals = this.subtractIntervals(unavailableIntervals, [{ dayName, start: startTime, end: endTime }]);
            console.log(`    Unavailable intervals after available exception subtraction:`, JSON.stringify(unavailableIntervals));
          });
        }
      }
  
      console.log(`  Unavailable intervals before merging for employee ${resourceId}:`, JSON.stringify(unavailableIntervals));
  
      // 5. Συγχώνευση (merge) των overlapping intervals.
      console.log('--- Calling mergeOverlappingIntervals ---');
      const mergedIntervals = this.mergeOverlappingIntervals(unavailableIntervals);
      console.log(`  Unavailable intervals after merging for employee ${resourceId}:`, JSON.stringify(mergedIntervals));
  
      // 6. Δημιουργία background events από τα τελικά merged intervals.
      const backgroundColor = '#b3b3b3';
      mergedIntervals.forEach(interval => {
        const dayIndex = this.getDayOfWeekByName(interval.dayName);
        if (dayIndex === -1) return;
        console.log(`    Creating background event for ${interval.dayName}: ${interval.start}-${interval.end}`);
        backgroundEvents.push({
          resourceId,
          daysOfWeek: [dayIndex],
          startTime: interval.start,
          endTime: interval.end,
          display: 'background',
          color: backgroundColor,
          editable: false,
          extendedProps: { isBackgroundEvent: true }
        });
      });
    });
  
    console.log('Global available boundaries:', { globalEarliestStart, globalLatestEnd });
    this.calendarOptions.slotMinTime = globalEarliestStart;
    this.calendarOptions.slotMaxTime = globalLatestEnd;
  
    // Ενοποίηση των background events με τα appointment events.
    this.backgroundEvents = backgroundEvents;
    this.mergeAndSetEvents();
  
    console.log('--- Add Background Events: Completed processing ---');
  }
  




  // Helper to get day index by name
  getDayOfWeekByName(dayName: string): number {
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    return days.indexOf(dayName);
  }





  convertToLocalTimezone(dateString: string): Date {
    const date = new Date(dateString);
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    return localDate;
  }





  // Utility to convert "HH:MM" to minutes since midnight
  // Utility to convert "HH:MM" to minutes since midnight
  // Utility to convert "HH:MM" to minutes since midnight
  timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Utility to convert minutes since midnight back to "HH:MM"
  minutesToTime(minutes: number): string {
    const hrs = Math.floor(minutes / 60).toString().padStart(2, '0');
    const mins = (minutes % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  }

  // Subtract available intervals from unavailable intervals
  // Subtract available intervals from unavailable intervals
  subtractIntervals(
    unavail: { dayName: string; start: string; end: string }[],
    avail: { dayName: string; start: string; end: string }[]
  ): { dayName: string; start: string; end: string }[] {
    let result: { dayName: string; start: string; end: string }[] = [];

    console.log('--- Subtract Intervals ---');
    console.log('Unavailable Intervals:', JSON.stringify(unavail, null, 2));
    console.log('Available Intervals to Subtract:', JSON.stringify(avail, null, 2));

    unavail.forEach(u => {
      let uStart = this.timeToMinutes(u.start);
      let uEnd = this.timeToMinutes(u.end);
      const currentDayName = u.dayName;

      console.log(`Processing Unavailable Interval: ${currentDayName} ${u.start}-${u.end}`);

      // Filter available intervals for the same day
      const availForDay = avail.filter(a => a.dayName === currentDayName);
      console.log(`Available Intervals for ${currentDayName}:`, availForDay);

      let remainingIntervals: { start: number; end: number }[] = [{ start: uStart, end: uEnd }];

      availForDay.forEach(a => {
        let aStart = this.timeToMinutes(a.start);
        let aEnd = this.timeToMinutes(a.end);

        console.log(`  Subtracting Available Interval: ${a.start}-${a.end}`);

        remainingIntervals = remainingIntervals.flatMap(interval => {
          if (aEnd <= interval.start || aStart >= interval.end) {
            // No overlap
            return [interval];
          }

          const newIntervals: { start: number; end: number }[] = [];

          if (aStart > interval.start) {
            newIntervals.push({ start: interval.start, end: aStart });
            console.log(`    Created new unavailable interval: ${this.minutesToTime(interval.start)}-${this.minutesToTime(aStart)}`);
          }

          if (aEnd < interval.end) {
            newIntervals.push({ start: aEnd, end: interval.end });
            console.log(`    Created new unavailable interval: ${this.minutesToTime(aEnd)}-${this.minutesToTime(interval.end)}`);
          }

          return newIntervals;
        });
      });

      // Add the remaining intervals
      remainingIntervals.forEach(interval => {
        if (interval.start < interval.end) {
          const formattedStart = this.minutesToTime(interval.start);
          const formattedEnd = this.minutesToTime(interval.end);
          result.push({ dayName: currentDayName, start: formattedStart, end: formattedEnd });
          console.log(`  Final Unavailable Interval after Subtraction: ${formattedStart}-${formattedEnd}`);
        }
      });
    });

    console.log('Resulting Unavailable Intervals after Subtraction:', JSON.stringify(result, null, 2));
    console.log('--- End Subtract Intervals ---');

    return result;
  }


  mergeAndSetEvents() {
    const mergedEvents = [...this.backgroundEvents, ...this.events]; // Background events first

    console.log('--- Merging and Setting Events ---');
    console.log('Background Events:', JSON.stringify(this.backgroundEvents, null, 2));
    console.log('Appointment Events:', JSON.stringify(this.events, null, 2));

    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEvents();
    calendarApi.addEventSource(mergedEvents);

    // Apply the updated options
    calendarApi.setOption('slotMinTime', this.calendarOptions.slotMinTime);
    calendarApi.setOption('slotMaxTime', this.calendarOptions.slotMaxTime);
    calendarApi.setOption('events', mergedEvents);

    this.cdr.detectChanges(); // Trigger change detection
    console.log("FINAL EVENTS");
    console.log(JSON.stringify(mergedEvents, null, 2));
    console.log('--- End Merging and Setting Events ---');
  }


  // Merge overlapping intervals per day to avoid overlaps
  // Merge overlapping intervals per day to avoid overlaps
  mergeOverlappingIntervals(intervals: { dayName: string; start: string; end: string }[]): { dayName: string; start: string; end: string }[] {
    const groupedByDay: { [key: string]: { start: string; end: string }[] } = {};

    intervals.forEach(interval => {
      if (!groupedByDay[interval.dayName]) {
        groupedByDay[interval.dayName] = [];
      }
      groupedByDay[interval.dayName].push({ start: interval.start, end: interval.end });
    });

    const merged: { dayName: string; start: string; end: string }[] = [];

    console.log('--- Merging Overlapping Intervals ---');

    for (const dayName in groupedByDay) {
      console.log(`  Merging intervals for ${dayName}:`, groupedByDay[dayName]);

      const dayIntervals = groupedByDay[dayName].sort((a, b) => this.timeToMinutes(a.start) - this.timeToMinutes(b.start));

      let current = dayIntervals[0];
      console.log(`    Starting merge with: ${current.start}-${current.end}`);

      for (let i = 1; i < dayIntervals.length; i++) {
        const next = dayIntervals[i];
        console.log(`    Comparing with next interval: ${next.start}-${next.end}`);

        if (this.timeToMinutes(next.start) <= this.timeToMinutes(current.end)) {
          // Overlapping intervals, merge them
          const newEndMinutes = Math.max(this.timeToMinutes(current.end), this.timeToMinutes(next.end));
          const newEndTime = this.minutesToTime(newEndMinutes);
          console.log(`      Overlapping detected. Merging ${current.start}-${current.end} with ${next.start}-${next.end} to ${current.start}-${newEndTime}`);
          current.end = newEndTime;
        } else {
          // No overlap, push the current interval and move to next
          merged.push({ dayName, start: current.start, end: current.end });
          console.log(`      No overlap. Pushing merged interval: ${current.start}-${current.end}`);
          current = next;
        }
      }

      // Push the last interval
      merged.push({ dayName, start: current.start, end: current.end });
      console.log(`    Pushing final merged interval for ${dayName}: ${current.start}-${current.end}`);
    }

    console.log('Resulting Merged Intervals:', JSON.stringify(merged, null, 2));
    console.log('--- End Merging Overlapping Intervals ---');

    return merged;
  }






  getUnavailableIntervals(availableIntervals: string[], dayName: string): { dayName: string; start: string; end: string }[] {
    const fullDayStart = '00:00';
    const fullDayEnd = '24:00';
    let lastEnd = fullDayStart;

    const unavailableIntervals: { dayName: string; start: string; end: string }[] = [];

    availableIntervals.forEach(interval => {
      const [start, end] = interval.split('-');
      if (start > lastEnd) {
        unavailableIntervals.push({ dayName, start: lastEnd, end: start });
      }
      lastEnd = end;
    });

    if (lastEnd < fullDayEnd) {
      unavailableIntervals.push({ dayName, start: lastEnd, end: fullDayEnd });
    }

    return unavailableIntervals;
  }



  getDayOfWeek(day: string): number {
    const days = ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο'];
    return days.indexOf(day);
  }



};







