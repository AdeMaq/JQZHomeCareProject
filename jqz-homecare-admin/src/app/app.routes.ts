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

// Packages
import { PackagesList } from './features/packages/packages-list/packages-list';
import { AddPackage } from './features/packages/add-package/add-package';
import { EditPackage } from './features/packages/edit-package/edit-package';

// Cities
import { CitiesList } from './features/locations/cities-list/cities-list';
import { AddCity } from './features/locations/add-city/add-city';
import { EditCity } from './features/locations/edit-city/edit-city';

// Areas
import { AreasList } from './features/locations/areas-list/areas-list';
import { AddArea } from './features/locations/add-area/add-area';
import { EditArea } from './features/locations/edit-area/edit-area';

// Practitioners
import { PractitionersList } from './features/practitioners/practitioners-list/practitioners-list';
import { AddPractitioner } from './features/practitioners/add-practitioner/add-practitioner';
import { PractitionerProfile } from './features/practitioners/practitioner-profile/practitioner-profile';
import { EditPractitioner } from './features/practitioners/edit-practitioner/edit-practitioner';
import { MergePractitionerAreas } from './features/practitioners/merge-practitioner-areas/merge-practitioner-areas';

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
      // PACKAGES
      // =========================

      {
        path: 'packages/add',
        component: AddPackage,
      },

      {
        path: 'packages/:id/edit',
        component: EditPackage,
      },

      {
        path: 'packages',
        component: PackagesList,
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

      // =========================
      // AREAS
      // =========================

      {
        path: 'areas/add',
        component: AddArea,
      },

      {
        path: 'areas/:id/edit',
        component: EditArea,
      },

      {
        path: 'areas',
        component: AreasList,
      },

      // =========================
      // PRACTITIONERS
      // =========================

      {
        path: 'practitioners/add',
        component: AddPractitioner,
      },

      {
        path: 'practitioners/:id/edit',
        component: EditPractitioner,
      },

      // IMPORTANT:
      // This route must come BEFORE /practitioners/:id
      {
        path: 'practitioners/:id/areas',
        component: MergePractitionerAreas,
      },

      {
        path: 'practitioners/:id',
        component: PractitionerProfile,
      },

      {
        path: 'practitioners',
        component: PractitionersList,
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
