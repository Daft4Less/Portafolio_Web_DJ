import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { TarjetaProyecto } from './tarjeta-proyecto/tarjeta-proyecto';
import { FormularioProyecto } from './formulario-proyecto/formulario-proyecto';
import { Project } from '../../models/portfolio.model';
import { ProyectosService } from '../../services/proyectos.service';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto, FormularioProyecto],
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.scss'],
})
export class Proyectos implements OnInit, OnDestroy {
  proyectos: Project[] = [];
  mostrarFormulario: boolean = false;
  proyectoAEditar: Project | undefined;

  private unsubscribe$ = new Subject<void>();

  constructor(private proyectosService: ProyectosService) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarProyectos(): void {
    this.proyectosService.getProyectos().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((data: Project[]) => {
      this.proyectos = data;
    });
  }

  toggleFormulario(): void {
    this.proyectoAEditar = undefined;
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onCancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.proyectoAEditar = undefined;
  }

  async onProyectoGuardado(proyecto: Project): Promise<void> {
    try {
      if (this.proyectoAEditar && this.proyectoAEditar.id) {
        // Es una actualización
        await this.proyectosService.updateProyecto(this.proyectoAEditar.id, proyecto);
      } else {
        // Es un nuevo proyecto
        const projectData: Omit<Project, 'id'> = proyecto;
        await this.proyectosService.addProyecto(projectData);
      }
      this.mostrarFormulario = false;
      this.proyectoAEditar = undefined;
      this.cargarProyectos(); // Recargar la lista de proyectos
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  async onEliminarProyecto(idProyecto: string): Promise<void> {
    try {
      await this.proyectosService.deleteProyecto(idProyecto);
      this.cargarProyectos(); // Recargar la lista de proyectos
    } catch (error) {
      console.error('Error al eliminar el proyecto:', error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  }

  onEditarProyecto(proyecto: Project): void {
    this.proyectoAEditar = proyecto;
    this.mostrarFormulario = true;
  }
}
