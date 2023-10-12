import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPersonPage } from './add-person.page';

describe('AddPersonPage', () => {
  let component: AddPersonPage;
  let fixture: ComponentFixture<AddPersonPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddPersonPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
