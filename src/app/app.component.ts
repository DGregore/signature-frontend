import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Importando o RouterModule para usar o router-outlet

@Component({
  selector: 'app-root',
  standalone: true,  // Tornando o componente standalone
  imports: [RouterModule],  // Importando o RouterModule para usar as rotas no componente standalone
  template: `
    <div>
      <h1>Bem-vindo à Plataforma de Documentos</h1>
      <router-outlet></router-outlet>  <!-- Este é o ponto onde as rotas serão renderizadas -->
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'signature-platform';
}
