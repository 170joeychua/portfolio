import { isPlatformBrowser, NgClass, NgStyle } from '@angular/common';
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
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RippleModule } from 'primeng/ripple';

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  logoUrl: string;
  color: string;
  description?: string[];
}

const EXPERIENCES: Experience[] = [
  {
    id: 'ip-tribe',
    company: 'IP-TRIBE Pte Ltd',
    role: 'Software Engineer',
    startDate: 'Sept 2024',
    endDate: 'Present',
    logoUrl: 'https://placehold.co/48x48/1e3a5f/ffffff?text=IP',
    color: '#1e3a5f',
    description: [
      'Owned 30% of full-stack module development using Angular, .NET, GraphQL, MongoDB, TailwindCSS, PrimeNG, AG Grid, RabbitMQ and Docker.',
      'Implemented real-time WebSocket to manage live events with idempotency and consistent state across all window sessions.',
      'Designed and iterated user-centric UI/UX wireframes using Figma and Sketch for public-sector stakeholders.',
      'Boosted development efficiency by 20% through clean architecture and solid design principles.',
    ],
  },
  {
    id: 'accenture-dev',
    company: 'Accenture Pte Ltd',
    role: 'Application Developer (Apprenticeship)',
    startDate: 'Jan 2023',
    endDate: 'Dec 2023',
    logoUrl: 'https://placehold.co/48x48/a100ff/ffffff?text=AC',
    color: '#a100ff',
    description: [
      'Managed a shared Micro-Frontend UI component library; refactored legacy modules in Angular.',
      'Led Angular framework upgrades from v13 → v16, resolving deprecations and dependency conflicts.',
      'Enforced >80% unit test coverage via SonarQube, Jasmine and Karma.',
      'Conducted Lighthouse & WCAG accessibility audits, strengthening compliance and usability.',
      'Contributed to a quarter-million-dollar public-sector project milestone.',
    ],
  },
  {
    id: 'accenture-backend',
    company: 'Accenture Pte Ltd',
    role: 'Backend Tester (Apprenticeship)',
    startDate: 'May 2022',
    endDate: 'Aug 2022',
    logoUrl: 'https://placehold.co/48x48/a100ff/ffffff?text=AC',
    color: '#7b00cc',
    description: [
      'Constructed high-quality API and C# unit tests, achieving ≥85% code coverage for two notification services.',
      'Maintained technical documents for REST API designs, improving training efficiency by 10%.',
    ],
  },
  {
    id: 'accenture-tester',
    company: 'Accenture Pte Ltd',
    role: 'Software Tester (Internship)',
    startDate: 'Jul 2019',
    endDate: 'Feb 2020',
    logoUrl: 'https://placehold.co/48x48/a100ff/ffffff?text=AC',
    color: '#5500aa',
    description: [
      'Designed test packages and data, supporting UAT with clients and sustaining a 6-year partnership.',
      'Increased code efficiency by 60% by developing automated Selenium + C# test scripts.',
    ],
  },
];

@Component({
  selector: 'app-experiences',
  standalone: true,
  imports: [NgClass, NgStyle, RippleModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './experiences.page.html',
  styleUrl: './experiences.page.scss',
})
export class ExperiencesPage implements AfterViewInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

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
  @ViewChild('logoImg') logoImgRef!: ElementRef<HTMLImageElement>;
  @ViewChild('contentPanel') contentPanelRef!: ElementRef<HTMLElement>;

  private prevIndex = 0;

  stepPercent(i: number): number {
    const n = EXPERIENCES.length;
    if (n === 1) return 0;
    return (i / (n - 1)) * 100;
  }

  scrollToSection(index: number): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const scroller = this.pageWrapperRef.nativeElement; // scroll the wrapper div
    const container = this.scrollContainerRef.nativeElement;
    const segmentH = container.offsetHeight / EXPERIENCES.length;
    const targetY = container.offsetTop + segmentH * index + segmentH * 0.1;

    scroller.scrollTo({ top: targetY, behavior: 'smooth' }); // not window.scrollTo
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    gsap.registerPlugin(ScrollTrigger);

    const scroller = this.pageWrapperRef.nativeElement;
    const header = this.stickyHeaderRef.nativeElement;
    const container = this.scrollContainerRef.nativeElement;
    const panel = this.pinnedPanelRef.nativeElement;
    const fill = this.fillBarRef.nativeElement;
    const node = this.logoNodeRef.nativeElement;
    const n = EXPERIENCES.length;

    container.style.height = `${n * 100}vh`;

    // Add top padding to prevent hidden behind the header
    // Doing this way for a smoother scroll instead of calculating the start position on render
    const headerH = header.offsetHeight;
    panel.style.paddingTop = `${headerH + 20}px`;

    ScrollTrigger.create({
      trigger: container,
      scroller, // tell GSAP to watch this div, not window
      start: 'top ${header.offsetHeight}px',
      end: 'bottom bottom',
      pin: panel,
      pinSpacing: false,
      anticipatePin: 1,

      onUpdate: (self) => {
        const progress = self.progress;

        // Fill bar height
        gsap.set(fill, { height: `${progress * 100}%` });

        // Logo node travels top → bottom of rail (0% → 100%)
        gsap.set(node, { top: `${progress * 100}%` });

        // Determine active index
        const rawIndex = progress * n;
        const newIndex = Math.min(Math.floor(rawIndex), n - 1);

        if (newIndex !== this.prevIndex) {
          this.animateContentSwap(newIndex);
          this.prevIndex = newIndex;
        }
      },
    });
  }

  private animateContentSwap(newIndex: number): void {
    const panel = this.contentPanelRef.nativeElement;

    // Exit current content
    gsap.to(panel, {
      opacity: 0,
      // y: newIndex > this.prevIndex ? -20 : 20,
      duration: 0.22,
      ease: 'power2.in',
      onComplete: () => {
        // Update signal → Angular updates the DOM
        this.activeIndex.set(newIndex);
        this.cdr.markForCheck();

        // Small defer so Angular has rendered the new content
        setTimeout(() => {
          gsap.fromTo(panel, { opacity: 0 }, { opacity: 1, duration: 0.38, ease: 'power3.out' });
        }, 0);
      },
    });
  }

  ngOnDestroy(): void {
    ScrollTrigger.getAll().forEach((t) => t.kill());
  }
}
