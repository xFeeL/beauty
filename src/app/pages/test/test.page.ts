import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-test',
  templateUrl: './test.page.html',
  styleUrls: ['./test.page.scss'],
})
export class TestPage implements OnInit {
  constructor() {
    this.generateTimes();
  }

 
  ngOnInit() {
  }


  employees = [
    { name: 'John Doe', image: 'https://via.placeholder.com/50' },
    { name: 'Jane Smith', image: 'https://via.placeholder.com/50' },
    { name: 'Employee 3', image: 'https://via.placeholder.com/50' }
  ];

  times: string[] = [];


  generateTimes() {
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hours = this.padNumber(i);
        const minutes = this.padNumber(j);
        this.times.push(`${hours}:${minutes}`);
      }
    }
  }

  padNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

}


