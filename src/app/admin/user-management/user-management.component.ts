import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import CommonModule for *ngFor
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel
import { UserService } from '../../services/user.service';
import { SectorService } from '../../services/sector.service';
import { User, UserRole } from '../../models/user.model'; // Import User model and UserRole enum
import { Sector } from '../../models/sector.model'; // Import Sector model for typing

@Component({
  selector: 'app-user-management',
  standalone: true, // Mark as standalone
  imports: [CommonModule, FormsModule], // Import CommonModule and FormsModule
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = []; // Initialize with correct type
  // Correct newUser initialization: use undefined instead of null for sectorId
  newUser = { name: '', email: '', password: '', role: UserRole.USER, sectorId: undefined as number | undefined }; 
  sectors: Sector[] = []; // Initialize with correct type
  userRoles = Object.values(UserRole); // Expose UserRole values to the template if needed for a dropdown

  constructor(
    private userService: UserService,
    private sectorService: SectorService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadSectors();
  }

  loadUsers() {
    // Assuming getUsers() returns Observable<User[]>
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  loadSectors() {
    // Assuming getSectors() returns Observable<Sector[]>
    this.sectorService.getSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });
  }

  addUser() {
    // Ensure sectorId is number or undefined before sending
    const userToSend = {
      ...this.newUser,
      sectorId: this.newUser.sectorId === null ? undefined : this.newUser.sectorId
    };

    this.userService.createUser(userToSend).subscribe(() => {
      this.loadUsers();
      // Reset form with correct enum type and undefined for sectorId
      this.newUser = { name: '', email: '', password: '', role: UserRole.USER, sectorId: undefined }; 
    });
  }

  // Add deleteUser method if needed
}

