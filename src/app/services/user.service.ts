import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:3000/api/users'; // A URL para a API de usuários no backend

  constructor(private http: HttpClient) { }

  // Método para fazer o login
  login(email: string, password: string): Observable<any> {
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/login`, body);
  }

  // Método para registrar um novo usuário
  register(name: string, email: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post(`${this.apiUrl}/register`, body);
  }

  // Método para buscar o perfil do usuário
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);  // A URL que retorna a lista de usuários
  }

  addUser(name: string, email: string, password: string): Observable<any> {
    const body = { name, email, password };
    return this.http.post(`${this.apiUrl}/add`, body);  // A URL que cria um novo usuário
  }

  // Método para atualizar as informações do usuário
  updateProfile(name: string, email: string): Observable<any> {
    const body = { name, email };
    return this.http.put(`${this.apiUrl}/profile`, body);
  }

}
