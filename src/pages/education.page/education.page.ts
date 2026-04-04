import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';

export interface CcaEntry {
  title: string;
  period?: string;
  bullets?: string[];
  reflection?: string;
  skills?: string[];
}

export interface EducationEntry {
  id: number;
  school: string;
  schoolShort: string;
  degree: string;
  period: string;
  summary: string;
  ccaEntries: CcaEntry[];
  location: string;
  accentColor: string;
  emblemChar: string;
  photos: string[];
}

@Component({
  selector: 'app-education-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.page.html',
  styleUrl: './education.page.scss',
})
export class EducationPage implements AfterViewInit, OnDestroy {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private ngZone = inject(NgZone);

  // ─── ViewChild refs ──────────────────────────────────────────────────────────
  @ViewChild('bookRef') bookRef!: ElementRef<HTMLElement>;
  @ViewChild('sceneRef') sceneRef!: ElementRef<HTMLElement>;
  @ViewChild('flipPageRef') flipPageRef!: ElementRef<HTMLElement>;
  @ViewChild('ccaListRef') ccaListRef!: ElementRef<HTMLElement>;
  @ViewChild('leftPageRef') leftPageRef!: ElementRef<HTMLElement>;

  // ─── Data ────────────────────────────────────────────────────────────────────
  readonly education: EducationEntry[] = [
    {
      id: 0,
      school: 'Singapore Institute of Technology',
      schoolShort: 'S.I.T.',
      degree:
        'Bachelor of Engineering in Information & Communications Technology (Software Engineering) Honours with Merit',
      period: 'Sept 2020 – Oct 2024',
      summary:
        'Solidified core engineering concepts while sharpening attention to finer details in web infrastructure and design — bridging theory to industry-ready practice.',
      ccaEntries: [
        {
          title: 'SIT Developers Club — Head of Publicity',
          period: '2021 – 2022',
          bullets: [
            'Collaborated with Google Developer Student Club to promote learning opportunities.',
            'Led technical workshops on Figma, GitHub Fundamentals, and Firebase Fundamentals.',
            'Managed social media: Telegram, Instagram, School newsletter and Discord.',
            'Spearheaded the inaugural SIT hackathon (HackRift 2022).',
          ],
          reflection:
            'Biggest takeaway was learning to be resourceful — figuring out how to reach out to companies and turn conversations into real opportunities.',
          skills: ['Technical Presentations', 'Public Relations', 'Event Planning', 'Publicity'],
        },
        {
          title: 'SIT Orientation Student Facilitator',
          period: '2021',
          bullets: ['Facilitated onboarding for 40 freshman students.'],
          skills: ['Communication', 'Leadership', 'Event Facilitation'],
        },
        {
          title: 'Alumni Mentoring Programme — Mentee',
          period: 'May 2023 – Sept 2023',
          bullets: [
            'Gained clearer career direction and practical industry insights through mentorship.',
          ],
          reflection:
            'Shoutout to my mentor QE and my fellow mentee buddy — a fantastic experience navigating professional growth together.',
          skills: ['Time Management', 'Accountability', 'Career Planning'],
        },
      ],
      location: 'Singapore',
      accentColor: '#8b2635',
      emblemChar: 'SIT',
      photos: ['images/id-photo.png', 'images/id-photo.png', 'images/id-photo.png'],
    },
    {
      id: 1,
      school: 'Temasek Polytechnic',
      schoolShort: 'T.P.',
      degree: 'Diploma in Information Technology',
      period: 'Apr 2017 – May 2020',
      summary:
        'Built solid fundamentals in web and hybrid application development, and gained early exposure to machine learning, microservices, and IoT — sparking a genuine passion for building things.',
      ccaEntries: [
        {
          title: 'Ultimate Frisbee',
          period: '2017 – 2020',
          bullets: ['Active member of the Ultimate Frisbee club throughout the diploma.'],
          skills: ['Teamwork', 'Discipline', 'Resilience'],
        },
        {
          title: 'Freshmen Orientation Leader',
          period: '2018 – 2019',
          bullets: ['Guided incoming freshmen through orientation activities and campus life.'],
          skills: ['Leadership', 'Communication', 'Event Facilitation'],
        },
      ],
      location: 'Singapore',
      accentColor: '#1a3a6b',
      emblemChar: 'TP',
      photos: ['images/id-photo.png', 'images/id-photo.png', 'images/id-photo.png'],
    },
  ];

