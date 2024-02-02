import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChooseVariationPage } from './choose-variation.page';

describe('ChooseVariationPage', () => {
  let component: ChooseVariationPage;
  let fixture: ComponentFixture<ChooseVariationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChooseVariationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
