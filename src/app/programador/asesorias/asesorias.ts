import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Asesoria } from '../../models/asesoria.model';
import { AsesoriasService } from '../../services/asesorias.service';
import { NotificationService } from '../../services/notification';

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

  constructor(
    private asesoriasService: AsesoriasService,
    private notificationService: NotificationService
  ) { }

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
      this.notificationService.show('Asesoría aprobada', 'success');
      console.log("Simulación: Notificación para el usuario con estado 'Aprobada' registrada.");
      localStorage.setItem('notificacion_asesoria', 'Tu solicitud de asesoría ha sido APROBADA');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al aceptar la asesoría:', error);
      this.notificationService.show('Error al aceptar la asesoría', 'error');
    }
  }

  async finalizarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'finalizada');
      this.notificationService.show('Asesoría marcada como finalizada', 'info');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al finalizar la asesoría:', error);
      this.notificationService.show('Error al finalizar la asesoría', 'error');
    }
  }

  async rechazarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'rechazada');
      this.notificationService.show('Asesoría rechazada', 'info');
      console.log("Simulación: Notificación para el usuario con estado 'Rechazada' registrada.");
      localStorage.setItem('notificacion_asesoria', 'Tu solicitud de asesoría ha sido RECHAZADA');
      this.cargarAsesorias(); // Recargar la lista
    } catch (error) {
      console.error('Error al rechazar la asesoría:', error);
      this.notificationService.show('Error al rechazar la asesoría', 'error');
    }
  }
}
