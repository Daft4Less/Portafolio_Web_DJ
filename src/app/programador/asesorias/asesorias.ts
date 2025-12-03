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
  
  allAsesorias: Asesoria[] = [];
  filteredAsesorias: Asesoria[] = [];
  currentFilter: string = 'activas'; // 'activas', 'rechazada', 'finalizada'
  
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
      this.allAsesorias = data;
      this.applyFiltersAndSort(); // Apply default filter and sort
    });
  }

  setFilter(filter: string): void {
    this.currentFilter = filter;
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort(): void {
    // 1. Filter
    let filtered: Asesoria[];
    if (this.currentFilter === 'activas') {
      filtered = this.allAsesorias.filter(a => a.estado === 'pendiente' || a.estado === 'aprobada');
    } else {
      filtered = this.allAsesorias.filter(a => a.estado === this.currentFilter);
    }

    // 2. Sort
    const statusPriority: { [key: string]: number } = {
      'pendiente': 1,
      'aprobada': 2,
      'rechazada': 3,
      'finalizada': 4
    };

    this.filteredAsesorias = filtered.sort((a, b) => {
      const priorityA = statusPriority[a.estado] || 99;
      const priorityB = statusPriority[b.estado] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return b.fecha.toMillis() - a.fecha.toMillis();
    });
  }

  async aceptarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'aprobada');
      const asesoria = this.allAsesorias.find(a => a.id === id);
      if (asesoria) {
        asesoria.estado = 'aprobada'; // Update local state
        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría aprobada', 'success');
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido APROBADA');
      }
      this.applyFiltersAndSort(); // Re-apply filters and sort
    } catch (error) {
      console.error('Error al aceptar la asesoría:', error);
      this.notificationService.show('Error al aceptar la asesoría', 'error');
    }
  }

  async finalizarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'finalizada');
      const asesoria = this.allAsesorias.find(a => a.id === id);
      if (asesoria) {
        asesoria.estado = 'finalizada'; // Update local state
        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría marcada como finalizada', 'info');
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido FINALIZADA');
      }
      this.applyFiltersAndSort(); // Re-apply filters and sort
    } catch (error) {
      console.error('Error al finalizar la asesoría:', error);
      this.notificationService.show('Error al finalizar la asesoría', 'error');
    }
  }

  async rechazarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'rechazada');
      const asesoria = this.allAsesorias.find(a => a.id === id);
      if (asesoria) {
        asesoria.estado = 'rechazada'; // Update local state
        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría rechazada', 'info');
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido RECHAZADA');
      }
      this.applyFiltersAndSort(); // Re-apply filters and sort
    } catch (error) {
      console.error('Error al rechazar la asesoría:', error);
      this.notificationService.show('Error al rechazar la asesoría', 'error');
    }
  }
}