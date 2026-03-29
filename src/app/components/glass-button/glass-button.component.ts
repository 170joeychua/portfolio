import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-glass-button',
  templateUrl: './glass-button.component.html',
})
export class GlassButtonComponent {
  @Input() label = 'Button';
  @Output() clicked = new EventEmitter<MouseEvent>();

  handleClick(event: MouseEvent) {
    this.clicked.emit(event);
  }
}
