import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchKrathshPage } from './search-krathsh.page';

describe('SearchKrathshPage', () => {
  let component: SearchKrathshPage;
  let fixture: ComponentFixture<SearchKrathshPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SearchKrathshPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
