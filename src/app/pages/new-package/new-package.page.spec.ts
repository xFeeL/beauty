import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewPackagePage } from './new-package.page';

describe('NewPackagePage', () => {
  let component: NewPackagePage;
  let fixture: ComponentFixture<NewPackagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NewPackagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
