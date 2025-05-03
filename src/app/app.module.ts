import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Para ngModel e ReactiveForms
import { RouterModule } from '@angular/router';  // Para o roteamento
import { MatCardModule } from '@angular/material/card';  // Para mat-card e seus componentes
import { MatFormFieldModule } from '@angular/material/form-field';  // Para mat-form-field e mat-label
import { MatInputModule } from '@angular/material/input';  // Para matInput
import { MatButtonModule } from '@angular/material/button';  // Para mat-raised-button
import { appRoutes } from './app.routes';  // Arquivo de rotas
import { AppComponent } from './app.component';  // Componente raiz
import { LoginComponent } from './login/login.component';  // Componente de login
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
    imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,  // Adicionando FormsModule para ngModel
    ReactiveFormsModule,  // Para usar FormGroup e validações reativas
    RouterModule.forRoot(appRoutes),  // Configurando as rotas
    MatCardModule,  // Importando MatCardModule
    MatFormFieldModule,  // Importando MatFormFieldModule
    MatInputModule,  // Importando MatInputModule
    MatButtonModule,  // Importando MatButtonModule
    CommonModule, 
    MatSidenavModule,
    MatListModule,
    MatIconModule,
     
     ],
    //bootstrap: [AppComponent]  // Colocando o AppComponent no bootstrap
})
export class AppModule { }
