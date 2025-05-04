
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select'; // Importar MatSelectModule

import { User } from '../../models/user.model'; // Corrigido: Importar de models
import { Sector } from '../../models/sector.model'; // Importar Sector

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule // Adicionar MatSelectModule aos imports
  ],
  templateUrl: './user-dialog.component.html',
  styleUrls: ['./user-dialog.component.css']
})
export class UserDialogComponent implements OnInit {
  userForm: FormGroup;
  isEditMode: boolean;
  sectors: Sector[] = []; // Para popular o select de setores

  constructor(
    public dialogRef: MatDialogRef<UserDialogComponent>,
    // Corrigido: Receber objeto com user e sectors
    @Inject(MAT_DIALOG_DATA) public data: { user: User | null, sectors: Sector[] },
    private fb: FormBuilder
  ) {
    this.isEditMode = !!(data.user && data.user.id);
    this.sectors = data.sectors || []; // Receber a lista de setores

    this.userForm = this.fb.group({
      name: [data.user?.name || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      // A senha só é obrigatória ao criar um novo usuário
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      // Adicionar campo para sectorId
      sectorId: [data.user?.sector?.id || data.user?.sectorId || null, Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode) {
        // Na edição, a senha não é obrigatória
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formData = { ...this.userForm.value };
      // Remover senha se estiver vazia na edição
      if (this.isEditMode && !formData.password) {
        delete formData.password;
      }
      // Garantir que sectorId seja um número
      if (formData.sectorId) {
        formData.sectorId = Number(formData.sectorId);
      }
      this.dialogRef.close(formData);
    }
  }
}

