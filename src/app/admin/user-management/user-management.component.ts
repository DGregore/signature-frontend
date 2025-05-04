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
    this.currentUser = { ...user, password: '' }; // Clear password field for editing
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
    if (this.editingUser && this.currentUser.id) {
      // Update existing user
      const { id, password, ...userData } = this.currentUser;
      const updatePayload: Partial<User> = { ...userData };
      // Only include password in payload if it's not empty
      if (password) {
        updatePayload.password = password;
      }
      this.userService.updateUser(id, updatePayload).subscribe(() => {
        this.loadUsers();
        this.cancelEdit();
      });
    } else {
      // Add new user
      // Ensure password is provided for new user (handled by 'required' in template)
      const { id, ...newUserData } = this.currentUser;
      this.userService.createUser(newUserData as Omit<User, 'id'>).subscribe(() => { // Cast needed as password might be empty string initially
        this.loadUsers();
        this.resetForm();
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
  getSectorName(sectorId: number | undefined): string {
    if (sectorId === undefined) {
      return 'Nenhum';
    }
    const sector = this.sectors.find(s => s.id === sectorId);
    return sector ? sector.name : 'Desconhecido';
  }
}

