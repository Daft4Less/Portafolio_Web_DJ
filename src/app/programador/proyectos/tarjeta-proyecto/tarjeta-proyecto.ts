import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Proyecto {
  nombre: string;
  descripcion: string;
  tecnologias: string[];
  linkGitHub: string;
  linkDemo?: string;
  imagenUrl?: string;
}

@Component({
  selector: 'app-tarjeta-proyecto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tarjeta-proyecto.html',
  styleUrl: './tarjeta-proyecto.scss',
})
export class TarjetaProyecto {
  @Input() proyecto?: Proyecto;
}
