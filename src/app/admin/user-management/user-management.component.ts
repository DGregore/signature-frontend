import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { SectorService } from '../../services/sector.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users = [];
  newUser = { name: '', email: '', password: '', sectorId: null };
  sectors = [];

  constructor(
    private userService: UserService,
    private sectorService: SectorService
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadSectors();
  }

  loadUsers() {
    this.userService.getUsers().subscribe((data) => {
      this.users = data;
    });
  }

  loadSectors() {
    this.sectorService.getSectors().subscribe((data) => {
      this.sectors = data;
    });
  }

  addUser() {
    this.userService.addUser(this.newUser).subscribe(() => {
      this.loadUsers();
      this.newUser = { name: '', email: '', password: '', sectorId: null };
    });
  }
}
