
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Sector } from '../../models/sector.model';


@Component({
  selector: 'app-sector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './sector-dialog.component.html',
  styleUrls: ['./sector-dialog.component.css']
})
export class SectorDialogComponent implements OnInit {
  sectorForm: FormGroup;
  isEditMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<SectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Sector | null, // Recebe o setor para edição ou null/{} para adição
    private fb: FormBuilder
  ) {
    this.isEditMode = !!(data && data.id);
    this.sectorForm = this.fb.group({
      name: [data?.name || '', Validators.required]
    });
  }

  ngOnInit(): void {
    // Nenhuma lógica específica necessária no ngOnInit para este formulário simples
  }

  onCancel(): void {
    this.dialogRef.close(); // Fecha o diálogo sem retornar dados
  }

  onSave(): void {
    if (this.sectorForm.valid) {
      // Retorna os dados do formulário
      this.dialogRef.close(this.sectorForm.value);
    }
  }
}

