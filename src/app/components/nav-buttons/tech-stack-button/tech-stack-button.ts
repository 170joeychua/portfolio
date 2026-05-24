import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tech-stack-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './tech-stack-button.html',
})
export class TechStackButton {}
