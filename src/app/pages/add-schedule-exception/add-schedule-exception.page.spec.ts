import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddScheduleExceptionPage } from './add-schedule-exception.page';

describe('AddScheduleExceptionPage', () => {
  let component: AddScheduleExceptionPage;
  let fixture: ComponentFixture<AddScheduleExceptionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddScheduleExceptionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
