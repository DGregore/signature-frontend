import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Import progress spinner
import { AuthService } from '../services/auth.service'; // Import AuthService
import { finalize } from 'rxjs/operators'; // Import finalize

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule, // Add progress spinner module
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService // Inject AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // Optional: Redirect if already logged in
    if (this.authService.getAccessToken()) {
      // Maybe redirect to dashboard or intended route
      // this.router.navigate(['/dashboard']);
    }
  }

  // Método para fazer login usando AuthService
  login() { // Renamed from Login to login (convention)
    if (this.loginForm.invalid) {
      this.error = 'Por favor, preencha o email e a senha corretamente.';
      return;
    }

    this.loading = true;
    this.error = ''; // Clear previous errors
    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password })
      .pipe(
        finalize(() => this.loading = false) // Ensure loading is set to false after completion/error
      )
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          // Redirect to the Dashboard upon successful login
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login error:', err);
          // Display error message from backend or a generic one
          this.error = err.message || 'Falha no login. Verifique suas credenciais.';
        }
      });
  }
}

