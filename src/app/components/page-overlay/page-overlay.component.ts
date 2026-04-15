import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-overlay',
  standalone: true,
  templateUrl: './page-overlay.component.html',
})
export class PageOverlayComponent {
  @Input() shellClass =
    'absolute inset-0 z-40 flex items-center justify-center pointer-events-none';
  @Input() backdropClass =
    'absolute inset-0 z-0 flex items-center justify-center w-full h-full backdrop-blur-[4px]';
  @Input() backdropStyle =
    'background: radial-gradient(circle at top, rgba(255, 255, 255, 0.08), transparent 45%), linear-gradient(180deg, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.15));';
  @Input() backdropClickAreaClass = 'absolute inset-0 pointer-events-auto z-0';
  @Input() enableBackdropKeyboardClose = false;

  @Output() readonly backdropClick = new EventEmitter<void>();

  protected onBackdropClick(): void {
    this.backdropClick.emit();
  }

  protected onBackdropKeyClose(event: Event): void {
    event.preventDefault();
    this.backdropClick.emit();
  }
}
