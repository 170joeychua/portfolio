import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-glass-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './glass-button.component.html',
})
export class GlassButtonComponent {
  @Input() label = 'Button';
  @Input() route: string = '';
  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent) {
    this.clicked.emit(event);
  }
}
