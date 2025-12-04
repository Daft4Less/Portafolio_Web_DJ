import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/portfolio.model'; // Corregir la ruta de importación

//Muestra los detalles de un proyecto individual.
@Component({
  selector: 'app-tarjeta-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-proyecto.html',
  styleUrls: ['./tarjeta-proyecto.scss'], // Corregir a styleUrls
})
export class TarjetaProyecto {
  @Input() proyecto: Project | undefined; // Propiedad de entrada: el objeto Project a mostrar en la tarjeta.
  
  @Output() eliminarProyecto = new EventEmitter<string>(); // Evento de salida: emite el ID del proyecto cuando se solicita su eliminación.

  @Output() editarProyecto = new EventEmitter<Project>(); // Evento de salida: emite el objeto completo del proyecto cuando se solicita su edición.


  // Maneja la acción de eliminar el proyecto
  onEliminar(): void {
    // Asegurarse de que el proyecto y su ID existen antes de emitir el evento
    if (this.proyecto?.id) {
      this.eliminarProyecto.emit(this.proyecto.id);
    }
  }

  // Maneja la acción de editar el proyecto.
  onEditar(): void {
    if (this.proyecto) {
      this.editarProyecto.emit(this.proyecto);
    }
  }
}
