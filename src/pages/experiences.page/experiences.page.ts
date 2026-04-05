import { isPlatformBrowser, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RippleModule } from 'primeng/ripple';
import { Subject, takeUntil, timer } from 'rxjs';
import { KeyboardButtonComponent } from '../../app/components/keyboard-button/keyboard-button';

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  startDateNext?: string;
  endDateNext?: string;
  placeholderUrl: string;
  logoUrl: string;
  color: string;
  accent: 'teal' | 'violet' | 'gold' | 'crimson';
  description: string[];
  skills: string[];
  testimonialUrl?: string;
}

const EXPERIENCES: Experience[] = [
  {
    id: 'ip-tribe',
    company: 'IP-TRIBE Pte Ltd',
    role: 'Software Engineer',
    startDate: 'Sept 2024',
    endDate: 'Present',
    placeholderUrl: 'https://placehold.co/48x48/0d3d38/2dd4bf?text=IP',
    logoUrl: '/images/iptribe-logo.png',
    color: '#2dd4bf',
    accent: 'teal',
    skills: ['Angular', '.NET', 'GraphQL', 'MongoDB', 'WebSocket', 'RabbitMQ', 'Docker', 'Figma'],
    testimonialUrl: undefined,
    description: [
      'Owned 30% of full-stack module development using Angular, .NET, GraphQL, MongoDB, TailwindCSS, PrimeNG, AG Grid, RabbitMQ and Docker, ensuring scalable architecture and secure data handling.',
      'Implemented real-time WebSocket systems to manage live events with idempotency and consistent state across all window sessions.',
      'Designed and iterated user-centric UI/UX wireframes using Figma and Sketch, delivering intuitive and accessible interfaces for public sector stakeholders and vendors.',
      'Led requirement gathering sessions with users, clients, and vendors, translating business needs into maintainable, high-performance features.',
      'Boosted development efficiency by 20% by enforcing clean architecture, solid design principles, and scalable coding practices.',
    ],
  },
  {
    id: 'accenture-dev',
    company: 'Accenture Pte Ltd',
    role: 'Application Developer (Apprenticeship)',
    startDate: 'Jan 2023',
    endDate: 'Dec 2023',
    startDateNext: 'May 2022',
    endDateNext: 'Aug 2022',
    placeholderUrl: 'https://placehold.co/48x48/2d1f5e/a78bfa?text=AC',
    logoUrl: '/svgs/accenture-logo.svg',
    color: '#a78bfa',
    accent: 'violet',
    skills: [
      'Angular',
      'Storybook',
      'SonarQube',
      'Jasmine',
      'Karma',
      'Azure DevOps',
      'Kafka',
      'Docker',
    ],
    testimonialUrl: undefined,
    description: [
      'Managed and maintained a shared UI component library and Microfrontend architecture, refactoring legacy Angular modules and improving reusability.',
      'Led Angular upgrades from v13 → v16, resolving deprecations, dependency conflicts, and configuration issues.',
      'Enforced code quality via SonarQube with >80% unit test coverage using Jasmine and Karma.',
      'Implemented and maintained Storybook, improving UI consistency and accelerating cross-team collaboration.',
      'Conducted Lighthouse and WCAG accessibility audits to strengthen compliance and usability.',
      'Performed security validation through tokenization and encryption testing using Azure Key Vault, alongside Azure DevOps CI/CD debugging and monitoring.',
      'Executed SQL query and Kafka message testing across Dockerized microservices to ensure reliable inter-service communication.',
    ],
  },
  {
    id: 'accenture-backend',
    company: 'Accenture Pte Ltd',
    role: 'Backend Tester (Apprenticeship)',
    startDate: 'May 2022',
    endDate: 'Aug 2022',
    placeholderUrl: 'https://placehold.co/48x48/3d2e00/fbbf24?text=AC',
    logoUrl: '/svgs/accenture-logo.svg',
    color: '#fbbf24',
    accent: 'gold',
    skills: ['C#', 'REST API', 'xUnit', 'Postman', 'Swagger'],
    testimonialUrl: 'pdfs/joey-apprentice-testimonial.pdf',
    description: [
      'Constructed high-quality API and C# unit tests, achieving at least 85% code coverage for two notification services and improving reliability.',
      'Maintained technical documentation for REST API designs, improving knowledge transfer and training efficiency by 10%.',
    ],
  },
  {
    id: 'accenture-tester',
    company: 'Accenture Pte Ltd',
    role: 'Software Tester (Internship)',
    startDate: 'Jul 2019',
    endDate: 'Feb 2020',
    placeholderUrl: 'https://placehold.co/48x48/3d0f0f/f87171?text=AC',
    logoUrl: '/svgs/accenture-logo.svg',
    color: '#f87171',
    accent: 'crimson',
    skills: ['Selenium', 'C#', 'UAT', 'Test Scripting', 'SQL'],
    testimonialUrl: 'joey-internship-testimonial.pdf',
    description: [
      'Designed test packages and datasets, supported UAT with clients, increasing satisfaction and sustaining a 6-year partnership.',
      'Improved code efficiency by 60% by developing automated test scripts using Selenium and C#.',
    ],
  },
];

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [NgStyle, RippleModule, KeyboardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experiences.page.html',
  styleUrl: './experiences.page.scss',
})
export class ExperiencesPage implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  readonly experiences = EXPERIENCES;
  readonly activeIndex = signal<number>(0);
  readonly activeExp = computed(() => EXPERIENCES[this.activeIndex()]);
  readonly nodeShadow = computed(() => {
    const c = this.activeExp().color;
    return `0 0 0 4px ${c}33, 0 0 24px ${c}55`;
  });

  @ViewChild('pageWrapper') pageWrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('stickyHeader') stickyHeaderRef!: ElementRef<HTMLElement>;
  @ViewChild('scrollContainer') scrollContainerRef!: ElementRef<HTMLElement>;
  @ViewChild('pinnedPanel') pinnedPanelRef!: ElementRef<HTMLElement>;
  @ViewChild('fillBar') fillBarRef!: ElementRef<HTMLElement>;
  @ViewChild('logoNode') logoNodeRef!: ElementRef<HTMLElement>;
  @ViewChild('contentPanel') contentPanelRef!: ElementRef<HTMLElement>;
  // ← canvas element for the barcode
  @ViewChild('barcodeEl') barcodeElRef?: ElementRef<HTMLCanvasElement>;

  private prevIndex = 0;
  private destroy$ = new Subject<void>();

  getSymbol(index: number): string {
    const symbols: string[] = ['◈', '◇', '◉', '✦', '⊞', '⬡'];
    return symbols[index % symbols.length];
  }

  private renderBarcode(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    setTimeout(() => {
      const canvas = this.barcodeElRef?.nativeElement;
      if (!canvas) return;

      // Match canvas pixel size to its CSS display size
      const cssW = canvas.offsetWidth || 222;
      const cssH = canvas.offsetHeight || 36;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      // Background matches label colour
      ctx.fillStyle = '#c8c8c0';
      ctx.fillRect(0, 0, cssW, cssH);

      // Draw bars
      const BAR_INK = '#1a1a18';
      const widthPattern = [
        3, 1, 2, 1, 3, 2, 1, 2, 1, 3, 2, 1, 1, 3, 2, 1, 3, 1, 2, 2, 1, 3, 1, 2, 3, 1, 2, 1, 1, 3,
      ];
      const gapPattern = [0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0];

      const GAP_PX = 0.9;
      let x = 0;
      let i = 0;

      while (x < cssW) {
        const seed = widthPattern[i % widthPattern.length];
        const isGap = gapPattern[i % gapPattern.length] === 1;
        const barW = seed === 1 ? 1 : seed === 2 ? 1.5 : 2.2;

        if (!isGap) {
          // vary height for realism — taller every 5th, medium every 3rd
          const extraH = i % 5 === 0 ? 6 : i % 3 === 0 ? 2 : 0;
          const barH = cssH - 4 + extraH;
          // bars are bottom-aligned
          ctx.fillStyle = BAR_INK;
          ctx.fillRect(x, cssH - barH, barW, barH);
        }

        x += barW + GAP_PX;
        i++;
      }
    }, 0);
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  stepPercent(i: number): number {
    const n = EXPERIENCES.length;
    if (n === 1) return 0;
    return (i / (n - 1)) * 100;
  }

  scrollToSection(index: number): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const scroller = this.pageWrapperRef.nativeElement;
    const scrollerH = scroller.clientHeight;
    scroller.scrollTo({ top: scrollerH * index, behavior: 'smooth' });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    const scroller = this.pageWrapperRef.nativeElement;
    const container = this.scrollContainerRef.nativeElement;
    const panel = this.pinnedPanelRef.nativeElement;
    const fill = this.fillBarRef.nativeElement;
    const node = this.logoNodeRef.nativeElement;
    const n = EXPERIENCES.length;

    const scrollerH = scroller.clientHeight;
    container.style.height = `${n * scrollerH}px`;

    // ── Make the panel sticky via CSS instead of GSAP pin ──
    panel.style.position = 'sticky';
    panel.style.top = '0';
    panel.style.height = `${scrollerH}px`;

    this.renderBarcode();

    ScrollTrigger.create({
      trigger: container,
      scroller,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        const progress = self.progress;
        gsap.set(fill, { height: `${progress * 100}%` });
        gsap.set(node, { top: `${progress * 100}%` });

        const newIndex = Math.min(Math.floor(progress * n), n - 1);
        if (newIndex !== this.prevIndex) {
          this.animateContentSwap(newIndex);
          this.prevIndex = newIndex;
        }
      },
    });
  }

  private animateContentSwap(newIndex: number): void {
    const panel = this.contentPanelRef.nativeElement;

    gsap.to(panel, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        this.activeIndex.set(newIndex);
        this.cdr.markForCheck();

        setTimeout(() => {
          gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.38, ease: 'power3.out' });
          // Redraw barcode after Angular has updated the DOM
          this.renderBarcode();
        }, 0);
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }

  protected exitToRoot(): void {
    const wrapper = this.pageWrapperRef?.nativeElement;
    if (!wrapper) return;
    timer(500)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        gsap.to(wrapper, {
          opacity: 0,
          duration: 0.4,
          ease: 'power1.inOut',
          onComplete: () => {
            this.router.navigateByUrl('/');
          },
        });
      });
  }
}
