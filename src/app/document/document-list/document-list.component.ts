import { Component, OnInit } from '@angular/core';
import { DocumentService } from '../../services/document.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router'; // Import RouterModule if needed

@Component({
  selector: 'app-document-list',
  standalone: true, // Add standalone: true
  imports: [
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule, 
    RouterModule, // Add RouterModule if needed
    MatCardModule, 
    MatButtonModule,
    MatFormFieldModule,
    MatTableModule,    
  ],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit {
  documents: any[] = [];

  constructor(private documentService: DocumentService) {}

  ngOnInit(): void {
    this.documentService.getDocuments().subscribe((data: any[]) => {
      this.documents = data;
    });
  }
}

