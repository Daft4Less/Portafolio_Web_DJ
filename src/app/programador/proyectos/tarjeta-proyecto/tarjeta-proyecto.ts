import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/portfolio.model'; // Corregir la ruta de importación

@Component({
  selector: 'app-tarjeta-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-proyecto.html',
  styleUrls: ['./tarjeta-proyecto.scss'], // Corregir a styleUrls
})
export class TarjetaProyecto {
  // El Input ahora espera la interfaz Project importada
  @Input() proyecto: Project | undefined;
  
  // El Output para eliminar ahora emitirá el ID (string)
  @Output() eliminarProyecto = new EventEmitter<string>();

  // El Output para editar emite el objeto completo del proyecto
  @Output() editarProyecto = new EventEmitter<Project>();

  onEliminar(): void {
    // Asegurarse de que el proyecto y su id existen antes de emitir
    if (this.proyecto?.id) {
      this.eliminarProyecto.emit(this.proyecto.id);
    }
  }

  onEditar(): void {
    if (this.proyecto) {
      this.editarProyecto.emit(this.proyecto);
    }
  }
}
