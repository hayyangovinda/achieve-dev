import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./components/home/home.component').then((c) => c.HomeComponent),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import(
        './components/settings/general-settings/general-settings.component'
      ).then((c) => c.GeneralSettingsComponent),
  },
];
