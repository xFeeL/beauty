import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClosuresPage } from './closures.page';

describe('ClosuresPage', () => {
  let component: ClosuresPage;
  let fixture: ComponentFixture<ClosuresPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ClosuresPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