  // ─── State ───────────────────────────────────────────────────────────────────
  currentPageIndex = signal(0);
  isFlipping = signal(false);

  currentEntry = computed(() => this.education[this.currentPageIndex()] ?? null);
  canGoNext = computed(
    () => this.currentPageIndex() < this.education.length - 1 && !this.isFlipping(),
  );
  canGoPrev = computed(() => this.currentPageIndex() > 0 && !this.isFlipping());

  get spreadLabel(): string {
    return `${this.currentPageIndex() + 1} / ${this.education.length}`;
  }

  // ─── Overflow detection ───────────────────────────────────────────────────────
  overflowStartIndex = signal<number>(-1);

  leftCcaEntries = computed(() => {
    const entry = this.currentEntry();
    if (!entry) return [];
    const cut = this.overflowStartIndex();
    return cut === -1 ? entry.ccaEntries : entry.ccaEntries.slice(0, cut);
  });

  rightCcaEntries = computed(() => {
    const entry = this.currentEntry();
    if (!entry) return [];
    const cut = this.overflowStartIndex();
    return cut === -1 ? [] : entry.ccaEntries.slice(cut);
  });

  // ─── GSAP (lazy-loaded, browser-only) ────────────────────────────────────────
  private gsap: any;
  private flipTimeline: any = null;
  private resizeObserver: ResizeObserver | null = null;

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    requestAnimationFrame(() => {
      this._measureOverflow();
      this._watchOverflow();
    });

    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        this.gsap = gsap;
        this._initEntryAnimation();
        this._initMouseTilt(); // ▶ FIX: now uses window-level listener
        this._initScrollFlip();
      },
    );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resizeObserver?.disconnect();

    // ▶ FIX: remove the window-level mouse listeners
    (this as any)._tiltCleanup?.();

    const rafId = (this as any)._eduRafId;
    if (rafId) cancelAnimationFrame(rafId);

    const scrollerEl = (this as any)._eduScrollerEl as HTMLElement | undefined;
    scrollerEl?.remove();

    const homeWrapper = document.querySelector<HTMLElement>('app-home > div');
    if (homeWrapper) {
      homeWrapper.style.overflow = (this as any)._savedHomeOverflow ?? '';
    }
  }

  // ─── Overflow detection ───────────────────────────────────────────────────────
  private _measureOverflow(): void {
    const entry = this.currentEntry();
    if (!entry || !this.ccaListRef?.nativeElement) return;

    const container = this.ccaListRef.nativeElement as HTMLElement;
    const containerBottom = container.getBoundingClientRect().bottom;
    const items = Array.from(container.querySelectorAll<HTMLElement>('.cca-entry'));

    let cutIndex = -1;
    for (let i = 0; i < items.length; i++) {
      if (items[i].getBoundingClientRect().bottom > containerBottom) {
        cutIndex = i;
        break;
      }
    }

    this.ngZone.run(() => this.overflowStartIndex.set(cutIndex));
  }

  private _watchOverflow(): void {
    if (!this.leftPageRef?.nativeElement) return;
    this.resizeObserver = new ResizeObserver(() => this._measureOverflow());
    this.resizeObserver.observe(this.leftPageRef.nativeElement);
  }

  // ─── Entry animation ─────────────────────────────────────────────────────────
  private _initEntryAnimation(): void {
    this.gsap.fromTo(
      this.bookRef.nativeElement,
      { autoAlpha: 0, y: 40 },
      { autoAlpha: 1, y: 0, duration: 1, ease: 'expo.out', delay: 0.3 },
    );
  }

  // ─── Mouse tilt ───────────────────────────────────────────────────────────────
  /**
   * ▶ FIX: The `.education-backdrop` sits at z-index 0 and covers the entire
   * overlay, which means `mousemove` events on the scene / book-wrapper are
   * consumed by it first and never bubble up to those elements.
   *
   * The fix: attach the listener to `window` instead of any child element.
   * We still use the book's bounding rect as the reference — the tilt simply
   * fires no matter where the pointer is on the overlay, which feels natural
   * because the book tracks the cursor across the whole dark background.
   */
  private _initMouseTilt(): void {
    if (!this.gsap || !this.bookRef?.nativeElement) return;

    const gsap = this.gsap;
    const wrapper = this.bookRef.nativeElement;

    const onMove = (e: MouseEvent) => {
      if (this.isFlipping()) return;

      const rect = wrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      // Normalise relative to book centre. We use window dimensions as the
      // denominator so the effect is noticeable even when the cursor is far
      // from the book — gives the impression the book "follows" the pointer.
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);

      gsap.to(wrapper, {
        rotateY: dx * 8, // ± 8° horizontal
        rotateX: -dy * 5, // ± 5° vertical
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };

    const onLeave = () => {
      gsap.to(wrapper, {
        rotateY: 0,
        rotateX: 0,
        duration: 1,
        ease: 'elastic.out(1, 0.5)',
        overwrite: 'auto',
      });
    };

    // ▶ FIX: window-level so the backdrop doesn't swallow the events
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    (this as any)._tiltCleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }

  // ─── Scroll-driven flip ───────────────────────────────────────────────────────
  private _initScrollFlip(): void {
    const totalTransitions = this.education.length - 1;
    if (totalTransitions === 0) return;

    const gsap = this.gsap;
    const flipEl = this.flipPageRef.nativeElement;

    const homeWrapper = document.querySelector<HTMLElement>('app-home > div');
    if (homeWrapper) {
      (this as any)._savedHomeOverflow = homeWrapper.style.overflow;
      homeWrapper.style.overflow = 'visible';
    }

    const scrollerEl = document.createElement('div');
    scrollerEl.id = 'edu-scroller';
    Object.assign(scrollerEl.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      overflowY: 'scroll',
      zIndex: '9999',
      opacity: '0',
      pointerEvents: 'all',
    });

    const spacer = document.createElement('div');
    const scrollPerFlip = 150;
    spacer.style.height = `${100 + scrollPerFlip * totalTransitions}vh`;
    scrollerEl.appendChild(spacer);
    document.body.appendChild(scrollerEl);

    gsap.set(flipEl, { rotateY: 0, transformOrigin: 'left center', autoAlpha: 0 });

    let activeWindow = -1;
    let phase: 'idle' | 'lifting' | 'landing' = 'idle';
    let lastProgress = -1;

    const tick = () => {
      (this as any)._eduRafId = requestAnimationFrame(tick);

      const maxScroll = scrollerEl.scrollHeight - scrollerEl.clientHeight;
      if (maxScroll <= 0) return;

      const progress = Math.min(scrollerEl.scrollTop / maxScroll, 1);
      if (Math.abs(progress - lastProgress) < 0.0005) return;
      lastProgress = progress;

      const rawWindow = progress * totalTransitions;
      const winIdx = Math.min(Math.floor(rawWindow), totalTransitions - 1);
      const localProg = rawWindow - winIdx;

      if (winIdx !== activeWindow) {
        activeWindow = winIdx;
        phase = 'idle';
      }

      if (phase === 'idle' && localProg > 0.01) {
        phase = 'lifting';
        gsap.set(flipEl, { autoAlpha: 1, rotateY: 0 });
      }

      if (phase === 'lifting' && localProg >= 0.5) {
        phase = 'landing';
        const next = winIdx + 1;
        if (this.currentPageIndex() !== next) {
          this.ngZone.run(() => {
            this.currentPageIndex.set(next);
            requestAnimationFrame(() => this._measureOverflow());
          });
        }
        gsap.set(flipEl, { rotateY: 90 });
      }

      if (phase === 'landing' && localProg >= 0.97) {
        gsap.set(flipEl, { autoAlpha: 0 });
      }

      if (phase === 'landing' && localProg < 0.5) {
        phase = 'lifting';
        const prev = winIdx;
        if (this.currentPageIndex() !== prev) {
          this.ngZone.run(() => {
            this.currentPageIndex.set(prev);
            requestAnimationFrame(() => this._measureOverflow());
          });
        }
        gsap.set(flipEl, { autoAlpha: 1, rotateY: -90 });
      }

      if (phase === 'lifting' && localProg <= 0.02) {
        phase = 'idle';
        gsap.set(flipEl, { autoAlpha: 0, rotateY: 0 });
      }

      if (phase === 'lifting') {
        const t = Math.min(localProg / 0.5, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        gsap.set(flipEl, { rotateY: eased * -90 });
      } else if (phase === 'landing') {
        const t = Math.min((localProg - 0.5) / 0.5, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        gsap.set(flipEl, { rotateY: 90 - eased * 90 });
      }
    };

    (this as any)._eduRafId = requestAnimationFrame(tick);
    (this as any)._eduScrollerEl = scrollerEl;
  }

  // ─── Keyboard / dot navigation ────────────────────────────────────────────────
  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.nextPage();
    if (e.key === 'ArrowLeft') this.prevPage();
  }

  nextPage(): void {
    if (this.canGoNext()) this._animateFlipTo(this.currentPageIndex() + 1);
  }
  prevPage(): void {
    if (this.canGoPrev()) this._animateFlipTo(this.currentPageIndex() - 1);
  }

  goToPage(index: number): void {
    if (index !== this.currentPageIndex() && !this.isFlipping()) this._animateFlipTo(index);
  }

  private _animateFlipTo(targetIndex: number): void {
    if (!this.gsap || this.isFlipping()) return;
    this.isFlipping.set(true);

    const gsap = this.gsap;
    const flipEl = this.flipPageRef.nativeElement;
    const forward = targetIndex > this.currentPageIndex();

    gsap.set(flipEl, { autoAlpha: 1, rotateY: 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({
      onComplete: () => {
        this.currentPageIndex.set(targetIndex);
        requestAnimationFrame(() => this._measureOverflow());
        gsap.set(flipEl, { autoAlpha: 0, rotateY: 0 });
        this.isFlipping.set(false);
      },
    });

    if (forward) {
      tl.to(flipEl, { rotateY: -90, duration: 0.45, ease: 'power1.in' });
      tl.call(() => {
        this.currentPageIndex.set(targetIndex);
        requestAnimationFrame(() => this._measureOverflow());
        gsap.set(flipEl, { rotateY: 90 });
      });
      tl.to(flipEl, { rotateY: 0, duration: 0.45, ease: 'power1.out' });
    } else {
      tl.to(flipEl, { rotateY: 90, duration: 0.45, ease: 'power1.in' });
      tl.call(() => {
        this.currentPageIndex.set(targetIndex);
        requestAnimationFrame(() => this._measureOverflow());
        gsap.set(flipEl, { rotateY: -90 });
      });
      tl.to(flipEl, { rotateY: 0, duration: 0.45, ease: 'power1.out' });
    }
  }

  // ─── Photo helpers ────────────────────────────────────────────────────────────
  getPhotoRotation(i: number): number {
    return [-5, 4, -3][i % 3];
  }
  getPhotoOffsetY(i: number): number {
    return [0, 6, -4][i % 3];
  }
  getPhotoZIndex(i: number): number {
    return [1, 3, 2][i % 3];
  }

  onImageError(event: Event): void {
    const frame = (event.target as HTMLElement).closest('.photo-frame');
    if (frame) frame.classList.add('photo-placeholder');
  }

  protected exitToRoot(): void {
    this.router.navigateByUrl('/');
  }
}
