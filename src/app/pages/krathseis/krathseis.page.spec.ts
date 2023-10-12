import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KrathseisPage } from './krathseis.page';

describe('KrathseisPage', () => {
  let component: KrathseisPage;
  let fixture: ComponentFixture<KrathseisPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KrathseisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
