import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';

//Define la estructura de un elemento de actividad reciente
interface ActividadReciente {
  id: string;
  tipo: 'asesoria' | 'proyecto' | 'otro';
  descripcion: string;
  fecha: Date;
}

// Componente principal del dashboard para el programador autenticado - Muestra información general como el nombre de usuario y estadísticas resumen
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit, OnDestroy {

  nombreUsuario: string = ''; // Almacena el nombre de visualización del usuario actual
  proyectosCompletados: number = 0; // Número total de proyectos completados (mapeado desde totalProyectos en el servicio)
  asesoriasPendientes: number = 0; // Número de asesorías pendientes
  asesoriasCompletadas: number = 0; // Número de asesorías completadas

  actividadReciente: ActividadReciente[] = []; // Array para almacenar elementos de actividad reciente


  private unsubscribe$ = new Subject<void>(); // Subject para gestionar la desuscripción de Observables

  constructor(
    private authService: AutenticacionService // Servicio para obtener información del usuario autenticado
  ) { }

  //Cargar el nombre del usuario al iniciar el dashboard.
  ngOnInit(): void {
    this.cargarNombreUsuario(); 
  }

  //Descubre todos los Observables y evitar fugas de memoria.
  ngOnDestroy(): void {
    this.unsubscribe$.next(); 
    this.unsubscribe$.complete(); 
  }


  // Carga el nombre de visualización del usuario actual desde el servicio de autenticación
  cargarNombreUsuario(): void {
    this.authService.getUsuarioActual().pipe(
      takeUntil(this.unsubscribe$) // Gestiona la desuscripción al destruir el componente
    ).subscribe((user: UserProfile | null) => {
      if (user) {
        this.nombreUsuario = user.displayName; // Establece el nombre de usuario si el usuario está autenticado
      }
    });
  }

  //Método placeholder para visualizar los detalles de una actividad específica - imprime un mensaje en la consola
  verDetallesActividad(id: string): void {
    console.log(`Backend debe implementar: Ver detalles de actividad con ID: ${id}`);
  }
}
