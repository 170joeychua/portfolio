import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechStackPage } from './tech-stack.page';

describe('TechStackPage', () => {
  let component: TechStackPage;
  let fixture: ComponentFixture<TechStackPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechStackPage],
    }).compileComponents();

    fixture = TestBed.createComponent(TechStackPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
