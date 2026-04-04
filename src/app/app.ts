import { Component } from '@angular/core';
import { gsap } from 'gsap';
import { CSSPlugin } from 'gsap/CSSPlugin';
import { LayoutComponent } from './components/layout/layout.component';

gsap.registerPlugin(CSSPlugin);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
