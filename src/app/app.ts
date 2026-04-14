import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { gsap } from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';
import { filter } from 'rxjs';
import { LayoutComponent } from './components/layout/layout.component';
import { AnalyticsService } from './services/analytics.service';

gsap.registerPlugin(CSSPlugin);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly analyticsService = inject(AnalyticsService);

  ngOnInit(): void {
    const isInitialized = this.analyticsService.initialize();
    if (!isInitialized) {
      return;
    }

    if (this.router.navigated) {
      this.analyticsService.trackPageView(this.router.url);
    }

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => {
        this.analyticsService.trackPageView(event.urlAfterRedirects);
      });
  }
}
