import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { appRoutes } from './app.routes';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http'; // Import HTTP_INTERCEPTORS
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Often needed for Angular Material

// Import the interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Import other components used in declarations if necessary (example)
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { ... } from '...';

@NgModule({
  declarations: [
    // AppComponent, // AppComponent is often standalone or part of another module now
    // LoginComponent, // Declare components here if not standalone
    // Add other components like DashboardComponent, etc.
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Add BrowserAnimationsModule
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    // Import standalone components or modules containing them if needed
    AppComponent, // Import standalone AppComponent if it is
    LoginComponent // Import standalone LoginComponent if it is
  ],
  providers: [
    // Provide the interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  // No bootstrap array here if AppComponent is standalone and bootstrapped in main.ts
  // bootstrap: [AppComponent] // Remove or comment out if AppComponent is standalone
})
export class AppModule { }

