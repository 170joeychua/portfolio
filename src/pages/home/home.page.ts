import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { gsap } from 'gsap';
import { filter, Subscription } from 'rxjs';
import { BottomFooterComponent } from '../../app/components/bottom-footer/bottom-footer';
import { GlassButtonComponent } from '../../app/components/glass-button/glass-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BottomFooterComponent, GlassButtonComponent, RouterOutlet],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements AfterViewInit, OnDestroy {
  @ViewChild('homeVideo') videoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('transitionVideo') transitionVideoRef!: ElementRef<HTMLVideoElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private routerSubscription!: Subscription;
  private readonly maxAutoplayRetries = 6;
  private autoplayRetryCount = 0;
  protected isTransitioning = false;
  protected showButtons = true;

  private readonly transitionVideos: Record<string, string> = {
    'about-me': '/videos/about-me.mp4',
    // 'tech-stack': '/videos/tech-stack.mp4',
    'tech-stack': '/videos/about-me.mp4',
    'experience': '/videos/experience.mp4',
    'projects': '/videos/projects.mp4',
    'education': '/videos/education.mp4',
    'certifications-awards': '/videos/certifications-awards.mp4',
    'photography': '/videos/photography.mp4',
    'music': '/videos/music.mp4',
  };

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    // Hide buttons whenever a child route is active
    this.routerSubscription = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        const isHome = e.urlAfterRedirects === '/' || e.urlAfterRedirects === '/home';
        this.showButtons = isHome;
      });

    const video = this.videoRef?.nativeElement;
    if (!video || typeof video.play !== 'function') return;

    this.setupVideo(video);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    this.routerSubscription?.unsubscribe();
  }

  async navigateWithTransition(route: string) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.showButtons = false;

    try {
      const homeVideo = this.videoRef?.nativeElement;
      const transitionVideo = this.transitionVideoRef?.nativeElement;

      if (!homeVideo || !transitionVideo) {
        await this.router.navigate([route]);
        return;
      }

      const transitionSrc = this.transitionVideos[route];
      if (!transitionSrc) {
        await this.router.navigate([route]);
        return;
      }

      // Step 1: Preload transition video + ramp up home video speed simultaneously
      await Promise.all([
        this.preloadVideo(transitionVideo, transitionSrc),
        this.rampPlaybackRate(homeVideo, 4, 0.6),
      ]);

      // Step 2: Wait for home.mp4 to finish its (now fast) loop
      await this.playToEnd(homeVideo);

      // Step 3: Reset playback rate before it's ever seen again
      homeVideo.playbackRate = 1;

      // Step 4: Blur dissolve into transition video
      transitionVideo.play();
      await this.blurDissolve(homeVideo, transitionVideo);

      // Step 5: Wait for transition video to finish
      await this.waitForEnd(transitionVideo);

      // Step 6: Navigate
      await this.router.navigate([route]);
    } finally {
      // Reset both videos to their default state after navigation
      const homeVideo = this.videoRef?.nativeElement;
      const transitionVideo = this.transitionVideoRef?.nativeElement;

      if (transitionVideo) {
        gsap.set(transitionVideo, { opacity: 0, filter: 'blur(0px)' });
        transitionVideo.pause();
        transitionVideo.src = '';
        transitionVideo.load();
      }

      if (homeVideo) {
        gsap.set(homeVideo, { opacity: 1, filter: 'blur(0px)' });
        homeVideo.loop = true;
        homeVideo.playbackRate = 1;
        this.autoplayRetryCount = 0;
        this.scheduleAutoplay(homeVideo);
      }

      this.isTransitioning = false;
    }
  }

  private rampPlaybackRate(
    video: HTMLVideoElement,
    targetRate: number,
    duration: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      const proxy = { rate: video.playbackRate };
      gsap.to(proxy, {
        rate: targetRate,
        duration,
        ease: 'power2.in',
        onUpdate: () => {
          video.playbackRate = proxy.rate;
        },
        onComplete: resolve,
      });
    });
  }

  private preloadVideo(video: HTMLVideoElement, src: string): Promise<void> {
    return new Promise((resolve) => {
      video.src = src;
      video.load();

      const onCanPlay = () => {
        video.removeEventListener('canplaythrough', onCanPlay);
        resolve();
      };

      video.addEventListener('canplaythrough', onCanPlay);

      // Fallback: don't block forever if canplaythrough is slow
      setTimeout(resolve, 3000);
    });
  }

  private playToEnd(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      const remaining = video.duration - video.currentTime;
      if (!isFinite(remaining) || remaining <= 0.1) {
        resolve();
        return;
      }

      video.loop = false;

      const onEnded = () => {
        video.removeEventListener('ended', onEnded);
        resolve();
      };

      video.addEventListener('ended', onEnded);
    });
  }

  private async blurDissolve(out: HTMLVideoElement, inn: HTMLVideoElement): Promise<void> {
    inn.play();
    await Promise.all([
      gsap.to(out, { filter: 'blur(40px)', opacity: 0, duration: 0.9, ease: 'power2.in' }),
      gsap.fromTo(
        inn,
        { filter: 'blur(40px)', opacity: 0 },
        { filter: 'blur(0px)', opacity: 1, duration: 0.9, ease: 'power2.out' },
      ),
    ]);
    out.style.filter = '';
  }

  private waitForEnd(video: HTMLVideoElement): Promise<void> {
    return new Promise((resolve) => {
      if (video.ended) {
        resolve();
        return;
      }

      const onEnded = () => {
        video.removeEventListener('ended', onEnded);
        resolve();
      };

      video.addEventListener('ended', onEnded);
    });
  }

  private setupVideo(video: HTMLVideoElement) {
    video.muted = true;
    video.autoplay = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.load();
    this.scheduleAutoplay(video);
  }

  private scheduleAutoplay(video: HTMLVideoElement) {
    if (this.autoplayRetryCount >= this.maxAutoplayRetries) return;

    this.autoplayRetryCount += 1;
    const playPromise = video.play();
    if (!playPromise) return;

    playPromise.catch(() => {
      const delay = 250 + this.autoplayRetryCount * 150;
      setTimeout(() => this.scheduleAutoplay(video), delay);
    });
  }

  private readonly handleVisibilityChange = () => {
    if (!isPlatformBrowser(this.platformId)) return;

    if (document.visibilityState === 'visible') {
      const video = this.videoRef?.nativeElement;
      if (video) {
        this.autoplayRetryCount = 0;
        this.scheduleAutoplay(video);
      }
    }
  };
}
