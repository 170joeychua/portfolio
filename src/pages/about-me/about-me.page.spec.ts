import { TestBed } from '@angular/core/testing';
import { AboutMePage } from './about-me.page';

describe('AboutMePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutMePage],
    }).compileComponents();
  });

  it('creates the component and shows the layout', () => {
    const fixture = TestBed.createComponent(AboutMePage);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
