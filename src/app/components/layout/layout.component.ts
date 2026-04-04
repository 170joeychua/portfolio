import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { HomePage } from '../../../pages/home/home.page';
import { TransitionService } from '../../services/transition.service';
import { BottomFooterComponent } from '../bottom-footer/bottom-footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, BottomFooterComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  private transition = inject(TransitionService);
  @ViewChild('homeVideo') homeVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('transitionVideo') transitionVideoRef!: ElementRef<HTMLVideoElement>;
  private platformId = inject(PLATFORM_ID);
  private activeNavigateSub: Subscription | null = null;
  showFooter = false;
  constructor() {}

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    const homeVideo = this.homeVideoRef.nativeElement;
    homeVideo.muted = true;
    homeVideo.autoplay = true;
    homeVideo.loop = true;
    homeVideo.playsInline = true;
    homeVideo.setAttribute('muted', '');
    homeVideo.setAttribute('playsinline', '');
    homeVideo.load();
    homeVideo.play().catch(() => console.warn('Autoplay failed, user interaction required'));
  }

  ngOnDestroy() {
    this.activeNavigateSub?.unsubscribe();
  }

  onActivate(component: unknown) {
    this.activeNavigateSub?.unsubscribe();
    this.showFooter = component instanceof HomePage;
    if (
      component &&
      (component as { navigate?: EventEmitter<string> }).navigate instanceof EventEmitter
    ) {
      this.activeNavigateSub = (component as { navigate: EventEmitter<string> }).navigate.subscribe(
        (route) => this.navigate(route),
      );
    }
  }

  navigate(route: string) {
    this.transition.navigate(
      route,
      this.homeVideoRef.nativeElement,
      this.transitionVideoRef.nativeElement,
    );
  }
}
