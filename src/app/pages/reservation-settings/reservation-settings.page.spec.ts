import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationSettingsPage } from './reservation-settings.page';

describe('ReservationSettingsPage', () => {
  let component: ReservationSettingsPage;
  let fixture: ComponentFixture<ReservationSettingsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ReservationSettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
