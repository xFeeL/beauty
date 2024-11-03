import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditAutoRenewalPage } from './edit-auto-renewal.page';

describe('EditAutoRenewalPage', () => {
  let component: EditAutoRenewalPage;
  let fixture: ComponentFixture<EditAutoRenewalPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAutoRenewalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
