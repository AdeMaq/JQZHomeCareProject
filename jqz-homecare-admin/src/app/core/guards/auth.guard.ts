import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Don't access localStorage on the server
  if (!isPlatformBrowser(platformId)) {
    return router.createUrlTree(['/login']);
  }

  const token = localStorage.getItem('token');

  if (token) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
