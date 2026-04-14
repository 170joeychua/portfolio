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
import { SelectButtonModule } from 'primeng/selectbutton';

@Component({
  selector: 'app-recognitions.page',
  imports: [CommonModule, SelectButtonModule, FormsModule],
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

  activeTab = 'industry';
  expandedKey: string | null = null;

  // Live clock
  currentTime = '';
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  toggleExpand(key: string) {
    this.expandedKey = this.expandedKey === key ? null : key;
  }

  isExpanded(key: string) {
    return this.expandedKey === key;
  }

  get activeTabCount(): number {
    if (this.activeTab === 'industry') return this.industryCerts.length;
    if (this.activeTab === 'online') return this.onlineCerts.length;
    if (this.activeTab === 'other') return this.participations.length;
    return 0;
  }

  // ── Industry Certifications & Awards ──────────────────────────────────────
  industryCerts = [
    {
      title: 'NVIDIA-Certified Associate: AI Infrastructure and Operations',
      org: 'NVIDIA',
      period: 'FEB 2026 – FEB 2028',
      badge: 'CERTIFICATION',
      accentColor: '#a78bfa',
      image:
        'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      title:
        'Singapore Computer Society Prize for Final Year Best Capstone Project in Software Engineering',
      org: 'Singapore Computer Society',
      period: 'OCT 2024',
      badge: 'AWARD',
      accentColor: '#fbbf24',
      image:
        'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      title: 'Professional Scrum Master I',
      org: 'SCRUM.org',
      period: 'AUG 2022',
      badge: 'CERTIFICATION',
      accentColor: '#a78bfa',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop',
      details: '',
    },
  ];

  // ── Online Certifications ─────────────────────────────────────────────────
  onlineCerts = [
    {
      title: 'MongoDB Aggregation Fundamentals Badge',
      org: 'MongoDB University',
      period: 'FEB 2026 – FEB 2028',
      accentColor: '#5eead4',
      image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      title: 'MongoDB Schema Design Patterns and Anti-patterns Skill Badge',
      org: 'MongoDB University',
      period: 'AUG 2022',
      accentColor: '#5eead4',
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      title: 'VMware Docker Fundamentals',
      org: 'VMware',
      period: 'OCT 2022',
      accentColor: '#5eead4',
      image:
        'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop',
      details: '',
    },
  ];

  // ── Participations ────────────────────────────────────────────────────────
  participations = [
    {
      name: 'PSA Code Sprint Hackathon',
      period: '2023',
      role: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image:
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'SIT Developers Club',
      period: '2021 – 2022',
      role: 'HEAD OF PUBLICITY',
      link: null,
      accentColor: '#a78bfa',
      image:
        'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'Google Developer Student Club',
      period: '2021 – 2022',
      role: 'TEAM MEMBER',
      link: null,
      accentColor: '#7dd3fc',
      image:
        'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'SIT HackRift (Hackathon)',
      period: '2022',
      role: 'ORGANISER',
      link: 'https://sit-hackrift.netlify.app/',
      accentColor: '#fbbf24',
      image:
        'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'Meta Above and Beyond CS (ABCS) Programme 2022 Cohort',
      period: '2022',
      role: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'Tech for Good',
      period: '2021',
      role: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image:
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop',
      details: '',
    },
    {
      name: 'Shopee Code League',
      period: '2020',
      role: 'PARTICIPANT',
      link: null,
      accentColor: '#a8a29e',
      image:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop',
      details: '',
    },
  ];

  // ── Cursor preview state ──────────────────────────────────────────────────
  hoveredIndex: number | null = null;
  smoothPosition = { x: 0, y: 0 };
  isPreviewVisible = false;
  viewportPosition = { x: 0, y: 0 };

  private animationFrame: number | null = null;

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
  }

  handleMouseLeave() {
    this.hoveredIndex = null;
    this.isPreviewVisible = false;
  }

  get activePreviewImage(): string | null {
    if (this.hoveredIndex === null) return null;
    if (this.activeTab === 'industry') return this.industryCerts[this.hoveredIndex]?.image ?? null;
    if (this.activeTab === 'online') return this.onlineCerts[this.hoveredIndex]?.image ?? null;
    if (this.activeTab === 'other') return this.participations[this.hoveredIndex]?.image ?? null;
    return null;
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

  exitToRoot() {
    this.router.navigateByUrl('/');
  }
}
