import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';

export const routes: Routes = [
  {
    path: 'usage-policy',
    loadComponent: () =>
      import('../pages/usage-policy/usage-policy.page').then((module) => module.UsagePolicyPage),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('../pages/privacy-policy/privacy-policy.page').then(
        (module) => module.PrivacyPolicyPage,
      ),
  },
  {
    path: '',
    component: LayoutComponent,
    children: [
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
          import('../pages/experiences/experiences.page').then((module) => module.ExperiencesPage),
      },
      {
        path: 'projects',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('../pages/projects/gallery.page').then((module) => module.GalleryPage),
          },
          {
            path: ':id',
            loadComponent: () =>
              import('../pages/projects/detail.page').then((module) => module.DetailPage),
          },
        ],
      },
      {
        path: 'education',
        loadComponent: () =>
          import('../pages/education/education.page').then((module) => module.EducationPage),
      },
      {
        path: 'recognitions',
        loadComponent: () =>
          import('../pages/recognitions/recognitions.page').then(
            (module) => module.RecognitionsPage,
          ),
      },
      // {
      //   path: 'hobbies',
      //   component: ,
      // },
      { path: '**', redirectTo: '' },
    ],
  },
  { path: '**', redirectTo: '' },
];
