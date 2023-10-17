import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.page.html',
  styleUrls: ['./guide.page.scss'],
})
export class GuidePage implements OnInit {
  employees = [
    { avatar: 'path_to_avatar1.png', name: 'John' },
    { avatar: 'path_to_avatar2.png', name: 'Doe' },
    // Add more employees as needed
  ];
  times: string[] = [];
  currentDate = new Date();
  appointments = [
    { employeeName: 'John', time: '09:00', description: 'Meeting with client A' },
    { employeeName: 'Doe', time: '11:30', description: 'Review session' },
    // ... more appointments
  ];
  currentTimePosition!: number;
  getAppointment(employeeName: string, time: string): string {
    const appointment = this.appointments.find(a => a.employeeName === employeeName && a.time === time);
    return appointment ? appointment.description : '';
  }
  // Begin with 'time' column and then add a column for each employee
  displayedColumns: string[] = ['time', ...this.employees.map((_, index) => 'employee' + index)];

  constructor() {
    for (let i = 0; i < 24; i++) {
        this.times.push(`${String(i).padStart(2, '0')}:00`);
    }
}

  

  changeDate(event: any) {
    this.currentDate = event.value;
  }

  ngOnInit() {
    this.updateTimePosition();
    setInterval(() => this.updateTimePosition(), 60000);
    }
  updateTimePosition() {
    const now = new Date();
    this.currentTimePosition = now.getHours() * 2 + Math.floor(now.getMinutes() / 30);
}

shouldShowCurrentTimeLine(time: any): boolean {
  if (!time) {
    console.warn("Time value is undefined or null.");
    return false;
  }
  console.log(`Checking time: ${time} against position: ${this.currentTimePosition}`);

  const timeParts = time.split(":");
  const rowIndex = parseInt(timeParts[0]) * 2 + (parseInt(timeParts[1]) === 30 ? 1 : 0);
  console.log(`Row index for time ${time} is ${rowIndex}`);
  return rowIndex === this.currentTimePosition;
}

debugRow(row: any) {
  console.log('Row data:', row);
}



}
