import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InstagramImagesPage } from './instagram-images.page';

describe('InstagramImagesPage', () => {
  let component: InstagramImagesPage;
  let fixture: ComponentFixture<InstagramImagesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(InstagramImagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
