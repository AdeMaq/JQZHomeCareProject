// import { authGuard } from './core/guards/auth.guard';
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '',
    component: AuthLayout,

    children: [
      {
        path: 'login',
        component: Login,
      },
    ],
  },

  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: Dashboard,
      },
    ],
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];
