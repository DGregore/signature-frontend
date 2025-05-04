import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model'; // Importar do arquivo de modelo

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users'; // A URL base para a API de usuários no backend

  constructor(private http: HttpClient) { }

  // --- Autenticação e Perfil (Mantidos como estavam) ---
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { name, email, password });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`);
  }

  updateProfile(name: string, email: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, { name, email });
  }

  // --- CRUD de Usuários (Administração) ---
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  // Corrigido: Nome do método para 'createUser' para consistência com backend, aceita objeto User
  createUser(user: Omit<User, 'id'>): Observable<User> {
    // Removendo o ID, pois é gerado pelo backend
    // A senha deve ser incluída aqui para criação
    // The input 'user' is already Omit<User, 'id'>, so pass it directly
    return this.http.post<User>(this.apiUrl, user);
  }

  // Corrigido: Nome do método para 'updateUser', aceita ID e objeto User
  updateUser(id: number, user: Partial<User>): Observable<User> {
    // Enviando apenas os dados que podem ser atualizados
    // O backend decidirá o que fazer com a senha, se enviada
    // Usar Partial<User> permite enviar apenas campos modificados
    return this.http.patch<User>(`${this.apiUrl}/${id}`, user); // Usar PATCH para atualização parcial
  }

  // Corrigido: Nome do método para 'deleteUser'
  deleteUser(id: number): Observable<void> { // Retorna void pois DELETE não costuma ter corpo
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

