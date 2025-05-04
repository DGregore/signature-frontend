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
import { AuthService, RefreshResponse } from '../services/auth.service'; // Adjust path if needed

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = this.authService.getAccessToken();

    if (accessToken) {
      request = this.addTokenHeader(request, accessToken);
    }

    return next.handle(request).pipe(catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Check if the request was for the refresh token endpoint itself
        if (request.url.includes('/api/auth/refresh')) {
          // If refresh fails, logout
          this.authService.logout();
          return throwError(() => error);
        }
        return this.handle401Error(request, next);
      } else {
        return throwError(() => error);
      }
    }));
  }

  private addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: RefreshResponse) => {
            this.isRefreshing = false;
            this.refreshTokenSubject.next(response.access_token);
            // Clone the original request with the new token
            return next.handle(this.addTokenHeader(request, response.access_token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.authService.logout(); // Logout on refresh failure
            return throwError(() => err);
          })
        );
      } else {
        // No refresh token available, logout immediately
        this.isRefreshing = false;
        this.authService.logout();
        return throwError(() => new Error('Refresh token not available.'));
      }

    } else {
      // If refreshing is already in progress, wait for the new token
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addTokenHeader(request, jwt));
        })
      );
    }
  }
}

