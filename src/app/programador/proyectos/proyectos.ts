import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetaProyecto } from './tarjeta-proyecto/tarjeta-proyecto';
import { FormularioProyecto } from './formulario-proyecto/formulario-proyecto';
// import { Project } from '../../../models/portfolio.model'; // Se comenta para evitar errores de path

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto, FormularioProyecto], 
  templateUrl: './proyectos.html',
  styleUrls: ['./proyectos.scss'],
})
export class Proyectos implements OnInit {
  proyectos: any[] = []; // Array vacío, se usa `any` temporalmente
  mostrarFormulario: boolean = false;
  proyectoAEditar: any | undefined;

  constructor() {} 

  ngOnInit(): void {
    // Aquí el backend developer debe llamar al servicio para cargar los proyectos.
    // Ejemplo: this.proyectosService.getProyectos().subscribe(data => this.proyectos = data);
  }

  toggleFormulario(): void {
    this.proyectoAEditar = undefined;
    this.mostrarFormulario = !this.mostrarFormulario;
  }
  
  onCancelarFormulario(): void {
    this.mostrarFormulario = false;
    this.proyectoAEditar = undefined;
  }

  onProyectoGuardado(proyecto: any): void {
    console.log('Backend debe implementar la lógica para guardar/editar:', proyecto);
    this.mostrarFormulario = false;
  }

  onEliminarProyecto(idProyecto: string): void {
    console.log('Backend debe implementar la lógica para eliminar con ID:', idProyecto);
  }

  onEditarProyecto(proyecto: any): void {
    this.proyectoAEditar = proyecto;
    this.mostrarFormulario = true;
  }
}
