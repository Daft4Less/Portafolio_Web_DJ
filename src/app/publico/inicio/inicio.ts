import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Interfaces locales para los datos simulados
interface ProgramadorDestacado {
  uid: string;
  displayName: string;
  photoURL: string;
  especialidad: string;
}

interface ProyectoPopular {
  id: string;
  nombre: string;
  programador: string;
  imagenUrl: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss'],
})
export class Inicio implements OnInit {

  programadoresDestacados: ProgramadorDestacado[] = []; // Vacío, el backend lo llenará
  proyectosPopulares: ProyectoPopular[] = []; // Vacío, el backend lo llenará

  constructor() { }

  ngOnInit(): void {
    // La carga de datos simulados se elimina.
    // El backend deberá llamar a un servicio para llenar estas propiedades.
  }
}
