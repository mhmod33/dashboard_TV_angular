import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthServiceService } from './auth-service/auth-service.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthServiceService)
  const token = authService.getToken();
  console.log('Interceptor - Token:', token);
  console.log('Interceptor - Request URL:', req.url);

  if (token) {
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    })
    console.log('Interceptor - Added Authorization header');
    return next(authReq);

  }
  console.log('Interceptor - No token found');
  return next(req);
};
