import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EducationPage } from './education.page';

describe('EducationPage', () => {
  let component: EducationPage;
  let fixture: ComponentFixture<EducationPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EducationPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EducationPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
