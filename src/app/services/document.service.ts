import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  private apiUrl = 'http://localhost:3000/documents';

  constructor(private http: HttpClient) {}

  // Método para enviar um documento
  uploadDocument(documentData: { name: string; description: string; file: File }) {
    // Lógica para envio do documento
    // Exemplo de chamada para o backend (simulado):
    return this.http.post('/api/documents', documentData);
  }

  // Método para listar todos os documentos
  getDocuments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
