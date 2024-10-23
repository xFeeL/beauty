import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmsPurchasePage } from './sms-purchase.page';

describe('SmsPurchasePage', () => {
  let component: SmsPurchasePage;
  let fixture: ComponentFixture<SmsPurchasePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsPurchasePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
