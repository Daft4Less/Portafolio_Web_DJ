import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetaProyecto, Proyecto } from './tarjeta-proyecto/tarjeta-proyecto';
import { FormularioProyecto } from './formulario-proyecto/formulario-proyecto';
import { ProyectosService } from '../../services/proyectos';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto, FormularioProyecto],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss',
})
export class Proyectos implements OnInit {
  proyectos: Proyecto[] = [];
  mostrarFormulario: boolean = false;

  proyectoAEditar: Proyecto | undefined;

  constructor(private proyectosService: ProyectosService) {}

  ngOnInit(): void {
    this.cargarProyectos();
  }

  cargarProyectos(): void {
    this.proyectosService.getProyectos().subscribe(proyectos => {
      this.proyectos = proyectos;
    });
  }

  toggleFormulario(): void {
    this.proyectoAEditar = undefined;
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  onProyectoAgregado(nuevoProyecto: Proyecto): void {
    this.cargarProyectos(); 
    this.mostrarFormulario = false;
  }

  onEliminarProyecto(nombreProyecto: string): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el proyecto "${nombreProyecto}"?`)) {
      this.proyectosService.deleteProyecto(nombreProyecto).subscribe(() => {
        this.cargarProyectos();
      });
    }
  }

  onEditarProyecto(proyecto: Proyecto): void {
    this.proyectoAEditar = proyecto;
    this.mostrarFormulario = true;
  }
}
