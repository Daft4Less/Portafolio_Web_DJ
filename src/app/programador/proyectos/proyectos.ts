import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TarjetaProyecto } from './tarjeta-proyecto/tarjeta-proyecto';
import { FormularioProyecto } from './formulario-proyecto/formulario-proyecto';
import { Project } from '../../models/portfolio.model';
import { ProyectosService } from '../../services/proyectos.service';

// programador gestione su portafolio de proyectos
@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto, FormularioProyecto],
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.scss'],
})
export class Proyectos implements OnInit, OnDestroy {
  proyectos: Project[] = []; // Array que contiene todos los proyectos del programador autenticado
  mostrarFormulario: boolean = false; // Controla la visibilidad del formulario de adición/edición de proyectos
  proyectoAEditar: Project | undefined; // Almacena el proyecto que se está editando actualmente (undefined si se está añadiendo uno nuevo)

  private unsubscribe$ = new Subject<void>(); // Subject para gestionar la desuscripción de Observables


  constructor(
    private proyectosService: ProyectosService // Servicio para gestionar los proyectos de los programadores
  ) {}

  //Carga la lista inicial de proyectos del programador
  ngOnInit(): void {
    this.cargarProyectos(); // Llama al método para cargar los proyectos al iniciar el componente
  }

  //Descubrir todos los Observables y evitar fugas de memoria.
  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Emite un valor para notificar a todas las suscripciones de que deben terminar
    this.unsubscribe$.complete(); // Completa el Subject
  }

  //Carga la lista de proyectos del programador autenticado desde el servicio
  cargarProyectos(): void {
    this.proyectosService.getProyectos().pipe(
      takeUntil(this.unsubscribe$) // Desuscribe automáticamente al destruir el componente
    ).subscribe((data: Project[]) => {
      this.proyectos = data; // Asigna la lista de proyectos recibida
    });
  }

  //Alterna la visibilidad del formulario de proyectos
  toggleFormulario(): void {
    this.proyectoAEditar = undefined; // Borra cualquier proyecto que estuviera en edición al abrir un formulario nuevo
    this.mostrarFormulario = !this.mostrarFormulario; // Invierte el estado de visibilidad del formulario
  }

  //Responde a la acción de cancelar el formulario
  onCancelarFormulario(): void {
    this.mostrarFormulario = false; // Oculta el formulario
    this.proyectoAEditar = undefined; // Borra el proyecto en edición
  }

  // Maneja el evento cuando un proyecto ha sido guardado (ya sea nuevo o editado)
  // Determina si se debe añadir un nuevo proyecto o actualizar uno existente
  // Oculta el formulario, borra el proyecto en edición y recarga la lista de proyectos

  async onProyectoGuardado(proyecto: Project): Promise<void> {
    try {
      // Si hay un proyecto en edición y tiene ID, significa que es una actualización
      if (this.proyectoAEditar && this.proyectoAEditar.id) {
        await this.proyectosService.updateProyecto(this.proyectoAEditar.id, proyecto);
      } else {
        // Si no hay proyecto en edición o no tiene ID, es un nuevo proyecto
        const projectData: Omit<Project, 'id'> = proyecto;
        await this.proyectosService.addProyecto(projectData);
      }
      this.mostrarFormulario = false; // Oculta el formulario
      this.proyectoAEditar = undefined; // Borra el proyecto en edición
      this.cargarProyectos(); // Recarga la lista de proyectos para reflejar los cambios
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      // Aquí se podría integrar un servicio de notificación para mostrar errores al usuario
    }
  }

  //Eliminación de un proyecto.
  async onEliminarProyecto(idProyecto: string): Promise<void> {
    try {
      await this.proyectosService.deleteProyecto(idProyecto); // Elimina el proyecto de la base de datos
      this.cargarProyectos(); // Recarga la lista de proyectos para reflejar los cambios
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      // Aquí se podría integrar un servicio de notificación para mostrar errores al usuario
    }
  }

  // Establece el proyecto a editar y muestra el formulario para su modificación.
  onEditarProyecto(proyecto: Project): void {
    this.proyectoAEditar = proyecto; // Establece el proyecto que se va a editar
    this.mostrarFormulario = true; // Muestra el formulario con los datos del proyecto
  }
}
