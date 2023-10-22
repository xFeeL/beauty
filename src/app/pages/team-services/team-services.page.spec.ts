import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamServicesPage } from './team-services.page';

describe('TeamServicesPage', () => {
  let component: TeamServicesPage;
  let fixture: ComponentFixture<TeamServicesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TeamServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
