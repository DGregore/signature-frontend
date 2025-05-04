import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // To potentially send token

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  constructor(private socket: Socket, private authService: AuthService) {
    // Optional: Send token upon connection if backend requires authentication
    // This might need adjustment based on backend implementation
    // this.socket.ioSocket.io.opts.query = { token: this.authService.getAccessToken() };
    // this.socket.connect(); // Connect manually if autoConnect is false
  }

  // Example: Listen for a specific event (e.g., 'documentUpdate')
  listenForDocumentUpdates(): Observable<any> {
    return this.socket.fromEvent('documentUpdate');
  }

  // Example: Listen for general notifications
  listenForNotifications(): Observable<{ title: string; message: string }> {
    return this.socket.fromEvent("notification"); // Removed explicit type, will return Observable<any>
  }

  // Example: Emit an event (if needed, e.g., joining a room)
  // emitEvent(eventName: string, data: any): void {
  //   this.socket.emit(eventName, data);
  // }

  // Disconnect when service is destroyed or user logs out
  disconnect(): void {
    this.socket.disconnect();
  }
}

