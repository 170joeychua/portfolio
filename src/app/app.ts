import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { BottomFooterComponent } from './components/bottom-footer/bottom-footer';
import { GlassButtonComponent } from './components/glass-button/glass-button.component';

@Component({
  selector: 'app-root',
  imports: [BottomFooterComponent, GlassButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewInit {
  @ViewChild('landVideo') videoRef!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const video = this.videoRef.nativeElement;
    video.muted = true;
    video.play().catch(() => {
      // fallback: play on first user interaction
      document.addEventListener('click', () => video.play(), { once: true });
    });
  }
}
