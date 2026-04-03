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
      //   component: ,
      // },
      // {
      //   path: 'education',
      //   component: ,
      // },
      // {
      //   path: 'recognitions',
      //   component: ,
      // },
      // {
      //   path: 'hobbies',
      //   component: ,
      // },
    ],
  },
  { path: '**', redirectTo: '' },
];
