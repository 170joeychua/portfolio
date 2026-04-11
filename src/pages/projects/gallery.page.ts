import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { Subscription } from 'rxjs';
import { Project, PROJECTS } from '../../app/models/projects-data.model';
import { GalleryTransitionService } from '../../app/services/galleyTransition.service';

@Component({
  standalone: true,
  selector: 'app-gallery',
  imports: [CommonModule],
  templateUrl: './gallery.page.html',
  styleUrls: ['./gallery.page.scss'],
})
export class GalleryPage implements AfterViewInit, OnDestroy {
  private transition = inject(GalleryTransitionService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private sectionChanges?: Subscription;

  works: Project[] = PROJECTS;
  private loopFactor = 3;
  loopedWorks: Project[] = Array.from({ length: this.loopFactor }, () => this.works).flat();

  @ViewChild('scrollShell') scrollShell!: ElementRef<HTMLDivElement>;
  @ViewChildren('workSection') sectionRefs!: QueryList<ElementRef<HTMLDivElement>>;

  private sectionHeight = 0;
  private currentIndex = 0;
  private isAnimating = false;

  private deltaAccumulator = 0;
  private readonly DELTA_THRESHOLD = 80;

  private accumulatorResetTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly ACCUMULATOR_RESET_MS = 120;

  private touchStartY = 0;
  private touchLastY = 0;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const saved = sessionStorage.getItem('gallery-scroll');
    this.sectionChanges = this.sectionRefs.changes.subscribe(() => this.init());
    this.init(saved ? Number(saved) : undefined);
    if (saved) sessionStorage.removeItem('gallery-scroll');

    const el = this.scrollShell.nativeElement;
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('touchstart', this.onTouchStart, { passive: true });
    el.addEventListener('touchmove', this.onTouchMove, { passive: false });
    el.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = this.scrollShell?.nativeElement;
    if (el) {
      el.removeEventListener('wheel', this.onWheel);
      el.removeEventListener('touchstart', this.onTouchStart);
      el.removeEventListener('touchmove', this.onTouchMove);
      el.removeEventListener('touchend', this.onTouchEnd);
    }
    this.sectionChanges?.unsubscribe();
    if (this.accumulatorResetTimer) clearTimeout(this.accumulatorResetTimer);
  }

  private init(restoreScrollY?: number) {
    if (!this.scrollShell || !this.sectionRefs || this.sectionRefs.length === 0) return;

    const firstSection = this.sectionRefs.first?.nativeElement;
    if (!firstSection) return;

    this.sectionHeight = firstSection.clientHeight || this.scrollShell.nativeElement.clientHeight;

    if (restoreScrollY !== undefined) {
      const restored = Math.round(restoreScrollY / this.sectionHeight);
      this.currentIndex = Math.max(0, Math.min(restored, this.loopedWorks.length - 1));
    } else {
      this.currentIndex = this.works.length;
    }

    gsap.set(this.scrollShell.nativeElement, {
      scrollTop: this.currentIndex * this.sectionHeight,
    });
  }

  // ─── Wheel ────────────────────────────────────────────────────────────────

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 24;
    if (e.deltaMode === 2) delta *= window.innerHeight;

    this.deltaAccumulator += delta;

    if (this.accumulatorResetTimer) clearTimeout(this.accumulatorResetTimer);
    this.accumulatorResetTimer = setTimeout(() => {
      this.deltaAccumulator = 0;
    }, this.ACCUMULATOR_RESET_MS);

    if (Math.abs(this.deltaAccumulator) < this.DELTA_THRESHOLD) return;
    if (this.isAnimating) {
      this.deltaAccumulator = 0;
      return;
    }

    const direction = this.deltaAccumulator > 0 ? 1 : -1;
    this.deltaAccumulator = 0;
    this.advance(direction);
  };

  // ─── Touch ────────────────────────────────────────────────────────────────

  private onTouchStart = (e: TouchEvent) => {
    this.touchStartY = e.touches[0].clientY;
    this.touchLastY = this.touchStartY;
  };

  private onTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    this.touchLastY = e.touches[0].clientY;
  };

  private onTouchEnd = () => {
    if (this.isAnimating) return;
    const delta = this.touchStartY - this.touchLastY;
    if (Math.abs(delta) < 40) return;
    const direction = delta > 0 ? 1 : -1;
    this.advance(direction);
  };

  // ─── Core advance ─────────────────────────────────────────────────────────

  private advance(direction: 1 | -1) {
    const targetIndex = this.currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= this.loopedWorks.length) return;

    this.isAnimating = true;

    const container = this.scrollShell.nativeElement;
    const targetScrollTop = targetIndex * this.sectionHeight;

    gsap.to(container, {
      scrollTop: targetScrollTop,
      duration: 0.75,
      ease: 'expo.out',
      overwrite: true,
      onComplete: () => {
        this.currentIndex = targetIndex;
        this.isAnimating = false;
        this.teleportIfNeeded();
      },
    });
  }

  // ─── Seamless loop teleport ───────────────────────────────────────────────

  private teleportIfNeeded() {
    if (!this.sectionHeight) return;

    const container = this.scrollShell.nativeElement;
    const singleLoopCount = this.works.length;

    let newIndex: number | null = null;

    if (this.currentIndex < singleLoopCount) {
      newIndex = this.currentIndex + singleLoopCount;
    } else if (this.currentIndex >= singleLoopCount * (this.loopFactor - 1)) {
      newIndex = this.currentIndex - singleLoopCount;
    }

    if (newIndex === null) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.currentIndex = newIndex!;
        gsap.set(container, { scrollTop: newIndex! * this.sectionHeight });
      });
    });
  }

  // ─── Navigation ───────────────────────────────────────────────────────────

  async openDetail(work: Project, event: Event) {
    if (!isPlatformBrowser(this.platformId)) {
      await this.router.navigate(['/projects', work.id]);
      return;
    }

    const section = event.currentTarget as HTMLElement;
    const heroEl = section.querySelector('.section-image') as HTMLElement | null;
    const rect =
      heroEl?.getBoundingClientRect() ?? new DOMRect(0, 0, window.innerWidth, window.innerHeight);

    this.transition.save({
      rect,
      imageUrl: work.heroImage,
      scrollY: this.currentIndex * this.sectionHeight,
    });

    document.body.style.overflow = 'hidden';
    await this.router.navigate(['/projects', work.id]);
    document.body.style.overflow = '';
  }
}
