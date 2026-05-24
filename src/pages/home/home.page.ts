import { Component, inject } from '@angular/core';
import { AboutMeButton } from '../../app/components/nav-buttons/about-me-button/about-me-button';
import { EducationButton } from '../../app/components/nav-buttons/education-button/education-button';
import { ExperiencesButton } from '../../app/components/nav-buttons/experiences-button/experiences-button';
import { RecognitionsButton } from '../../app/components/nav-buttons/recognitions-button/recognitions-button';
import { TechStackButton } from '../../app/components/nav-buttons/tech-stack-button/tech-stack-button';
import { TransitionService } from '../../app/services/transition.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [AboutMeButton, TechStackButton, RecognitionsButton, ExperiencesButton, EducationButton],
})
export class HomePage {
  private transition = inject(TransitionService);
  protected isTransitionPlaying = this.transition.isTransitionPlaying;
}
