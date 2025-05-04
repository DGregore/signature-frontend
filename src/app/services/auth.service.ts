import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError, switchMap } from 'rxjs';
import { Router } from '@angular/router';

// Interface for the login response from the backend
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string; // Assuming role is a string ('admin', 'user')
    sector: any | null; // Adjust type based on Sector model
  };
}

// Interface for the refresh token response
export interface RefreshResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api/auth'; // Adjust if your backend proxy is different
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<any | null>(this.getUserFromStorage()); // Store user info

  // Observable for login status
  isLoggedIn$ = this.loggedIn.asObservable();
  // Observable for current user data
  currentUser$ = this.currentUser.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --- Token Management ---

  private storeTokens(response: AuthResponse): void {
    localStorage.setItem('access_token', response.access_token);
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('current_user', JSON.stringify(response.user)); // Store user info
    this.loggedIn.next(true);
    this.currentUser.next(response.user);
  }

  private storeAccessToken(accessToken: string): void {
    localStorage.setItem('access_token', accessToken);
    this.loggedIn.next(true); // Assume still logged in if token refreshed
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private getUserFromStorage(): any | null {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('access_token');
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.loggedIn.next(false);
    this.currentUser.next(null);
  }

  // --- Authentication API Calls ---

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.storeTokens(response)),
      catchError(error => {
        console.error('Login failed:', error);
        this.clearTokens(); // Clear any potential stale tokens
        return throwError(() => new Error(error.error?.message || 'Falha no login'));
      })
    );
  }

  refreshToken(): Observable<RefreshResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      this.logout(); // If no refresh token, force logout
      return throwError(() => new Error('Refresh token não encontrado.'));
    }

    return this.http.post<RefreshResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken }).pipe(
      tap(response => this.storeAccessToken(response.access_token)),
      catchError(error => {
        console.error('Refresh token failed:', error);
        this.logout(); // If refresh fails, force logout
        return throwError(() => new Error(error.error?.message || 'Sessão expirada. Faça login novamente.'));
      })
    );
  }

  logout(): void {
    // Optional: Call backend logout endpoint if it exists to revoke refresh token server-side
    // this.http.post(`${this.apiUrl}/logout`, {}).subscribe();
    this.clearTokens();
    this.router.navigate(['/login']); // Redirect to login page
  }

  // --- Helper Methods ---

  getCurrentUserRole(): string | null {
    const user = this.currentUser.getValue();
    return user ? user.role : null;
  }
}

