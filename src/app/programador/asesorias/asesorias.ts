import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Asesoria } from '../../models/asesoria.model';
import { AsesoriasService } from '../../services/asesorias.service';

@Component({
  selector: 'app-asesorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
})
export class Asesorias implements OnInit, OnDestroy {
  
  asesorias: Asesoria[] = [];
  private unsubscribe$ = new Subject<void>();

  constructor(private asesoriasService: AsesoriasService) { }

  ngOnInit(): void {
    this.cargarAsesorias();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarAsesorias(): void {
    this.asesoriasService.getAsesorias().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((data: Asesoria[]) => {
      this.asesorias = data;
    });
  }

  async aceptarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'aprobada');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al aceptar la asesoría:', error);
      // Manejar el error en la UI si es necesario
    }
  }

  async finalizarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'finalizada');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al finalizar la asesoría:', error);
    }
  }

  async rechazarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'rechazada');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al rechazar la asesoría:', error);
    }
  }
}
