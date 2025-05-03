import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SectorService {
  private apiUrl = 'http://localhost:3000/sectors';

  constructor(private http: HttpClient) {}

  getSectors(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  addSector(sector: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, sector);
  }

  deleteSector(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
