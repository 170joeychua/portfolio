import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExperiencesPage } from './experiences.page';

describe('ExperiencesPage', () => {
  let component: ExperiencesPage;
  let fixture: ComponentFixture<ExperiencesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExperiencesPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ExperiencesPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
