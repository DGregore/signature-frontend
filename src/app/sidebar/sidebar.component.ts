import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngIf
import { RouterLink, RouterLinkActive } from '@angular/router'; // Import RouterLink and RouterLinkActive
import { AuthService } from '../services/auth.service'; // Adjust path if needed
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from '../models/user.model'; // Import UserRole from the frontend model

@Component({
  selector: 'app-sidebar',
  standalone: true, // Mark as standalone
  imports: [CommonModule, RouterLink, RouterLinkActive], // Import necessary modules
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {
  isAdmin: boolean = false;
  private userSubscription: Subscription | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$
      .pipe(
        map(user => user && user.role === UserRole.ADMIN) // Check if user exists and role is ADMIN
      )
      .subscribe(isAdmin => {
        this.isAdmin = isAdmin;
      });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }
}

