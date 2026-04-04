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
  /** The CCA list container on the left page — used for overflow measurement */
  @ViewChild('ccaListRef') ccaListRef!: ElementRef<HTMLElement>;
  /** The left page element itself — used for overflow measurement */
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
      photos: [
        'assets/education/sit-photo-1.jpg',
        'assets/education/sit-photo-2.jpg',
        'assets/education/sit-photo-3.jpg',
      ],
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
      photos: [
        'assets/education/tp-photo-1.jpg',
        'assets/education/tp-photo-2.jpg',
        'assets/education/tp-photo-3.jpg',
      ],
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
  /**
   * `overflowStartIndex` is the CCA index at which content no longer fits
   * in the left page's CCA container. CCAs from this index onward are
   * rendered on the right page above the photos.
   *
   * -1 means everything fits on the left (no overflow).
   */
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
  private ScrollTrigger: any;
  private flipTimeline: any = null;
  private savedBodyHeight = '';
  private savedHtmlHeight = '';

  // ResizeObserver for overflow detection
  private resizeObserver: ResizeObserver | null = null;

  // ─── Lifecycle ───────────────────────────────────────────────────────────────
  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Measure overflow after the view has painted
    requestAnimationFrame(() => {
      this._measureOverflow();
      this._watchOverflow();
    });

    // Dynamic import keeps GSAP out of SSR bundle
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([{ gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        this.gsap = gsap;
        this.ScrollTrigger = ScrollTrigger;
        this._initEntryAnimation();
        this._initScrollFlip();
      },
    );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.resizeObserver?.disconnect();
    this.flipTimeline?.kill();
    this.ScrollTrigger?.getAll().forEach((t: any) => t.kill());
    document.body.style.height = this.savedBodyHeight;
    document.documentElement.style.height = this.savedHtmlHeight;
  }

  // ─── Overflow detection ───────────────────────────────────────────────────────
  /**
   * Walk the rendered CCA entry elements and find the first one whose
   * bottom edge exceeds the CCA container's visible height.
   * That index and everything after it moves to the right page.
   */
  private _measureOverflow(): void {
    const entry = this.currentEntry();
    if (!entry || !this.ccaListRef?.nativeElement) return;

    const container = this.ccaListRef.nativeElement as HTMLElement;
    const containerBottom = container.getBoundingClientRect().bottom;
    const items = Array.from(container.querySelectorAll<HTMLElement>('.cca-entry'));

    let cutIndex = -1;
    for (let i = 0; i < items.length; i++) {
      const itemBottom = items[i].getBoundingClientRect().bottom;
      if (itemBottom > containerBottom) {
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

  // ─── Scroll-driven flip ───────────────────────────────────────────────────────
  /**
   * How the flip works (fixed version):
   *
   * The flip-page is a paper-coloured leaf sitting on TOP of the right page.
   * At rest (rotateY = 0) it is flat and invisible because it matches the
   * paper colour of the right page underneath.
   *
   * On scroll:
   *   0%  → 50%  : rotateY goes 0 → -90  (leaf lifts, edge-on at 90°)
   *   50% (edge-on): swap currentPageIndex → right page now shows new entry
   *                  reset flip-page rotateY to +90 (edge-on from other side)
   *   50% → 100% : rotateY goes +90 → 0  (leaf falls flat on LEFT page)
   *                Then we hide the flip-page so the left page content shows.
   *
   * This avoids the "blank paper covering everything" problem from before.
   */
  private _initScrollFlip(): void {
    const totalTransitions = this.education.length - 1;
    if (totalTransitions === 0) return;

    const scrollPerFlip = 150; // vh of scroll per page turn
    const totalScrollVh = scrollPerFlip * totalTransitions;

    this.savedBodyHeight = document.body.style.height;
    this.savedHtmlHeight = document.documentElement.style.height;
    document.body.style.height = `${100 + totalScrollVh}vh`;
    document.documentElement.style.height = `${100 + totalScrollVh}vh`;

    const gsap = this.gsap;
    const scene = this.sceneRef.nativeElement;
    const flipEl = this.flipPageRef.nativeElement;

    // Start flat, paper-coloured, sitting over the right page — invisible
    gsap.set(flipEl, { rotateY: 0, transformOrigin: 'left center', autoAlpha: 0 });

    let activeWindow = -1;
    let phase: 'idle' | 'lifting' | 'landing' = 'idle';

    this.flipTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: `+=${totalScrollVh}vh`,
        scrub: 1.2,
        pin: scene,
        anticipatePin: 1,
        onUpdate: (self: any) => {
          const progress = self.progress;
          const rawWindow = progress * totalTransitions;
          const winIdx = Math.min(Math.floor(rawWindow), totalTransitions - 1);
          const localProg = rawWindow - winIdx; // 0 → 1 within this window

          if (winIdx !== activeWindow) {
            activeWindow = winIdx;
            phase = 'idle';
          }

          if (phase === 'idle' && localProg > 0) {
            // Flip-page becomes visible as it starts to lift
            phase = 'lifting';
            gsap.set(flipEl, { autoAlpha: 1, rotateY: 0 });
          }

          // At the edge-on point, swap content and flip the leaf to the other side
          if (phase === 'lifting' && localProg >= 0.5) {
            phase = 'landing';
            const next = winIdx + 1;
            if (this.currentPageIndex() !== next) {
              this.currentPageIndex.set(next);
              // Re-measure overflow for the new entry
              requestAnimationFrame(() => this._measureOverflow());
            }
            // Snap leaf to +90° (edge-on from the new side, invisible)
            gsap.set(flipEl, { rotateY: 90 });
          }

          // When leaf is fully flat on the left page, hide it so left content shows
          if (phase === 'landing' && localProg >= 0.98) {
            gsap.set(flipEl, { autoAlpha: 0 });
          }

          // ── Reverse direction ────────────────────────────────────────────────
          if (phase === 'landing' && localProg < 0.5) {
            phase = 'lifting';
            const prev = winIdx;
            if (this.currentPageIndex() !== prev) {
              this.currentPageIndex.set(prev);
              requestAnimationFrame(() => this._measureOverflow());
            }
            gsap.set(flipEl, { autoAlpha: 1, rotateY: -90 });
          }

          if (phase === 'lifting' && localProg <= 0.02) {
            phase = 'idle';
            gsap.set(flipEl, { autoAlpha: 0, rotateY: 0 });
          }
        },
      },
    });

    // Animate the LIFTING half: rotateY 0 → -90 for first 50% of each window
    // Animate the LANDING half: rotateY 90 → 0 for second 50% (driven by onUpdate swap)
    for (let i = 0; i < totalTransitions; i++) {
      const winStart = i / totalTransitions;
      const winMid = (i + 0.5) / totalTransitions;
      const winEnd = (i + 1) / totalTransitions;

      // Lift: 0 → -90
      this.flipTimeline.fromTo(
        flipEl,
        { rotateY: 0 },
        { rotateY: -90, duration: winMid - winStart, ease: 'power1.in' },
        winStart,
      );

      // Land: 90 → 0  (after the content swap, leaf falls from the other side)
      this.flipTimeline.fromTo(
        flipEl,
        { rotateY: 90 },
        { rotateY: 0, duration: winEnd - winMid, ease: 'power1.out' },
        winMid,
      );
    }
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

  /** Standalone flip for keyboard / dot nav (not scroll-driven). */
  private _animateFlipTo(targetIndex: number): void {
    if (!this.gsap || this.isFlipping()) return;
    this.isFlipping.set(true);

    const gsap = this.gsap;
    const flipEl = this.flipPageRef.nativeElement;
    const forward = targetIndex > this.currentPageIndex();

    // Make leaf visible and at starting angle
    gsap.set(flipEl, { autoAlpha: 1, rotateY: forward ? 0 : 0, transformOrigin: 'left center' });

    const tl = gsap.timeline({
      onComplete: () => {
        this.currentPageIndex.set(targetIndex);
        requestAnimationFrame(() => this._measureOverflow());
        gsap.set(flipEl, { autoAlpha: 0, rotateY: 0 });
        this.isFlipping.set(false);
      },
    });

    if (forward) {
      // Lift to edge-on
      tl.to(flipEl, { rotateY: -90, duration: 0.45, ease: 'power1.in' });
      // Swap at edge-on
      tl.call(() => {
        this.currentPageIndex.set(targetIndex);
        requestAnimationFrame(() => this._measureOverflow());
        gsap.set(flipEl, { rotateY: 90 });
      });
      // Land from other side
      tl.to(flipEl, { rotateY: 0, duration: 0.45, ease: 'power1.out' });
    } else {
      // Reverse: lift from flat (left page) to edge-on
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
    return [-4, 3, -2][i % 3];
  }
  getPhotoOffsetY(i: number): number {
    return [0, 8, -5][i % 3];
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
