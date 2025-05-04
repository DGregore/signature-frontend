import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Keep RouterModule for router-outlet
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule // Only RouterModule is needed now
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'signature-platform';

  // Removed constructor and ngOnInit logic related to showLayout
  constructor() {
    console.log('AppComponent constructor called - Simplified');
  }
}

