import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PageOverlayComponent } from '../../app/components/page-overlay/page-overlay.component';
import {
  RecognitionItem,
  RecognitionListComponent,
} from '../../app/components/recognition-list/recognition-list.component';
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-recognitions.page',
  imports: [
    CommonModule,
    SelectButtonModule,
    FormsModule,
    RecognitionListComponent,
    PageOverlayComponent,
  ],
  templateUrl: './recognitions.page.html',
  styleUrl: './recognitions.page.scss',
})
export class RecognitionsPage implements AfterViewInit, OnDestroy, OnInit {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  tabs = [
    { id: 'industry', label: 'CERT & AWARDS' },
    { id: 'online', label: 'ONLINE CERTS' },
    { id: 'other', label: 'PARTICIPATIONS' },
  ];

  activeTab: 'industry' | 'online' | 'other' = 'industry';
  expandedKey: string | null = null;

  // Live clock
  currentTime = '';
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  toggleExpand(key: string) {
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  get activeTabCount(): number {
    return this.getActiveItems().length;
  }

  // ── Industry Certifications & Awards ──────────────────────────────────────
  industryCerts: RecognitionItem[] = [
    {
      title: 'NVIDIA-Certified Associate: AI Infrastructure and Operations',
      org: 'NVIDIA',
      period: 'FEB 2026 – FEB 2028',
      badge: 'CERTIFICATION',
      accentColor: '#a78bfa',
      image: 'images/recognitions/nvida-aiio.png',
      details: '',
    },
    {
      title:
        'Singapore Computer Society Prize for Final Year Best Capstone Project in Software Engineering',
      org: 'Singapore Institute of Technology & Singapore Computer Society',
      period: 'OCT 2024',
      badge: 'AWARD',
      accentColor: '#fbbf24',
      image: 'images/recognitions/best-capstone.png',
      details: '',
    },
    {
      title: 'Professional Scrum Master I',
      org: 'SCRUM.org',
      period: 'AUG 2022',
      badge: 'CERTIFICATION',
      accentColor: '#a78bfa',
      image: 'images/recognitions/psm-scrum.png',
      details: '',
    },
  ];

  // ── Online Certifications ─────────────────────────────────────────────────
  onlineCerts: RecognitionItem[] = [
    {
      title: 'MongoDB Aggregation Fundamentals Badge',
      org: 'MongoDB University',
      period: 'FEB 2026 – FEB 2028',
      badge: 'BADGE',
      accentColor: '#5eead4',
      image: 'images/recognitions/mongodb-aggregation.png',
      details: '',
    },
    {
      title: 'MongoDB Schema Design Patterns and Anti-patterns Skill Badge',
      org: 'MongoDB University',
      period: 'AUG 2022',
      badge: 'BADGE',
      accentColor: '#5eead4',
      image: 'images/recognitions/mongodb-schema.png',
      details: '',
    },
    {
      title: 'VMware Docker Fundamentals',
      org: 'VMware',
      period: 'OCT 2022',
      badge: 'CERTIFICATION',
      accentColor: '#a78bfa',
      image: 'images/recognitions/vmware-docker.png',
      details: '',
    },
  ];

  // ── Participations ────────────────────────────────────────────────────────
  participations: RecognitionItem[] = [
    {
      title: 'PSA Code Sprint Hackathon',
      org: 'PSA Singapore',
      period: '2023',
      badge: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image: 'images/recognitions/psa.png',
      details: '',
    },
    {
      title: 'SIT Developers Club',
      org: 'Singapore Institute of Technology',
      period: '2021 – 2022',
      badge: 'HEAD OF PUBLICITY',
      link: 'https://www.linkedin.com/company/sitech-developers-club/posts/?feedView=all',
      accentColor: '#a78bfa',
      image: 'images/recognitions/sit.jpeg',
      details: '',
    },
    {
      title: 'Google Developer Student Club',
      org: 'Google',
      period: '2021 – 2022',
      badge: 'TEAM MEMBER',
      link: null,
      accentColor: '#7dd3fc',
      image: 'images/recognitions/gdsc.png',
      details: '',
    },
    {
      title: 'SIT HackRift (Hackathon)',
      org: 'SIT Developers Club',
      period: '2022',
      badge: 'ORGANISER',
      link: 'https://sit-hackrift.netlify.app/',
      accentColor: '#fbbf24',
      image: 'images/recognitions/hackrift.png',
      details: '',
    },
    {
      title: 'Meta Above and Beyond CS (ABCS) Programme 2022 Cohort',
      org: 'Meta Singapore',
      period: '2022',
      badge: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image: 'images/recognitions/abcs.png',
      details: '',
    },
    {
      title: 'Tech for Good',
      org: 'Engineering Good',
      period: '2021',
      badge: 'PARTICIPANT',
      link: 'https://www.singaporetech.edu.sg/news/tech-good-2021-social-innovation-good-cause',
      accentColor: '#a8a29e',
      image: 'images/recognitions/t4g.png',
      details: '',
    },
    {
      title: 'Shopee Code League',
      org: 'Shopee Singapore',
      period: '2020',
      badge: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image: 'images/recognitions/shopee-code-league.png',
      details: '',
    },
  ];

  // ── Cursor preview state ──────────────────────────────────────────────────
  hoveredIndex: number | null = null;
  smoothPosition = { x: 0, y: 0 };
  isPreviewVisible = false;
  isPreviewColorized = false;
  viewportPosition = { x: 0, y: 0 };

  private animationFrame: number | null = null;
  private previewColorizeFrame: number | null = null;

  @ViewChild('showcaseContainer', { static: true })
  showcaseContainer!: ElementRef<HTMLElement>;

  ngOnInit() {
    this.updateClock();
    if (this.isBrowser) {
      this.clockInterval = setInterval(() => this.updateClock(), 1000);
    }
  }

  ngAfterViewInit() {
    if (!this.isBrowser) return;
    this.runPreviewLoop();
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.previewColorizeFrame) {
      cancelAnimationFrame(this.previewColorizeFrame);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    this.currentTime = `${hh}:${mm}:${ss}`;
  }

  handleMouseMove(event: MouseEvent) {
    this.viewportPosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  handleMouseEnter(index: number) {
    this.hoveredIndex = index;
    this.isPreviewVisible = true;
    this.startPreviewColorTransition();
  }

  handleMouseLeave() {
    this.hoveredIndex = null;
    this.isPreviewVisible = false;
    this.isPreviewColorized = false;
    if (this.previewColorizeFrame) {
      cancelAnimationFrame(this.previewColorizeFrame);
      this.previewColorizeFrame = null;
    }
  }

  get activePreviewImage(): string | null {
    if (this.hoveredIndex === null) return null;
    return this.getActiveItems()[this.hoveredIndex]?.image ?? null;
  }

  private runPreviewLoop() {
    if (!this.isBrowser) return;
    const animate = () => {
      this.smoothPosition = {
        x: this.lerp(this.smoothPosition.x, this.viewportPosition.x, 0.15),
        y: this.lerp(this.smoothPosition.y, this.viewportPosition.y, 0.15),
      };
      this.animationFrame = requestAnimationFrame(animate);
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  private lerp(start: number, end: number, factor: number) {
    return start + (end - start) * factor;
  }

  getActiveItems(): RecognitionItem[] {
    if (this.activeTab === 'industry') return this.industryCerts;
    if (this.activeTab === 'online') return this.onlineCerts;
    return this.participations;
  }

  private startPreviewColorTransition() {
    this.isPreviewColorized = false;

    if (!this.isBrowser) {
      this.isPreviewColorized = true;
      return;
    }

    if (this.previewColorizeFrame) {
      cancelAnimationFrame(this.previewColorizeFrame);
    }

    this.previewColorizeFrame = requestAnimationFrame(() => {
      this.isPreviewColorized = true;
      this.previewColorizeFrame = null;
    });
  }

  exitToRoot() {
    this.router.navigateByUrl('/');
  }
}
