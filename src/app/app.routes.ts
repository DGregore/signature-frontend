import { Routes } from '@angular/router';
import { UploadDocumentComponent } from './document/document-upload/document-upload.component'; // Componente de upload de documentos
import { DashboardComponent } from './dashboard/dashboard.component'; // Componente do dashboard
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';  // Tela de recuperação de senha
import { SignUpComponent } from './sign-up/sign-up.component';  // Tela de criação de conta
import { DocumentListComponent } from './document/document-list/document-list.component';
import { SettingsComponent } from './settings/settings.component'; // Importa o novo componente


export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },  // Rota para o Dashboard
  { path: 'forgot-password', component: ForgotPasswordComponent },  // Tela de recuperação de senha
  { path: 'signup', component: SignUpComponent },  // Tela para criar conta
  { path: 'upload-document', component: UploadDocumentComponent },
  { path: 'document-list', component: DocumentListComponent},
  { path: 'settings', component: SettingsComponent } // Adiciona a rota para configurações
];

