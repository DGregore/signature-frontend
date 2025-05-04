import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Document, DocumentSignatory, SignatureData } from '../models/document.model';

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
    // Append metadata fields individually or as a JSON string
    // Backend needs to be adapted to parse this correctly (e.g., using @Body for JSON part)
    formData.append('metadata', JSON.stringify(metadata));

    // Note: When sending FormData, HttpClient sets the Content-Type header automatically.
    // Do not set it manually to 'multipart/form-data' as it might miss the boundary.
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
    // The backend endpoint might be /api/documents/:id/file or similar
    // Assuming /api/documents/:id/download returns the blob directly
    return this.http.get(`${this.apiUrl}/${id}/download`, {
      responseType: 'blob' // Important: expect a Blob response
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
    // Endpoint might be /api/documents/:id/signatures or /api/signatures
    // Assuming /api/documents/:id/sign for simplicity
    return this.http.post<DocumentSignatory>(`${this.apiUrl}/${documentId}/sign`, signatureData).pipe(
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
    // Customize error message based on status or error content
    let userMessage = 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      userMessage = `Erro: ${error.error.message}`;
    } else if (error.status === 404) {
      userMessage = 'Recurso não encontrado.';
    } else if (error.status === 400 && error.error?.message) {
      // Use backend validation message if available
      userMessage = error.error.message;
    } else if (error.status === 401) {
      userMessage = 'Não autorizado. Verifique suas credenciais ou faça login novamente.';
      // Note: The AuthInterceptor should handle token refresh/logout for 401
    } else if (error.status === 403) {
      userMessage = 'Acesso negado.';
    }

    return throwError(() => new Error(userMessage));
  }
}

