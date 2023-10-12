import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddServicesPage } from './add-services.page';

describe('AddServicesPage', () => {
  let component: AddServicesPage;
  let fixture: ComponentFixture<AddServicesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddServicesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
