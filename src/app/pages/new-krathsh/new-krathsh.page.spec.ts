import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewKrathshPage } from './new-krathsh.page';

describe('NewKrathshPage', () => {
  let component: NewKrathshPage;
  let fixture: ComponentFixture<NewKrathshPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewKrathshPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
