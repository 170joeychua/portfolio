import { Component, EventEmitter, inject, Output } from '@angular/core';
import { GlassButtonComponent } from '../../app/components/glass-button/glass-button.component';
import { TransitionService } from '../../app/services/transition.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [GlassButtonComponent],
})
export class HomePage {
  private transition = inject(TransitionService);
  protected isTransitionPlaying = this.transition.isTransitionPlaying;
  @Output() navigate = new EventEmitter<string>();
}
