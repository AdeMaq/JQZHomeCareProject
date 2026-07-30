import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  console.log('=================================');
  console.log('AUTH GUARD EXECUTED');
  console.log('Attempted URL:', state.url);

  // During SSR, localStorage is not available.
  if (!isPlatformBrowser(platformId)) {
    console.log('Running on server/SSR');
    console.log('=================================');

    return true;
  }

  const token = localStorage.getItem('token');

  console.log('TOKEN FROM GUARD:', token);
  console.log('TOKEN EXISTS:', !!token);
  console.log('CURRENT URL:', window.location.href);

  if (token) {
    console.log('AUTH GUARD: ALLOWED');
    console.log('=================================');

    return true;
  }

  console.log('AUTH GUARD: BLOCKED');
  console.log('REDIRECTING TO LOGIN');
  console.log('=================================');

  return router.createUrlTree(['/login']);
};
