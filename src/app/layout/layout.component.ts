import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router'; // Import RouterModule for router-outlet
import { HeaderComponent } from '../header/header.component'; // Import HeaderComponent
import { SidebarComponent } from '../sidebar/sidebar.component'; // Import SidebarComponent
import { WebSocketService } from '../services/websocket.service'; // Import WebSocketService
import { ToastrService } from 'ngx-toastr'; // Import ToastrService
import { Subscription } from 'rxjs';
import { AuthService } from "../services/auth.service"; // Import AuthService to handle logout

@Component({
  selector: 'app-layout',
  standalone: true, // Mark as standalone
  imports: [
    RouterModule, // Add RouterModule to imports
    HeaderComponent, // Add HeaderComponent to imports
    SidebarComponent // Add SidebarComponent to imports
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit, OnDestroy {
  private notificationSub: Subscription | undefined;
  private authSub: Subscription | undefined;

  constructor(
    private webSocketService: WebSocketService,
    private toastr: ToastrService,
    private authService: AuthService // Inject AuthService
  ) {}

  ngOnInit(): void {
    // Listen for general notifications
    this.notificationSub = this.webSocketService.listenForNotifications().subscribe(
      (notification: { title: string; message: string }) => { // Added explicit type
        this.toastr.info(notification.message, notification.title || 'Notificação');
        // Add more specific handling based on notification content if needed
      },
      (error: any) => { // Added explicit type
        console.error('Erro ao receber notificações WebSocket:', error);
        // Optionally show a generic error toast
        // this.toastr.error('Erro na conexão de notificações.', 'Erro WebSocket');
      }
    );

    // Listen for document-specific updates (example)
    // this.webSocketService.listenForDocumentUpdates().subscribe(update => {
    //   console.log('Document update received:', update);
    //   this.toastr.success(`Documento ${update.documentId} atualizado para ${update.status}`, 'Atualização Documento');
    //   // Potentially trigger data refresh in relevant components
    // });

    // Disconnect WebSocket on logout
    this.authSub = this.authService.isLoggedIn$.subscribe((isLoggedIn: boolean) => {
      if (!isLoggedIn) {
        this.webSocketService.disconnect();
      }
      // Consider reconnecting if user logs back in, handled by service/config?
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from notifications
    this.notificationSub?.unsubscribe();
    this.authSub?.unsubscribe();
    // Disconnect WebSocket when layout is destroyed (e.g., navigating to login)
    // Ensure this doesn't disconnect prematurely if layout persists across routes
    // Disconnecting on logout might be sufficient
    // this.webSocketService.disconnect();
  }
}

