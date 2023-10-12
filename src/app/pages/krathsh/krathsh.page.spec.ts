import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KrathshPage } from './krathsh.page';

describe('KrathshPage', () => {
  let component: KrathshPage;
  let fixture: ComponentFixture<KrathshPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(KrathshPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
