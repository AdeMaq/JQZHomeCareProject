import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { AdminLayout } from './layouts/admin-layout/admin-layout';

import { Login } from './features/auth/login/login';
import { Dashboard } from './features/dashboard/dashboard/dashboard';

// Visits
import { VisitsList } from './features/visits/visits-list/visits-list';
import { AddVisit } from './features/visits/add-visit/add-visit';
import { EditVisit } from './features/visits/edit-visit/edit-visit';
import { VisitDetails } from './features/visits/visit-details/visit-details';

// Services
import { ServicesList } from './features/services/services-list/services-list';
import { AddService } from './features/services/add-service/add-service';
import { EditService } from './features/services/edit-service/edit-service';
import { ServiceCategories } from './features/services/service-categories/service-categories';

// Cities
import { CitiesList } from './features/locations/cities-list/cities-list';
import { AddCity } from './features/locations/add-city/add-city';
import { EditCity } from './features/locations/edit-city/edit-city';

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
      // VISITS
      // =========================

      {
        path: 'visits/add',
        component: AddVisit,
      },

      {
        path: 'visits/:id/edit',
        component: EditVisit,
      },

      {
        path: 'visits/:id',
        component: VisitDetails,
      },

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
        path: 'services/:id/edit',
        component: EditService,
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

      // =========================
      // CITIES
      // =========================

      {
        path: 'cities/add',
        component: AddCity,
      },

      {
        path: 'cities/:id/edit',
        component: EditCity,
      },

      {
        path: 'cities',
        component: CitiesList,
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
