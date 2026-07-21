import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { VisitsList } from './features/visits/visits-list/visits-list';
import { AddVisit } from './features/visits/add-visit/add-visit';
import { VisitDetails } from './features/visits/visit-details/visit-details';

export const routes: Routes = [
  // =========================
  // DEFAULT ROUTE
  // =========================

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  // =========================
  // AUTHENTICATION ROUTES
  // =========================

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

  // =========================
  // ADMIN ROUTES
  // =========================

  {
    path: '',
    component: AdminLayout,
    canActivate: [authGuard],

    children: [
      // =========================
      // DASHBOARD
      // =========================

      {
        path: 'dashboard',
        component: Dashboard,
      },

      // =========================
      // VISITS LIST
      // =========================

      {
        path: 'visits',
        component: VisitsList,
      },

      // =========================
      // ADD VISIT
      // =========================

      {
        path: 'visits/add',
        component: AddVisit,
      },

      // =========================
      // VISIT DETAILS
      // =========================

      {
        path: 'visits/:id',
        component: VisitDetails,
      },
    ],
  },

  // =========================
  // FALLBACK ROUTE
  // =========================

  {
    path: '**',
    redirectTo: 'login',
  },
];
