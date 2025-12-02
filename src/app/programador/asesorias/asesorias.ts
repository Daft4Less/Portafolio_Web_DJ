import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

// Interfaz local para la data de la asesoría, simulando el modelo real.
interface Asesoria {
  id: string;
  solicitanteNombre: string;
  fecha: Date;
  comentario: string;
  estado: 'pendiente' | 'aceptada' | 'finalizada' | 'rechazada';
}

@Component({
  selector: 'app-asesorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
})
export class Asesorias implements OnInit {

  // Data de ejemplo para simular lo que vendría del backend.
  // Se inicializa como un array vacío para que el backend lo llene.
  asesorias: Asesoria[] = [];

  constructor() { }

  ngOnInit(): void {
    // La carga de datos simulados se elimina.
    // El backend deberá llamar a un servicio para llenar este array.
  }

  // Métodos que el backend deberá implementar.
  aceptarAsesoria(id: string): void {
    console.log(`Backend debe implementar: Aceptar asesoría con ID: ${id}`);
  }

  finalizarAsesoria(id: string): void {
    console.log(`Backend debe implementar: Finalizar asesoría con ID: ${id}`);
  }

  rechazarAsesoria(id: string): void {
    console.log(`Backend debe implementar: Rechazar asesoría con ID: ${id}`);
  }
}
