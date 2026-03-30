import { Component } from '@angular/core';

export interface IdCardData {
  photoUrl?: string;
  name?: string;
  subtitle?: string;
}

@Component({
  selector: 'app-about-me-page',
  standalone: true,
  imports: [],
  templateUrl: './about-me.page.html',
  styleUrls: ['./about-me.page.scss'],
})
export class AboutMePage {
  protected data: IdCardData = {
    photoUrl: 'images/id-photo.png',
    name: 'Joey Chua',
    subtitle: 'Member ID #00421',
  };
}
