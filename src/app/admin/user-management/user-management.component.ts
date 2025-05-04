import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Keep FormsModule for template-driven approach
import { UserService } from '../../services/user.service';
import { SectorService } from '../../services/sector.service';
import { User, UserRole } from '../../models/user.model';
import { Sector } from '../../models/sector.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  sectors: Sector[] = [];
  // Use a single object for the form, handling both add and edit
  currentUser: Omit<User, 'id'> & { id?: number; password?: string } = {
    name: '',
    email: '',
    password: '', // Password required for new user, optional for edit
    role: UserRole.USER,
    sectorId: undefined
  };
  editingUser = false;
  userRoles = Object.values(UserRole); // Expose enum values to template

  constructor(
    private userService: UserService,
    private sectorService: SectorService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadSectors();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data: User[]) => {
      this.users = data;
    });
  }

  loadSectors() {
    this.sectorService.getSectors().subscribe((data: Sector[]) => {
      this.sectors = data;
    });
  }

  editUser(user: User) {
    this.editingUser = true;
    // Create a copy for editing, omit password initially
    // Ensure sectorId is treated correctly (might be null from backend)
    this.currentUser = { ...user, password: '', sectorId: user.sectorId ?? undefined };
  }

  cancelEdit() {
    this.editingUser = false;
    this.resetForm();
  }

  resetForm() {
    this.currentUser = {
      name: '',
      email: '',
      password: '',
      role: UserRole.USER,
      sectorId: undefined
    };
  }

  saveUser() {
    // Prepare the data payload, converting sectorId if present
    const userDataPayload = { ...this.currentUser };

    // Handle sectorId: Convert to number if present and valid, otherwise remove
    if (userDataPayload.sectorId !== undefined && userDataPayload.sectorId !== null && String(userDataPayload.sectorId).trim() !== '') {
      const parsedSectorId = parseInt(String(userDataPayload.sectorId), 10);
      if (!isNaN(parsedSectorId) && parsedSectorId > 0) {
        userDataPayload.sectorId = parsedSectorId;
      } else {
        // Invalid value (e.g., "0", non-numeric string), treat as no selection
        console.warn('Invalid sectorId provided, removing from payload:', userDataPayload.sectorId);
        delete userDataPayload.sectorId;
      }
    } else {
      // No sector selected or invalid initial value (null, undefined, empty string)
      delete userDataPayload.sectorId;
    }

    if (this.editingUser && userDataPayload.id) {
      // --- Update existing user ---
      const { id, password, ...updateData } = userDataPayload;
      const finalUpdatePayload: Partial<User> = { ...updateData };

      // Only include password in payload if it's not empty
      if (password && password.trim() !== '') {
        finalUpdatePayload.password = password;
      } else {
        // Ensure password field is not sent if empty during update
        delete finalUpdatePayload.password;
      }

      console.log('Updating user with payload:', finalUpdatePayload);
      this.userService.updateUser(id, finalUpdatePayload).subscribe({
        next: () => {
          this.loadUsers();
          this.cancelEdit();
        },
        error: (err) => console.error('Error updating user:', err) // Add error logging
      });
    } else {
      // --- Add new user ---
      const { id, ...newUserData } = userDataPayload;

      // Ensure password is provided for new user
      if (!newUserData.password || newUserData.password.trim() === '') {
         console.error('Password is required for new user.');
         // TODO: Show a user-friendly message
         return; // Stop execution if password is missing
      }

      console.log('Creating user with payload:', newUserData);
      this.userService.createUser(newUserData as Omit<User, 'id'>).subscribe({
        next: () => {
          this.loadUsers();
          this.resetForm();
        },
        error: (err) => console.error('Error creating user:', err) // Add error logging
      });
    }
  }

  confirmDelete(id: number) {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.loadUsers();
        // If the deleted user was being edited, cancel edit mode
        if (this.editingUser && this.currentUser.id === id) {
          this.cancelEdit();
        }
      });
    }
  }

  // Helper function to get sector name for display
  getSectorName(sectorId: number | undefined | null): string {
    if (sectorId === undefined || sectorId === null) {
      return 'Nenhum';
    }
    const sector = this.sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Desconhecido';
  }
}

