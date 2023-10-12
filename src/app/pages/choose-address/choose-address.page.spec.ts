import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseAddressPage } from './choose-address.page';

describe('ChooseAddressPage', () => {
  let component: ChooseAddressPage;
  let fixture: ComponentFixture<ChooseAddressPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChooseAddressPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
