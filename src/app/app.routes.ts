import { Routes } from '@angular/router';
import { AboutMePage } from '../pages/about-me/about-me.page';
import { ExperiencesPage } from '../pages/experiences.page/experiences.page';
import { HomePage } from '../pages/home/home.page';
import { TechStackPage } from '../pages/tech-stack/tech-stack.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'about-me',
        component: AboutMePage,
      },
      {
        path: 'tech-stack',
        component: TechStackPage,
      },
      {
        path: 'experiences',
        component: ExperiencesPage,
      },
      // {
      //   path: 'projects',
      //   component: SectionPageComponent,
      //   data: {
      //     title: 'Projects',
      //     description: 'Selected work that showcases my problem-solving approach.',
      //   },
      // },
      // {
      //   path: 'education',
      //   component: SectionPageComponent,
      //   data: {
      //     title: 'Education',
      //     description: 'Academic milestones that shaped my technical foundation.',
      //   },
      // },
      // {
      //   path: 'certifications-awards',
      //   component: SectionPageComponent,
      //   data: {
      //     title: 'Certifications & Awards',
      //     description: 'External recognition that complements my experience.',
      //   },
      // },
      // {
      //   path: 'photography',
      //   component: SectionPageComponent,
      //   data: {
      //     title: 'Photography',
      //     description: 'A personal gallery where I capture light and moments.',
      //   },
      // },
      // {
      //   path: 'music',
      //   component: SectionPageComponent,
      //   data: {
      //     title: 'Music',
      //     description: 'Rhythmic inspiration that keeps me creative outside of code.',
      //   },
      // },
    ],
  },
  { path: '**', redirectTo: '' },
];
