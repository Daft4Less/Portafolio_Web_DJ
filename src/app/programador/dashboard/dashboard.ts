import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Interfaz local para la actividad reciente.
interface ActividadReciente {
  id: string;
  tipo: 'asesoria' | 'proyecto' | 'otro';
  descripcion: string;
  fecha: Date;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit {

  nombreUsuario: string = ''; // Vacío, el backend lo llenará
  proyectosCompletados: number = 0;
  asesoriasPendientes: number = 0;
  asesoriasCompletadas: number = 0;

  actividadReciente: ActividadReciente[] = []; // Vacío, el backend lo llenará

  constructor() { }

  ngOnInit(): void {
    // La carga de datos simulados se elimina.
    // El backend deberá llamar a un servicio para llenar estas propiedades.
  }

  // Métodos de ejemplo que no tienen lógica por ahora, solo para simular interacciones.
  verDetallesActividad(id: string): void {
    console.log(`Backend debe implementar: Ver detalles de actividad con ID: ${id}`);
  }
}
