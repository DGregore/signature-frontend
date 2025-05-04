import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService, private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    if (accessToken) {
      request = this.addTokenHeader(request, accessToken);
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Specific handling for 401 Unauthorized errors
        return this.handle401Error(request, next);
      } else {
        // For other errors, just pass them through
        return throwError(() => error);
      }
    }));
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    // Clone the request and add the authorization header
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Exclude login and refresh routes from refresh logic
    if (request.url.includes('/auth/login') || request.url.includes('/auth/refresh')) {
        // If error on login/refresh, logout immediately
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Authentication failed on login/refresh endpoint.'));
    }

    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((tokenResponse: any) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(tokenResponse.access_token);
            // Re-send the original request with the new token
            return next.handle(this.addTokenHeader(request, tokenResponse.access_token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            // Refresh failed, logout user
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(() => err); // Propagate the refresh error
          })
        );
      } else {
        // No refresh token available, logout user
        this.isRefreshing = false;
        this.authService.logout();
        this.router.navigate(['/login']);
        return throwError(() => new Error('No refresh token available.'));
      }
    } else {
      // If already refreshing, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          // Re-send the original request with the new token obtained from the initial refresh
          return next.handle(this.addTokenHeader(request, jwt));
        }),
        catchError((err) => {
            // If waiting also leads to error (e.g. original refresh failed), ensure logout
            this.isRefreshing = false; // Reset flag just in case
            this.authService.logout();
            this.router.navigate(['/login']);
            return throwError(() => err);
        })
      );
    }
  }
}

