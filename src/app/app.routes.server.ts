import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    // Use server rendering to support dynamic routes (e.g. /projects/:id) without defining static prerender params.
    renderMode: RenderMode.Server,
  },
];
