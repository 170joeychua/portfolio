import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecognitionsPage } from './recognitions.page';

describe('RecognitionsPage', () => {
  let component: RecognitionsPage;
  let fixture: ComponentFixture<RecognitionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecognitionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(RecognitionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
