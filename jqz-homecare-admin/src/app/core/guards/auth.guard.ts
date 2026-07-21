import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // During SSR, allow the route to render.
  // localStorage is only available in the browser.
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
