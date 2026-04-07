import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('../pages/home/home.page').then((module) => module.HomePage),
  },
  {
    path: 'about-me',
    loadComponent: () =>
      import('../pages/about-me/about-me.page').then((module) => module.AboutMePage),
  },
  {
    path: 'tech-stack',
    loadComponent: () =>
      import('../pages/tech-stack/tech-stack.page').then((module) => module.TechStackPage),
  },
  {
    path: 'experiences',
    loadComponent: () =>
      import('../pages/experiences.page/experiences.page').then((module) => module.ExperiencesPage),
  },
  // {
  //   path: 'projects',
  //   loadComponent: () =>
  //     import('../pages/projects.page/projects.page').then((module) => module.ProjectsPage),
  // },
  {
    path: 'education',
    loadComponent: () =>
      import('../pages/education.page/education.page').then((module) => module.EducationPage),
  },
  // {
  //   path: 'recognitions',
  //   component: ,
  // },
  // {
  //   path: 'hobbies',
  //   component: ,
  // },
  { path: '**', redirectTo: '' },
];
