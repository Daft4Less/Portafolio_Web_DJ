import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetaProyecto, Proyecto } from './tarjeta-proyecto/tarjeta-proyecto';
import { FormularioProyecto } from './formulario-proyecto/formulario-proyecto'; 

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto, FormularioProyecto], 
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss',
})
export class Proyectos {
  proyectos: Proyecto[] = [];
  mostrarFormulario: boolean = false; 

  
  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }
}
