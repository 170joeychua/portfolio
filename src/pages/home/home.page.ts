import { Component, EventEmitter, Output } from '@angular/core';
import { GlassButtonComponent } from '../../app/components/glass-button/glass-button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  imports: [GlassButtonComponent],
})
export class HomePage {
  @Output() navigate = new EventEmitter<string>();
}
