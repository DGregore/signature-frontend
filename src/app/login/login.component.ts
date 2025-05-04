import { Component, OnInit } from '@angular/core'; // Import OnInit
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  standalone: true, // Ensure it's standalone
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit { // Implement OnInit
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private router: Router) {
    console.log('LoginComponent constructor called'); // Add log
    // Criar o formulário de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    console.log('LoginComponent ngOnInit called'); // Add log
  }

  // Método para fazer login
  Login() {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { email, password } = this.loginForm.value;

    // Simulação de login (substitua com sua lógica de autenticação real)
    if (email === 'admin@admin.com' && password === '123456') {
      // Redireciona para o Dashboard
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Credenciais inválidas. Tente novamente.';
      this.loading = false;
    }
  }
}

