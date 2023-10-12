import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WrarioPage } from './wrario.page';

describe('WrarioPage', () => {
  let component: WrarioPage;
  let fixture: ComponentFixture<WrarioPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WrarioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
