import { Component } from '@angular/core';

export interface IdCardField {
  label: string;
  value: string;
}

export interface IdCardData {
  photoUrl?: string;
  fields?: IdCardField[];
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
    fields: [
      { label: 'Issued to:', value: 'Joey Chua' },
      { label: 'Place of issue:', value: 'Singapore' },
      { label: 'Role:', value: 'Software Engineer / AI Engineer' },
      { label: 'Languages:', value: 'English, Mandarin, Japanese (N5)' },
      { label: 'Work DNA:', value: 'Critical Thinking, Creative, Versatile' },
    ],
  };
}
