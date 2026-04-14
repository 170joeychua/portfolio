import { Component, inject } from '@angular/core';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-bottom-footer',
  standalone: true,
  templateUrl: './bottom-footer.html',
  styleUrl: './bottom-footer.scss',
})
export class BottomFooterComponent {
  private readonly analytics = inject(AnalyticsService);

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
}
