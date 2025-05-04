import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { LayoutComponent } from './layout/layout.component'; // Import LayoutComponent
import { DashboardComponent } from './dashboard/dashboard.component';
import { DocumentListComponent } from './document/document-list/document-list.component';
import { DocumentUploadComponent } from './document/document-upload/document-upload.component';
import { SettingsComponent } from './settings/settings.component';
import { UserManagementComponent } from './admin/user-management/user-management.component'; // Import Admin components
import { SectorManagementComponent } from './admin/sector-management/sector-management.component';

// Placeholder for AuthGuard - Assuming a function or class exists
// You might need to create this guard based on AuthService.isLoggedIn$
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { map, take } from 'rxjs';

const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        return true;
      }
      router.navigate(['/login']); // Redirect to login if not authenticated
      return false;
    })
  );
};

// Placeholder for AdminGuard - Assuming a function or class exists
// You might need to create this guard based on AuthService.getCurrentUserRole()
const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.currentUser$.pipe(
    take(1),
    map(user => {
      if (user && user.role === 'admin') {
        return true;
      }
      // Redirect or show unauthorized message if not admin
      // For simplicity, redirecting to dashboard
      router.navigate(['/dashboard']);
      return false;
    })
  );
};

export const routes: Routes = [
  // Public routes (no layout)
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'signup', component: SignUpComponent },

  // Protected routes (using LayoutComponent and AuthGuard)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard], // Protect this whole section
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Default route for logged-in users
      { path: 'dashboard', component: DashboardComponent },
      { path: 'documentos', component: DocumentListComponent }, // Renamed from document-list for clarity?
      { path: 'upload-document', component: DocumentUploadComponent },
      { path: 'settings', component: SettingsComponent },
      // Admin routes (nested under layout, protected by AuthGuard and AdminGuard)
      {
        path: 'admin',
        canActivateChild: [adminGuard], // Protect child routes for admin role
        children: [
          { path: 'usuarios', component: UserManagementComponent },
          { path: 'setores', component: SectorManagementComponent },
        ]
      }
      // Add other protected routes here
    ]
  },

  // Fallback route (optional)
  { path: '**', redirectTo: 'login' } // Redirect any unknown paths to login
];

