import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeamServicesPromptPage } from './team-services-prompt.page';

describe('TeamServicesPromptPage', () => {
  let component: TeamServicesPromptPage;
  let fixture: ComponentFixture<TeamServicesPromptPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TeamServicesPromptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
