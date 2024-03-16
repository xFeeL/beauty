import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { AddScheduleExceptionPage } from '../add-schedule-exception/add-schedule-exception.page';
import { MatSelect } from '@angular/material/select';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-wrario',
  templateUrl: './wrario.page.html',
  styleUrls: ['./wrario.page.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1
      })),
      state('closed', style({
        height: '0',
        opacity: 0
      })),
      transition('closed <=> open', [
        animate('250ms ease-in-out')
      ])
    ])
  ]
})
export class WrarioPage implements OnInit {
  hours: string[] = [];
  @ViewChild('mySelect') mySelect!: MatSelect;
  daysControl = new FormControl();
  scheduleExceptions: any;
  daysWrario = [
    { name: 'Δευτέρα', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τρίτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Τετάρτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Πέμπτη', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Παρασκευή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Σάββατο', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] },
    { name: 'Κυριακή', open: false, timeIntervals: [{ start: '09:00', end: '17:00' }] }
  ];
  constructor(private modalController: ModalController, private userService: UserService) {

    for (let i = 0; i < 24; i++) {
      this.hours.push(this.formatHour(i, '00'));
      this.hours.push(this.formatHour(i, '30'));
    }
    this.hours.push(this.formatHour(23, '59'));

  }
 
  firstDayTemplate: any[] = [];
  firstDayToggled: any = null;

  ngOnInit() {
  }

  getScheduleExceptions() {
    this.userService.getScheduleExceptions().subscribe(
      data => {
        this.scheduleExceptions = data.map((exception: { start: moment.MomentInput; end: moment.MomentInput; }) => {
          const formattedStart = moment(exception.start).locale('el').format('MMM DD, HH:mm');
          const formattedEnd = moment(exception.end).locale('el').format('MMM DD, HH:mm');
          const start = exception.start
          const end = exception.end
          return {
            formatted: `${formattedStart} - ${formattedEnd}`,
            originalStart: start,
            originalEnd: end
          };
        });
        this.daysControl.setValue(this.scheduleExceptions); // Set all exceptions as selected
      },
      err => {
        console.error('Error fetching schedule exceptions', err);
      }
    );
  }

  loadWrarioData() {
    this.getScheduleExceptions();
    this.userService.getWrario().subscribe(data => {
      // Create a mapping from Greek to English days
      const dayMapping: { [key: string]: string } = {
        'Δευτέρα': 'monday',
        'Τρίτη': 'tuesday',
        'Τετάρτη': 'wednesday',
        'Πέμπτη': 'thursday',
        'Παρασκευή': 'friday',
        'Σάββατο': 'saturday',
        'Κυριακή': 'sunday',
      };

      this.daysWrario.forEach(day => {
        // Get the corresponding day in English
        const englishDay = dayMapping[day.name];

        // If there are working hours for that day, set the open property to true and fill the timeIntervals array
        if (data[englishDay] !== null) {
          day.open = true;
          day.timeIntervals = data[englishDay].workingHours.map((wh: { start: string; end: string; }) => ({
            start: wh.start.substring(0, 5), // Convert 'HH:MM:SS' to 'HH:MM'
            end: wh.end.substring(0, 5), // Convert 'HH:MM:SS' to 'HH:MM'
          }));
        } else {
          // If there are no working hours for that day, set the open property to false and keep the default 9-5 interval
          day.open = false;
          day.timeIntervals = [{ start: '09:00', end: '17:00' }];
        }
      });

    }, err => {
      // Handle error here
    });

  }

  ionViewWillEnter() {
    this.loadWrarioData()


  }

  handleClick() {
    if (this.scheduleExceptions.length === 0) {
      this.openDateTimePicker();
    }
  }


  async openDateTimePicker() {
    this.mySelect.close()
    const modal = await this.modalController.create({
      component: AddScheduleExceptionPage,
      componentProps: {
        // room: room, // Pass the entire room object
      }
    });
    await modal.present();
    //; // Close the MatSelect dropdown

    const { data } = await modal.onDidDismiss();
    this.scheduleExceptions = []
    this.getScheduleExceptions()

    if (data) {

      // room.tableTypes = data.tableTypes; // Update the room's table types with the returned data
    }
  }


  goBack() {
    this.modalController.dismiss()
  }



  onDayToggle(day: any) {
    // Toggle the day
    //day.open = event.detail.checked;
    console.log(day)
    day.open = !day.open
    if (day.open) {
      // If this is the first day toggled, store it
      if (!this.firstDayToggled) {
        this.firstDayToggled = day;
      }
      // If another day is toggled and the template is empty, copy the first day's intervals to the template
      else if (this.firstDayToggled.name != day.name && this.firstDayTemplate.length == 0) {
        this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
        for (let d of this.daysWrario) {
          if (d.name !== this.firstDayToggled.name) {
            d.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
          }
        }
      }

      // If this is not the first day toggled and the day has no intervals yet, copy the template to the day
      if (this.firstDayToggled !== day && day.timeIntervals.length === 0) {
        day.timeIntervals = JSON.parse(JSON.stringify(this.firstDayTemplate)); // Deep copy
      }
    }
  }


  onStartTimeChange(selectedStartTime: string, timeInterval: any, day: any) {
    console.log('Selected start time: ', selectedStartTime);

    const parsedSelectedStartTime = moment(selectedStartTime, 'HH:mm');

    for (let previousInterval of day.timeIntervals) {
      if (previousInterval === timeInterval) {
        continue; // Skip current interval
      }

      const parsedPreviousStartTime = moment(previousInterval.start, 'HH:mm');
      const parsedPreviousEndTime = moment(previousInterval.end, 'HH:mm');

      if (parsedSelectedStartTime.isBetween(parsedPreviousStartTime, parsedPreviousEndTime, undefined, '[]')) {
        this.userService.presentToast("Η ώρα έναρξης δεν μπορεί να είναι μέσα στο διάστημα άλλων χρονικών διαστημάτων της ίδιας μέρας", "danger")
        console.log(timeInterval.start)

        new Promise(resolve => setTimeout(resolve, 0)).then(() => {
          timeInterval.start = this.addHours(previousInterval.end, 1); // Suggesting next available time slot after last interval's end time
          selectedStartTime = timeInterval.start;
        });

        break;
      } else {
        timeInterval.start = selectedStartTime; // Only update start time if it's not within any other time intervals
      }
    }

    if (this.firstDayToggled.name == day.name) {
      console.log("MPIKA")
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }


  onEndTimeChange(selectedEndTime: string, timeInterval: any, day: any) {
    console.log('Selected end time: ', selectedEndTime);

    const parsedEndTime = moment(selectedEndTime, 'HH:mm');
    const parsedStartTime = moment(timeInterval.start, 'HH:mm');

    if (parsedEndTime.isBefore(parsedStartTime)) {
      this.userService.presentToast("Η ώρα τερματισμού πρέπει να είναι μετά την ώρα έναρξης", "danger")
      console.log(timeInterval.start)

      // delay setting the new value until next event loop to give the UI a chance to update
      new Promise(resolve => setTimeout(resolve, 0)).then(() => {
        timeInterval.end = this.addHours(timeInterval.start, 2);
        selectedEndTime = timeInterval.end;
      });

    } else {
      timeInterval.end = selectedEndTime; // Only update end time if it's not before start time
    }

    if (this.firstDayToggled.name == day.name) {
      console.log("MPIKA")
      this.firstDayTemplate = JSON.parse(JSON.stringify(this.firstDayToggled.timeIntervals)); // Deep copy
    }
  }

  addTimeInterval(day: any) {
    const previousInterval = day.timeIntervals[day.timeIntervals.length - 1];
    const defaultStart = previousInterval ? previousInterval.end : '9:00';
    const defaultEnd = previousInterval ? this.addHours(previousInterval.end, 2) : '11:00';

    day.timeIntervals.push({ start: defaultStart, end: defaultEnd });
  }

  addHours(time: string, hours: number): string {
    const parsedTime = moment(time, 'HH:mm');

    if (parsedTime.isValid()) {
      const newTime = parsedTime.clone().add(hours, 'hours'); // Use clone() to avoid mutating parsedTime

      // Check if the newTime has crossed over to the next day
      if (newTime.isSame(parsedTime, 'day')) {
        const formattedTime = newTime.format('HH:mm');
        return formattedTime;
      } else {
        // If the day of newTime is not the same as the day of parsedTime, then it has crossed over to the next day
        return '23:30';
      }
    } else {
      console.log('Invalid time format');
      return '';
    }
  }



  deleteTimeInterval(day: any, index: number) {
    day.timeIntervals.splice(index, 1);
  }


  formatHour(hour: number, minutes: string): string {
    return this.pad(hour) + ':' + minutes;
  }

  pad(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  save() {
    this.userService.saveWrario(this.daysWrario).subscribe(data => {
      this.userService.presentToast("Το ωράριο αποθηκεύτηκε με επιτυχία.", "success")
      this.modalController.dismiss()
    }, err => {
      this.userService.presentToast("Κάτι πήγε στραβά.", "danger")

    })
  }
}
