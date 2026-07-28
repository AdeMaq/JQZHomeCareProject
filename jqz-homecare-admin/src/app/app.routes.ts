import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

import { VisitsList } from './features/visits/visits-list/visits-list';
import { AddVisit } from './features/visits/add-visit/add-visit';
import { EditVisit } from './features/visits/edit-visit/edit-visit';
import { VisitDetails } from './features/visits/visit-details/visit-details';

// Services
import { ServicesList } from './features/services/services-list/services-list';
import { AddService } from './features/services/add-service/add-service';
import { ServiceCategories } from './features/services/service-categories/service-categories';

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
      // ADD VISIT
      // =========================

      {
        path: 'visits/add',
        component: AddVisit,
      },

      // =========================
      // EDIT VISIT
      // =========================

      {
        path: 'visits/:id/edit',
        component: EditVisit,
      },

      // =========================
      // VISIT DETAILS
      // =========================

      {
        path: 'visits/:id',
        component: VisitDetails,
      },

      // =========================
      // VISITS LIST
      // =========================

      {
        path: 'visits',
        component: VisitsList,
      },

      // =========================
      // SERVICES
      // =========================

      {
        path: 'services/add',
        component: AddService,
      },

      {
        path: 'services',
        component: ServicesList,
      },

      // =========================
      // SERVICE CATEGORIES
      // =========================

      {
        path: 'service-categories',
        component: ServiceCategories,
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
