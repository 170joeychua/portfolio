import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export type KeySize = 'sm' | 'md' | 'lg' | 'xl' | 'wide' | 'space';
export type KeyVariant = 'default' | 'accent' | 'danger';

@Component({
  selector: 'app-key-button',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './keyboard-button.html',
  styleUrl: './keyboard-button.scss',
})
export class KeyboardButtonComponent {
  /** Primary legend (e.g. "ESC", "A"). Always shown. */
  @Input() label: string = '';

  /**
   * Optional sub-label rendered below the main legend.
   * Mutually exclusive with `icon` — if both are set, subLabel wins.
   */
  @Input() subLabel?: string;

  /**
   * Optional PrimeIcons class rendered below the label (e.g. "pi pi-home").
   * If no `label` is provided either, the key enters icon-only mode and the
   * icon is centred on its own.
   */
  @Input() icon?: string;

  /** Key face size */
  @Input() size: KeySize = 'md';

  /** Visual colour variant */
  @Input() variant: KeyVariant = 'default';

  /** ARIA label override — recommended when using icon-only keys */
  @Input() ariaLabel?: string;

  /** Disable the key */
  @Input() disabled: boolean = false;

  /** Emits the label string on click */
  @Output() clickedKey = new EventEmitter<string>();

  _pressed = signal(false);

  topClasses = computed(() => {
    const cls: string[] = [this.size];
    if (this.variant !== 'default') cls.push(this.variant);
    return cls;
  });

  onPress() {
    if (!this.disabled) this._pressed.set(true);
  }
  onRelease() {
    this._pressed.set(false);
  }
}
