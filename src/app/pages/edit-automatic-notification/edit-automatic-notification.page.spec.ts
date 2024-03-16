import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAutomaticNotificationPage } from './edit-automatic-notification.page';

describe('EditAutomaticNotificationPage', () => {
  let component: EditAutomaticNotificationPage;
  let fixture: ComponentFixture<EditAutomaticNotificationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EditAutomaticNotificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
