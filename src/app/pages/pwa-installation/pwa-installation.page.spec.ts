import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PwaInstallationPage } from './pwa-installation.page';

describe('PwaInstallationPage', () => {
  let component: PwaInstallationPage;
  let fixture: ComponentFixture<PwaInstallationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PwaInstallationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
