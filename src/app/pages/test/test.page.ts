import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import dayGridPlugin from '@fullcalendar/daygrid'
import { FullCalendarComponent } from '@fullcalendar/angular';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-test',
  templateUrl: 'test.page.html',
  styleUrls: ['test.page.scss'],
})
export class TestPage {
  lastKnownMinute: number;
  constructor(private popoverController: PopoverController) {
    this.lastKnownMinute = new Date().getMinutes();
    setInterval(() => this.checkAndRun(), 1000);
  }
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
    timeZone: 'UTC',
    initialView: 'resourceTimeGridWeek',
    datesAboveResources: true,
    plugins: [timeGridPlugin, interactionPlugin, resourceTimeGridPlugin, dayGridPlugin],
    views: {
      resourceTimeGridWeek: {
        type: 'resourceTimeGrid',
        duration: { days: 7 },
        buttonText: 'Week',
        allDaySlot: false
      }
    },
    events: this.events,
    eventLongPressDelay: 1000,
    resources: [
      { id: 'a', title: 'Ryan', color: '#FADCD2', borderColor: '#F7C4B4', image: '../../assets/ryan.png' },
      { id: 'b', title: 'Kate', color: '#DDF7DF', borderColor: '#C6F1C9', image: '../../assets/kate.png' },
      { id: 'c', title: 'John', color: '#F1E3F5', borderColor: '#E8D0EF', image: '../../assets/john.png' }
    ],
    headerToolbar: false,
    weekends: false,
    editable: true,
    height: 'auto',
    stickyHeaderDates: true,
    slotDuration: '00:15:00',
    slotLabelInterval: { hour: 1 },
    slotLabelFormat: { hour: 'numeric' },

    // slotLabelInterval: { minutes: 30 },
    // slotLabelFormat: { hour: 'numeric', minute: '2-digit' },
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
    const amPm = parsedHours < 12 ? 'AM' : 'PM';

    const formattedMinutes = parsedMinutes < 10 ? `0${parsedMinutes}` : parsedMinutes.toString();

    return `${formattedHours}:${formattedMinutes} ${amPm}`;
  }
};
