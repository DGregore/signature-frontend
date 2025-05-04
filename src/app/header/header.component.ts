import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { RouterLink } from '@angular/router'; // Import RouterLink
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true, // Mark as standalone
  imports: [CommonModule, RouterLink], // Import CommonModule and RouterLink
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  currentUser: any | null = null;
  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }
}

