import { Routes } from '@angular/router';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        component: Login
      }
    ]
  },

  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      }
    ]
  },

  {
    path: '**',
    redirectTo: 'login'
  }

];