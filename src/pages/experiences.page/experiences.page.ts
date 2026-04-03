import { isPlatformBrowser, NgClass, NgStyle } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { RippleModule } from 'primeng/ripple';

// ─── Data Model ────────────────────────────────────────────────────────────────

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  logoUrl: string;
  color: string; // accent colour per ticket
  description?: string[];
}

// ─── Mock Data (sourced from Joey Chua's resume) ───────────────────────────────

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

  readonly experiences: Experience[] = EXPERIENCES;
  readonly activeId = signal<string>(EXPERIENCES[0].id);

  @ViewChildren('timelineSection') sectionEls!: QueryList<ElementRef<HTMLElement>>;

  private scrollObserver?: IntersectionObserver;
  private fadeObserver?: IntersectionObserver;

  constructor() {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // ── Fade-up observer ─────────────────────────────────────────────
    this.fadeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12 },
    );

    // ── Active-section observer ──────────────────────────────────────
    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset['id'];
            if (id) {
              this.activeId.set(id);
              this.cdr.markForCheck();
            }
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );

    this.sectionEls.forEach((el) => {
      this.fadeObserver!.observe(el.nativeElement);
      this.scrollObserver!.observe(el.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
    this.fadeObserver?.disconnect();
  }

  scrollToSection(id: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.querySelector(`[data-id="${id}"]`) as HTMLElement | null;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    this.activeId.set(id);
  }
}
