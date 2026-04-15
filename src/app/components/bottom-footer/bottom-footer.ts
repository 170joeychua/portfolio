import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-bottom-footer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './bottom-footer.html',
  styleUrl: './bottom-footer.scss',
})
export class BottomFooterComponent {
  private readonly analytics = inject(AnalyticsService);

  // Holds the currently playing animation name (null when none)
  activeAnimation: 'shake' | 'bounce' | 'pulse' | null = null;

  trackResumeDownload(): void {
    this.analytics.trackEvent('resume_download', {
      file_name: 'joey-chua-resume.pdf',
      link_location: 'footer',
    });
  }

  trackContactClick(): void {
    this.analytics.trackEvent('contact_click', {
      contact_method: 'email',
      link_location: 'footer',
    });
  }

  playRandomAnimation(): void {
    if (this.activeAnimation) return;

    const animations: ('shake' | 'bounce' | 'pulse')[] = ['shake', 'bounce', 'pulse'];
    const randomIndex = Math.floor(Math.random() * animations.length);
    this.activeAnimation = animations[randomIndex];
  }
}
