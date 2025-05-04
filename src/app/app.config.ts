import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io'; // Import SocketIoModule and SocketIoConfig
import { ToastrModule } from 'ngx-toastr'; // Import ToastrModule

import { routes } from './app.routes';
// Corrected path based on previous analysis
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

// Socket.IO configuration
// Replace 'http://localhost:3001' with your actual backend WebSocket URL
const config: SocketIoConfig = { url: 'http://localhost:3001', options: {} };

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(), // Required for ngx-toastr
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    // Import providers from SocketIoModule and ToastrModule
    importProvidersFrom(
      SocketIoModule.forRoot(config),
      ToastrModule.forRoot({
        timeOut: 5000,
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }) // Configure Toastr
    )
  ]
};

