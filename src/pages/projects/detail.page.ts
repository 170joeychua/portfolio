import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { gsap } from 'gsap';
import { Project, PROJECTS } from '../../app/models/projects-data.model';
import { GalleryTransitionService } from '../../app/services/galleyTransition.service';

@Component({
  standalone: true,
  selector: 'app-detail',
  imports: [CommonModule],
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit, AfterViewInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private transitionSvc = inject(GalleryTransitionService);

  work?: Project;

  @ViewChild('detailScroll') detailScroll?: ElementRef<HTMLElement>;
  @ViewChild('heroMedia') heroMedia?: ElementRef<HTMLElement>;
  @ViewChild('detailInfo') detailInfo?: ElementRef<HTMLElement>;

  private scrollHandler?: () => void;
  private exitLock = false;
  private savedGalleryScrollY = 0;

  ngOnInit() {
    const entryId = this.route.snapshot.paramMap.get('id');
    if (!entryId) {
      this.router.navigate(['/projects']);
      return;
    }
    this.work = PROJECTS.find((entry) => entry.id === entryId);
    if (!this.work) {
      this.router.navigate(['/projects']);
    }
  }

  ngAfterViewInit() {
    this.playEntranceAnimation();

    if (!this.detailScroll || typeof window === 'undefined') return;
    this.scrollHandler = this.createScrollHandler(this.detailScroll.nativeElement);
    this.detailScroll.nativeElement.addEventListener('scroll', this.scrollHandler, {
      passive: true,
    });
  }

  ngOnDestroy() {
    if (this.scrollHandler && this.detailScroll?.nativeElement) {
      this.detailScroll.nativeElement.removeEventListener('scroll', this.scrollHandler);
    }
  }

  private createScrollHandler(container: HTMLElement) {
    const threshold = 64;
    return () => {
      if (this.exitLock) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop <= threshold || scrollHeight - scrollTop - clientHeight <= threshold) {
        this.exitLock = true;
        this.navigateBack();
      }
    };
  }

  private navigateBack() {
    sessionStorage.setItem('gallery-scroll', String(this.savedGalleryScrollY));

    if (!this.detailScroll?.nativeElement) {
      this.router.navigate(['/projects']);
      return;
    }

    gsap.to(this.detailScroll.nativeElement, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.inOut',
      onComplete: () => void this.router.navigate(['/projects']),
    });
  }

  private playEntranceAnimation() {
    const snap = this.transitionSvc.consume();

    if (snap) {
      this.savedGalleryScrollY = snap.scrollY;
    }

    const media = this.heroMedia?.nativeElement;

    if (!snap || !media || typeof window === 'undefined') {
      if (this.detailInfo?.nativeElement) {
        this.detailInfo.nativeElement.style.opacity = '1';
        this.detailInfo.nativeElement.style.transform = 'translateY(0)';
      }
      return;
    }

    const { rect, imageUrl } = snap;

    if (this.detailScroll?.nativeElement) {
      this.detailScroll.nativeElement.style.overflow = 'hidden';
    }

    const clone = document.createElement('div');
    clone.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      background-image: url(${imageUrl});
      background-size: cover;
      background-position: center;
      z-index: 1000;
      pointer-events: none;
      border-radius: 0;
    `;
    document.body.appendChild(clone);

    media.style.opacity = '0';
    if (this.detailInfo?.nativeElement) {
      this.detailInfo.nativeElement.style.opacity = '0';
      this.detailInfo.nativeElement.style.transform = 'translateY(12px)';
    }

    const finalRect = media.getBoundingClientRect();

    gsap.fromTo(
      clone,
      {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      },
      {
        top: finalRect.top,
        left: finalRect.left,
        width: finalRect.width,
        height: finalRect.height,
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: () => {
          media.style.opacity = '1';
          clone.remove();

          if (this.detailScroll?.nativeElement) {
            this.detailScroll.nativeElement.style.overflow = '';
          }

          if (this.detailInfo?.nativeElement) {
            gsap.to(this.detailInfo.nativeElement, {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
            });
          }
        },
      },
    );
  }
}
