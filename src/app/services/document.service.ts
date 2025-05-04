import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Document, DocumentSignatory, SignatureData } from '../models/document.model';
import { AuditLog } from '../models/audit-log.model'; // Moved import here

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = '/api/documents'; // Use relative path for proxy

  constructor(private http: HttpClient) { }

  /**
   * Uploads a new document file along with metadata.
   * @param file The PDF file to upload.
   * @param metadata Metadata including signatories and their order.
   * @returns Observable<Document> The created document metadata.
   */
  uploadDocument(file: File, metadata: { signatories: Partial<DocumentSignatory>[] }): Observable<Document> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('metadata', JSON.stringify(metadata));
    return this.http.post<Document>(`${this.apiUrl}/upload`, formData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves a list of documents based on optional filters.
   * @param filters Optional query parameters (e.g., ownerId, status, pendingFor).
   * @returns Observable<Document[]>
   */
  getDocuments(filters?: any): Observable<Document[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Document[]>(this.apiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves the metadata for a specific document.
   * @param id The ID of the document.
   * @returns Observable<Document>
   */
  getDocument(id: number): Observable<Document> {
    return this.http.get<Document>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Downloads the PDF file for a specific document.
   * @param id The ID of the document.
   * @returns Observable<Blob> The PDF file content as a Blob.
   */
  downloadDocument(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Updates the metadata of a specific document.
   * @param id The ID of the document.
   * @param data The data to update.
   * @returns Observable<Document>
   */
  updateDocument(id: number, data: Partial<Document>): Observable<Document> {
    return this.http.put<Document>(`${this.apiUrl}/${id}`, data).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Deletes a specific document.
   * @param id The ID of the document.
   * @returns Observable<void>
   */
  deleteDocument(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Records a signature for a document.
   * @param documentId The ID of the document being signed.
   * @param signatureData Data related to the signature (e.g., userId, timestamp).
   * @returns Observable<DocumentSignatory> The updated signatory record.
   */
  signDocument(documentId: number, signatureData: SignatureData): Observable<DocumentSignatory> {
    return this.http.post<DocumentSignatory>(`${this.apiUrl}/${documentId}/sign`, signatureData).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Retrieves audit logs for a specific entity.
   * @param entityType The type of the entity (e.g., 'Document').
   * @param entityId The ID of the entity.
   * @returns Observable<AuditLog[]>
   */
  getAuditLogs(entityType: string, entityId: number): Observable<AuditLog[]> {
    // Assuming a separate endpoint for audit logs, adjust if needed
    const auditApiUrl = '/api/audit-logs';
    let params = new HttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId.toString());

    return this.http.get<AuditLog[]>(auditApiUrl, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Basic error handling for HTTP requests.
   * @param error The HttpErrorResponse.
   * @returns Observable throwing an error.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error(
      `Backend returned code ${error.status}, body was: `, error.error);
    let userMessage = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
    if (error.error instanceof ErrorEvent) {
      userMessage = `Erro: ${error.error.message}`;
    } else if (error.status === 404) {
      userMessage = 'Recurso não encontrado.';
    } else if (error.status === 400 && error.error?.message) {
      userMessage = error.error.message;
    } else if (error.status === 401) {
      userMessage = 'Não autorizado. Verifique suas credenciais ou faça login novamente.';
    } else if (error.status === 403) {
      userMessage = 'Acesso negado.';
    }
    return throwError(() => new Error(userMessage));
  }
}

