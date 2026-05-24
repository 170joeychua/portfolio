import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-me-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './about-me-button.html',
})
export class AboutMeButton {}
