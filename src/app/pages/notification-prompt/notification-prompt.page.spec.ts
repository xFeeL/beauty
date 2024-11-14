import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationPromptPage } from './notification-prompt.page';

describe('NotificationPromptPage', () => {
  let component: NotificationPromptPage;
  let fixture: ComponentFixture<NotificationPromptPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationPromptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
