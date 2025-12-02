import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProgramadoresService, DashboardStats } from '../../services/programadores.service';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';

// Interfaz local para la actividad reciente (sin cambios por ahora).
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
export class Dashboard implements OnInit, OnDestroy {

  nombreUsuario: string = '';
  // El nombre de la propiedad en el HTML es 'proyectosCompletados', lo mapeamos a totalProyectos
  proyectosCompletados: number = 0; 
  asesoriasPendientes: number = 0;
  asesoriasCompletadas: number = 0;

  actividadReciente: ActividadReciente[] = []; // Vacío, el backend lo llenará

  private unsubscribe$ = new Subject<void>();

  constructor(
    private programadoresService: ProgramadoresService,
    private authService: AutenticacionService
  ) { }

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarNombreUsuario();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarEstadisticas(): void {
    this.programadoresService.getDashboardStats().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((stats: DashboardStats) => {
      this.proyectosCompletados = stats.totalProyectos;
      this.asesoriasPendientes = stats.asesoriasPendientes;
      this.asesoriasCompletadas = stats.asesoriasCompletadas;
    });
  }

  cargarNombreUsuario(): void {
    this.authService.getUsuarioActual().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((user: UserProfile | null) => {
      if (user) {
        this.nombreUsuario = user.displayName;
      }
    });
  }

  // Métodos de ejemplo que no tienen lógica por ahora, solo para simular interacciones.
  verDetallesActividad(id: string): void {
    console.log(`Backend debe implementar: Ver detalles de actividad con ID: ${id}`);
  }
}
