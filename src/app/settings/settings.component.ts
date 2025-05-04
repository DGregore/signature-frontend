
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { HttpErrorResponse } from '@angular/common/http'; // Importar HttpErrorResponse

import { UserService } from '../services/user.service';
import { User } from '../models/user.model'; // Corrigido: Importar de models
import { UserDialogComponent } from './user-dialog/user-dialog.component';

import { SectorService } from '../services/sector.service';
import { Sector } from '../models/sector.model'; // Assumindo que existe sector.model.ts
import { SectorDialogComponent } from './sector-dialog/sector-dialog.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTabsModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  users: User[] = [];
  displayedUserColumns: string[] = ['name', 'email', 'sector', 'actions']; // Adicionado 'sector'

  sectors: Sector[] = [];
  displayedSectorColumns: string[] = ['name', 'actions'];

  constructor(
    private userService: UserService,
    private sectorService: SectorService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.loadSectors();
  }

  // --- Métodos para Usuários ---
  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (data) => { this.users = data; },
      error: (err: HttpErrorResponse) => { console.error('Erro ao carregar usuários:', err); } // Corrigido: Tipagem do erro
    });
  }

  openUserDialog(user?: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '400px',
      // Passar setores para o diálogo poder selecioná-los
      data: { user: user ? { ...user } : null, sectors: this.sectors }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (user && user.id) {
          // Corrigido: Chamar updateUser
          this.userService.updateUser(user.id, result).subscribe({
            next: () => this.loadUsers(),
            error: (err: HttpErrorResponse) => console.error('Erro ao atualizar usuário:', err)
          });
        } else {
          // Corrigido: Chamar createUser
          this.userService.createUser(result).subscribe({
            next: () => this.loadUsers(),
            error: (err: HttpErrorResponse) => console.error('Erro ao criar usuário:', err)
          });
        }
      }
    });
  }

  deleteUser(userId: number | undefined): void {
    if (userId === undefined) {
      console.error('ID do usuário inválido para exclusão');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      // Corrigido: Chamar deleteUser
      this.userService.deleteUser(userId).subscribe({
        next: () => { this.loadUsers(); },
        error: (err: HttpErrorResponse) => { console.error('Erro ao excluir usuário:', err); } // Corrigido: Tipagem do erro
      });
    }
  }

  // --- Métodos para Setores ---
  loadSectors(): void {
    this.sectorService.getSectors().subscribe({
      next: (data) => { this.sectors = data; },
      error: (err: HttpErrorResponse) => { console.error('Erro ao carregar setores:', err); } // Corrigido: Tipagem do erro
    });
  }

  openSectorDialog(sector?: Sector): void {
    const dialogRef = this.dialog.open(SectorDialogComponent, {
      width: '350px',
      data: sector ? { ...sector } : {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (sector && sector.id) {
          // Assumindo que SectorService tem updateSector
          this.sectorService.updateSector(sector.id, result).subscribe({
            next: () => this.loadSectors(),
            error: (err: HttpErrorResponse) => console.error('Erro ao atualizar setor:', err)
          });
        } else {
          // Assumindo que SectorService tem createSector
          this.sectorService.createSector(result).subscribe({
            next: () => this.loadSectors(),
            error: (err: HttpErrorResponse) => console.error('Erro ao criar setor:', err)
          });
        }
      }
    });
  }

  deleteSector(sectorId: number | undefined): void {
    if (sectorId === undefined) {
      console.error('ID do setor inválido para exclusão');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este setor?')) {
      // Assumindo que SectorService tem deleteSector
      this.sectorService.deleteSector(sectorId).subscribe({
        next: () => { this.loadSectors(); },
        error: (err: HttpErrorResponse) => { console.error('Erro ao excluir setor:', err); } // Corrigido: Tipagem do erro
      });
    }
  }
}

