import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FacebookImagesPage } from './facebook-images.page';

describe('FacebookImagesPage', () => {
  let component: FacebookImagesPage;
  let fixture: ComponentFixture<FacebookImagesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(FacebookImagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
