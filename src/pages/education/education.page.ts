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
  degree: string;
  period: string;
  summary: string;
  ccaEntries: CcaEntry[];
  location: string;
  accentColor: string;
  emblemChar: string;
  photos: { src: string; note: string }[];
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
          title: 'Alumni Mentoring Programme — Mentee',
          period: 'May 2023 – Sept 2023',
          bullets: [
            'Gained clearer career direction and practical industry insights through mentorship.',
          ],
          reflection:
            'Shoutout to my mentor QE and my fellow mentee buddy — a fantastic experience navigating professional growth together.',
          skills: ['Time Management', 'Accountability', 'Career Planning'],
        },
        {
          title: 'SIT Orientation Student Facilitator',
          period: '2021',
        },
      ],
      location: 'Singapore',
      accentColor: '#8b2635',
      emblemChar: 'SIT',
      photos: [
        { src: 'images/education/sunset.jpg', note: 'every evening view' },
        { src: 'images/education/boulder.jpg', note: 'new sport w/ friends' },
        { src: 'images/education/lol.jpg', note: 'doing our best' },
      ],
    },
    {
      id: 1,
      school: 'Temasek Polytechnic',
      degree: 'Diploma in Information Technology',
      period: 'Apr 2017 – May 2020',
      summary:
        'Built solid fundamentals in web and hybrid application development, and gained early exposure to machine learning, microservices, and IoT — sparking a genuine passion for building things.',
      ccaEntries: [
        {
          title: 'Ultimate Frisbee',
          period: '2017 – 2020',
        },
        {
          title: 'Freshmen Orientation Leader',
          period: '2018 – 2019',
        },
      ],
      location: 'Singapore',
      accentColor: '#1a3a6b',
      emblemChar: 'TP',
      photos: [
        { src: 'images/education/friends.jpg', note: 'my friends' },
        { src: 'images/education/study.jpg', note: 'working anywhere' },
        { src: 'images/education/latte.jpg', note: 'side quest to earn money' },
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
  overflowStartIndex = signal<number>(-1);

  leftCcaEntries = computed(() => {
    const entry = this.currentEntry();
    if (!entry) return [];
    const cut = this.overflowStartIndex();
    return cut === -1 ? entry.ccaEntries : entry.ccaEntries.slice(0, cut);
  });

  // ─── GSAP (lazy-loaded, browser-only) ────────────────────────────────────────
  private gsap: any;
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
        this._initMouseTilt();
        this._initScrollFlip();
      },
    );
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resizeObserver?.disconnect();
    (this as any)._tiltCleanup?.();
    (this as any)._wheelCleanup?.();

    const rafId = (this as any)._eduRafId;
    if (rafId) cancelAnimationFrame(rafId);
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
  private _initMouseTilt(): void {
    if (!this.gsap || !this.bookRef?.nativeElement) return;

    const gsap = this.gsap;
    const wrapper = this.bookRef.nativeElement;

    const onMove = (e: MouseEvent) => {
      if (this.isFlipping()) return;

      const rect = wrapper.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);

      gsap.to(wrapper, {
        rotateY: dx * 8,
        rotateX: -dy * 5,
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

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    (this as any)._tiltCleanup = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }

  // ─── Scroll-driven flip with threshold auto-complete ─────────────────────────
  private _initScrollFlip(): void {
    const totalTransitions = this.education.length - 1;
    if (totalTransitions === 0) return;

    const gsap = this.gsap;
    const flipEl = this.flipPageRef.nativeElement;

    // Total wheel delta (px) that represents the scrub range before threshold
    const scrollPerFlip = 300;
    // Fraction of scrollPerFlip at which auto-complete fires (40%)
    const THRESHOLD = 0.4;

    // Accumulated wheel delta for the current in-progress flip
    let virtualScroll = 0;
    // 1 = forward, -1 = backward, 0 = idle
    let flipDirection = 0;
    // True while GSAP is auto-completing or auto-reversing — ignore wheel input
    let autoCompleting = false;

    gsap.set(flipEl, { rotateY: 0, transformOrigin: 'left center', autoAlpha: 0 });

    // Ease-in-out quad — maps progress (0→1) to a smooth curve
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const toProgress = (v: number) => Math.max(0, Math.min(v / scrollPerFlip, 1));

    // ── Auto-complete: GSAP takes over from current angle to fully flipped ────
    const triggerAutoComplete = (direction: 1 | -1) => {
      autoCompleting = true;
      this.isFlipping.set(true);

      const targetIndex = this.currentPageIndex() + direction;
      const progress = toProgress(virtualScroll);

      // Remaining fraction of the lift phase to animate
      const liftRemaining = 1 - progress;

      if (direction === 1) {
        // Continue lifting from current angle to -90°
        const currentAngle = easeInOut(progress) * -90;
        gsap.to(flipEl, {
          rotateY: -90,
          duration: 0.35 * liftRemaining,
          ease: 'power2.in',
          onComplete: () => {
            // Swap page content at the midpoint (page is edge-on, invisible)
            this.ngZone.run(() => {
              this.currentPageIndex.set(targetIndex);
              requestAnimationFrame(() => this._measureOverflow());
            });
            gsap.set(flipEl, { rotateY: 90 });
            // Land from 90° back to 0°
            gsap.to(flipEl, {
              rotateY: 0,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                gsap.set(flipEl, { autoAlpha: 0 });
                autoCompleting = false;
                flipDirection = 0;
                virtualScroll = 0;
                this.isFlipping.set(false);
              },
            });
          },
        });
        // Set starting angle immediately so GSAP animates from the right place
        gsap.set(flipEl, { rotateY: currentAngle });
      } else {
        // Backward: lift from current angle to +90°
        const currentAngle = easeInOut(progress) * 90;
        gsap.to(flipEl, {
          rotateY: 90,
          duration: 0.35 * liftRemaining,
          ease: 'power2.in',
          onComplete: () => {
            this.ngZone.run(() => {
              this.currentPageIndex.set(targetIndex);
              requestAnimationFrame(() => this._measureOverflow());
            });
            gsap.set(flipEl, { rotateY: -90 });
            gsap.to(flipEl, {
              rotateY: 0,
              duration: 0.35,
              ease: 'power2.out',
              onComplete: () => {
                gsap.set(flipEl, { autoAlpha: 0 });
                autoCompleting = false;
                flipDirection = 0;
                virtualScroll = 0;
                this.isFlipping.set(false);
              },
            });
          },
        });
        gsap.set(flipEl, { rotateY: currentAngle });
      }
    };

    // ── Auto-reverse: animate back to 0° and reset to idle ───────────────────
    const triggerAutoReverse = () => {
      autoCompleting = true;
      const currentAngle =
        flipDirection === 1
          ? easeInOut(toProgress(virtualScroll)) * -90
          : easeInOut(toProgress(virtualScroll)) * 90;

      gsap.set(flipEl, { rotateY: currentAngle });
      gsap.to(flipEl, {
        rotateY: 0,
        duration: 0.25,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(flipEl, { autoAlpha: 0 });
          autoCompleting = false;
          flipDirection = 0;
          virtualScroll = 0;
        },
      });
    };

    // ── Wheel handler ─────────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (autoCompleting) return;

      const delta = e.deltaY;
      const canForward = this.currentPageIndex() < this.education.length - 1 && !this.isFlipping();
      const canBackward = this.currentPageIndex() > 0 && !this.isFlipping();

      // ── Initialise a new flip if idle ─────────────────────────────────────
      if (flipDirection === 0) {
        if (delta > 0 && canForward) {
          flipDirection = 1;
          virtualScroll = 0;
          gsap.set(flipEl, { autoAlpha: 1, rotateY: 0 });
        } else if (delta < 0 && canBackward) {
          flipDirection = -1;
          virtualScroll = 0;
          gsap.set(flipEl, { autoAlpha: 1, rotateY: 0 });
        }
        // No eligible direction — do nothing
        if (flipDirection === 0) return;
      }

      // ── Accumulate or reduce scroll in the active direction ───────────────
      const scrollingWithDirection =
        (delta > 0 && flipDirection === 1) || (delta < 0 && flipDirection === -1);

      if (scrollingWithDirection) {
        virtualScroll = Math.min(virtualScroll + Math.abs(delta), scrollPerFlip);
      } else {
        virtualScroll = Math.max(0, virtualScroll - Math.abs(delta));
      }

      const progress = toProgress(virtualScroll);

      // ── Manually scrub the flip angle ─────────────────────────────────────
      const scrubAngle = flipDirection === 1 ? easeInOut(progress) * -90 : easeInOut(progress) * 90;
      gsap.set(flipEl, { rotateY: scrubAngle });

      // ── Threshold crossed → hand off to GSAP ─────────────────────────────
      if (progress >= THRESHOLD) {
        triggerAutoComplete(flipDirection as 1 | -1);
        return;
      }

      // ── Scrolled back to zero → reverse back to idle ──────────────────────
      if (virtualScroll <= 0) {
        triggerAutoReverse();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });

    (this as any)._wheelCleanup = () => {
      window.removeEventListener('wheel', onWheel);
    };
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

  exitToRoot(): void {
    this.router.navigateByUrl('/');
  }
}
