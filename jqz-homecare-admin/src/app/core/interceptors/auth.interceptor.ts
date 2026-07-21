import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  console.log('AUTH INTERCEPTOR EXECUTED:', req.url);

  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');

    console.log('TOKEN IN INTERCEPTOR:', token);

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('AUTHORIZATION HEADER ADDED');
    } else {
      console.log('NO TOKEN FOUND');
    }
  } else {
    console.log('INTERCEPTOR RUNNING ON SERVER');
  }

  return next(req);
};
