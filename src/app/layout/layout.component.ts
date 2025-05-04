import { Component } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule for router-outlet
import { HeaderComponent } from '../header/header.component'; // Import HeaderComponent
import { SidebarComponent } from '../sidebar/sidebar.component'; // Import SidebarComponent

@Component({
  selector: 'app-layout',
  standalone: true, // Mark as standalone
  imports: [
    RouterModule, // Add RouterModule to imports
    HeaderComponent, // Add HeaderComponent to imports
    SidebarComponent // Add SidebarComponent to imports
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {

}

