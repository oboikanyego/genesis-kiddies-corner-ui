import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { BackendConnectionService } from './backend-connection.service';

/**
 * While Render is waking, defer backend requests rather than allowing booking
 * forms, admin views, and catalogue requests to race a sleeping server.
 * The /health request itself is outside /api and is never intercepted.
 */
export const backendWakeupInterceptor: HttpInterceptorFn = (req, next) => {
  const apiRoot = environment.apiUrl.replace(/\/+$/, '');
  if (req.url !== apiRoot && !req.url.startsWith(apiRoot + '/')) return next(req);
  const connection = inject(BackendConnectionService);
  return connection.ready().pipe(
    switchMap(() => next(req).pipe(
      // Record only completed HTTP responses, never a request merely being sent.
      tap(event => { if (event instanceof HttpResponse) connection.noteBackendActivity(); })
    ))
  );
};
