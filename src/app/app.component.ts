import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router'; // Import Router and NavigationEnd
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators'; // Import filter operator

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'signature-platform';
  showLayout = false; // Initialize based on initial route check

  constructor(private router: Router) { // Inject Router
    console.log('AppComponent constructor called');
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.updateLayoutVisibility(event.urlAfterRedirects);
    });
  }

  ngOnInit(): void {
    console.log('AppComponent ngOnInit called');
    // Initial check in case ngOnInit runs after the first NavigationEnd
    this.updateLayoutVisibility(this.router.url);
  }

  private updateLayoutVisibility(url: string): void {
    const publicRoutes = ['/login', '/signup', '/forgot-password'];
    // Check if the current URL starts with any of the public routes
    // Also handle the root path '/' which should redirect to '/login' or be treated as public
    this.showLayout = !publicRoutes.some(route => url === route || (route === '/login' && url === '/'));
    console.log(`URL: ${url}, Show Layout: ${this.showLayout}`);
  }
}

