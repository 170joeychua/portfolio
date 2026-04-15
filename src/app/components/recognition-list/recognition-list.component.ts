import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface RecognitionItem {
  title: string;
  org: string;
  period: string;
  badge: string;
  accentColor: string;
  image: string;
  details?: string;
  link?: string | null;
}

@Component({
  selector: 'app-recognition-list',
  imports: [CommonModule],
  templateUrl: './recognition-list.component.html',
  styleUrl: './recognition-list.component.scss',
})
export class RecognitionListComponent {
  @Input({ required: true }) items: RecognitionItem[] = [];
  @Input({ required: true }) tabPrefix = '';
  @Input() expandedKey: string | null = null;

  @Output() hovered = new EventEmitter<number>();
  @Output() unhovered = new EventEmitter<void>();
  @Output() expandToggle = new EventEmitter<string>();

  onToggle(index: number) {
    this.expandToggle.emit(`${this.tabPrefix}-${index}`);
  }

  onHover(index: number) {
    this.hovered.emit(index);
  }

  onUnhover() {
    this.unhovered.emit();
  }

  isExpanded(index: number) {
    return this.expandedKey === `${this.tabPrefix}-${index}`;
  }

  trackByTitle(index: number, item: RecognitionItem) {
    return `${item.title}-${index}`;
  }
}
