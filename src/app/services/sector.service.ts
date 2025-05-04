import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sector } from '../models/sector.model'; // Corrigido: Importar de models

@Injectable({
  providedIn: 'root',
})
export class SectorService {
  private apiUrl = 'http://localhost:3000/api/sectors';

  constructor(private http: HttpClient) {}

  // --- CRUD de Setores ---
  getSectors(): Observable<Sector[]> {
    // O backend deve retornar objetos com 'id' (number) e 'name' (string)
    return this.http.get<Sector[]>(this.apiUrl);
  }

  getSectorById(id: number): Observable<Sector> {
    return this.http.get<Sector>(`${this.apiUrl}/${id}`);
  }

  // Corrigido: Nome do método para 'createSector'
  createSector(sector: Omit<Sector, 'id'>): Observable<Sector> {
    // O backend espera apenas o 'name' para criar
    return this.http.post<Sector>(this.apiUrl, sector);
  }

  // Corrigido: Usar PATCH para atualização parcial
  updateSector(id: number, sector: Partial<Omit<Sector, 'id'>>): Observable<Sector> {
    return this.http.patch<Sector>(`${this.apiUrl}/${id}`, sector);
  }

  deleteSector(id: number): Observable<void> { // Retorna void
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

