import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { PageOverlayComponent } from '../../app/components/page-overlay/page-overlay.component';
import { renderStarField } from './star-background';

export interface IdCardField {
  label: string;
  value: string;
}

export interface IdCardData {
  photoUrl?: string;
  fields?: IdCardField[];
}

@Component({
  selector: 'app-about-me-page',
  standalone: true,
  imports: [PageOverlayComponent],
  templateUrl: './about-me.page.html',
  styleUrls: ['./about-me.page.scss'],
})
export class AboutMePage implements AfterViewInit {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  @ViewChild('cardContainer') cardContainer!: ElementRef<HTMLElement>;
  @ViewChild('cardInner') cardInner!: ElementRef<HTMLElement>;
  @ViewChild('clickPrompt') clickPrompt!: ElementRef<HTMLElement>;
  @ViewChild('starContainer') starContainer!: ElementRef<HTMLElement>;
  @ViewChild('starContainerBack') starContainerBack!: ElementRef<HTMLElement>;

  protected isFlipped = false;

  protected data: IdCardData = {
    photoUrl: 'images/id-photo.png',
    fields: [
      { label: 'Issued to:', value: 'Joey Chua' },
      { label: 'Place of issue:', value: 'Singapore' },
      { label: 'Role:', value: 'Software Engineer / AI Engineer' },
      { label: 'Languages:', value: 'English, Mandarin, Japanese (N5)' },
      { label: 'Work DNA:', value: 'Critical Thinking, Creative, Versatile' },
    ],
  };

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Lazy-load GSAP at runtime to avoid SSR issues
    import('gsap').then(({ gsap }) => {
      this.initStars();
      this.runEntryAnimation(gsap);
    });
  }

  // Stars
  private initStars(): void {
    renderStarField(this.starContainer.nativeElement);
    renderStarField(this.starContainerBack.nativeElement);
  }

  private runEntryAnimation(gsap: typeof import('gsap').gsap): void {
    const card = this.cardContainer.nativeElement;
    const prompt = this.clickPrompt.nativeElement;

    // Step 1 — blur-fade card in
    gsap.to(card, {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 1.1,
      ease: 'power3.out',
      onComplete: () => {
        // Step 2 — reveal click prompt after card lands
        gsap.to(prompt, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'back.out(1.4)',
        });
        // Step 3 — loop bounce on arrow
        gsap.to(prompt, {
          y: 8,
          duration: 0.6,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 0.5,
        });
      },
    });

    // Pre-position prompt just above card
    gsap.set(prompt, { y: -10 });

    // Position the click prompt relative to the card
    this.positionPrompt(prompt, card);

    // Keep the x-axis translation inside GSAP so it survives later animations
    gsap.set(prompt, { xPercent: -50 });
  }

  private positionPrompt(prompt: HTMLElement, card: HTMLElement): void {
    const cardRect = card.getBoundingClientRect();
    const promptHeight = 70; // approximate

    prompt.style.top = `${cardRect.top - promptHeight - 12 + window.scrollY}px`;
    prompt.style.left = `${cardRect.left + cardRect.width / 2}px`;
    prompt.style.position = 'fixed';
  }

  flipCard(): void {
    import('gsap').then(({ gsap }) => {
      const inner = this.cardInner.nativeElement;
      const prompt = this.clickPrompt.nativeElement;
      const targetY = this.isFlipped ? 0 : 180;

      // Hide prompt on first flip
      if (!this.isFlipped) {
        gsap.to(prompt, { opacity: 0, y: -20, duration: 0.25, ease: 'power2.in' });
      } else {
        // Show prompt again when flipping back
        gsap.to(prompt, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay: 0.6,
        });
      }

      gsap.to(inner, {
        rotateY: targetY,
        duration: 0.75,
        ease: 'power3.inOut',
      });

      this.isFlipped = !this.isFlipped;
    });
  }

  protected exitToRoot(): void {
    this.router.navigateByUrl('/');
  }
}
