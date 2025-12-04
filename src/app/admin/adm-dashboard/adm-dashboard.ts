import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Importar RouterLink

//Sirve como un hub de navegación para otras funcionalidades administrativas como la gestión de horarios, programadores y usuarios.
@Component({
  selector: 'app-adm-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './adm-dashboard.html',
  styleUrl: './adm-dashboard.scss',
})
export class AdmDashboard {
  // Lógica futura para cargar estadísticas del dashboard, resúmenes, etc. puede ser añadida aquí.
}

