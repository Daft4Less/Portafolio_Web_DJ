import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TarjetaProyecto, Proyecto } from './tarjeta-proyecto/tarjeta-proyecto';

@Component({
  selector: 'app-proyectos',
  standalone: true,
  imports: [CommonModule, TarjetaProyecto],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.scss',
})
export class Proyectos {
  proyectos: Proyecto[] = [];
}
