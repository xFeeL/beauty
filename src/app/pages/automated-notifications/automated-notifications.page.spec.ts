import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutomatedNotificationsPage } from './automated-notifications.page';

describe('AutomatedNotificationsPage', () => {
  let component: AutomatedNotificationsPage;
  let fixture: ComponentFixture<AutomatedNotificationsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AutomatedNotificationsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
