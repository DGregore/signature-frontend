import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DocumentService } from '../../services/document.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input'; // Import MatInputModule

@Component({
  selector: 'app-upload-document',
  standalone: true, // Add standalone: true
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule // Add MatInputModule here
  ],
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.css']
})
export class UploadDocumentComponent {
  uploadForm: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private documentService: DocumentService) {
    this.uploadForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      file: [null, Validators.required]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.uploadForm.patchValue({ file: file });
    }
  }

  onUpload() {
    if (this.uploadForm.invalid) return;
  
    this.loading = true;
    const { name, description, file } = this.uploadForm.value;
  
    // Alterando a chamada para passar um único objeto com as propriedades
    this.documentService.uploadDocument({ name, description, file }).subscribe(
      (response) => {
        this.loading = false;
        console.log('Documento enviado com sucesso!', response);
      },
      (error) => {
        this.loading = false;
        this.error = 'Erro ao enviar o documento. Tente novamente.';
      }
    );
  }
}

