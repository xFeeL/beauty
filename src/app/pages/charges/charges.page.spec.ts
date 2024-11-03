import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChargesPage } from './charges.page';

describe('ChargesPage', () => {
  let component: ChargesPage;
  let fixture: ComponentFixture<ChargesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
