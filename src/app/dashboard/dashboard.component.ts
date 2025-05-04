import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Import HttpClient

@Component({
  selector: 'app-dashboard',
  standalone: true, // Add standalone: true
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{
  documentsPending = 5;
  documentsSigned = 12;
  profileData: any = null;
  profileError: string = '';

  constructor(private http: HttpClient) { } // Inject HttpClient

  ngOnInit(): void {
    // Lógica para buscar dados dinâmicos do backend, se necessário.
    this.fetchProfile(); // Fetch profile on init to test interceptor
  }

  // Method to fetch user profile using HttpClient (will trigger interceptor)
  fetchProfile(): void {
    this.profileError = ''; // Clear previous errors
    this.http.get<any>('/api/auth/profile').subscribe({
      next: (data) => {
        console.log('Profile fetched successfully via HttpClient:', data);
        this.profileData = data;
      },
      error: (err) => {
        console.error('Error fetching profile via HttpClient:', err);
        this.profileError = `Erro ao buscar perfil: ${err.message || err.statusText}`;
        this.profileData = null;
      }
    });
  }
}

