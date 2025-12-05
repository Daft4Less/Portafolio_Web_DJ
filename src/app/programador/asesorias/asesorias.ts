import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Asesoria } from '../../models/asesoria.model';
import { AsesoriasService } from '../../services/asesorias.service';
import { NotificationService } from '../../services/notification';

/**
 * Componente para que los programadores visualicen y gestionen sus solicitudes de asesoría.
 * Permite filtrar las asesorías por estado y realizar acciones como aceptar, finalizar o rechazar.
 */
@Component({
  selector: 'app-asesorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './asesorias.html',
  styleUrls: ['./asesorias.scss'],
})
export class Asesorias implements OnInit, OnDestroy {
  
  allAsesorias: Asesoria[] = []; // Lista completa de todas las asesorías del programador
  filteredAsesorias: Asesoria[] = []; // Lista de asesorías después de aplicar filtros y ordenación
  currentFilter: string = 'activas'; // Filtro actual aplicado ('activas', 'rechazada', 'finalizada')
  
  private unsubscribe$ = new Subject<void>(); // Subject para gestionar la desuscripción de Observables


  constructor(
    private asesoriasService: AsesoriasService, // Servicio para gestionar y obtener datos de asesorías
    private notificationService: NotificationService // Servicio para mostrar notificaciones al usuario
  ) { }

  /**
   * Hook del ciclo de vida de Angular que se ejecuta después de la inicialización del componente.
   * Se encarga de cargar las asesorías al iniciar el componente.
   */
  ngOnInit(): void {
    this.cargarAsesorias(); // Llama al método para cargar las asesorías del programador
  }

  /**
   * Hook del ciclo de vida de Angular que se ejecuta antes de la destrucción del componente.
   * Se utiliza para desuscribir todos los Observables y evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Emite un valor para notificar a todas las suscripciones de que deben terminar
    this.unsubscribe$.complete(); // Completa el Subject
  }

  /**
   * Carga las asesorías del programador autenticado desde el servicio.
   * Al recibirlas, las almacena y aplica los filtros y la ordenación por defecto.
   */
  cargarAsesorias(): void {
    this.asesoriasService.getAsesorias().pipe(
      takeUntil(this.unsubscribe$) // Desuscribe automáticamente al destruir el componente
    ).subscribe((data: Asesoria[]) => {
      this.allAsesorias = data; // Almacena todas las asesorías recibidas
      this.applyFiltersAndSort(); // Aplica el filtro y ordenación por defecto a las asesorías
    });
  }

  /**
   * Establece el filtro actual para la lista de asesorías y vuelve a aplicar los filtros y la ordenación.
   * @param {string} filter El nuevo filtro a aplicar (ej. 'activas', 'rechazada', 'finalizada').
   */
  setFilter(filter: string): void {
    this.currentFilter = filter; // Actualiza el filtro actual
    this.applyFiltersAndSort(); // Vuelve a aplicar filtros y ordenación
  }

  /**
   * Aplica el filtro y la ordenación actuales a la lista completa de asesorías.
   * Las asesorías se filtran por estado y luego se ordenan por prioridad de estado
   * y por fecha (más recientes primero).
   */
  applyFiltersAndSort(): void {
    // 1. Filtrado de asesorías según el filtro actual
    let filtered: Asesoria[];
    if (this.currentFilter === 'activas') {
      // Si el filtro es 'activas', incluye asesorías 'pendiente' o 'aprobada'
      filtered = this.allAsesorias.filter(a => a.estado === 'pendiente' || a.estado === 'aprobada');
    } else {
      // Si el filtro es otro, filtra por el estado exacto
      filtered = this.allAsesorias.filter(a => a.estado === this.currentFilter);
    }

    // 2. Ordenación de las asesorías
    // Define la prioridad de ordenación para cada estado
    const statusPriority: { [key: string]: number } = {
      'pendiente': 1,
      'aprobada': 2,
      'rechazada': 3,
      'finalizada': 4
    };

    this.filteredAsesorias = filtered.sort((a, b) => {
      // Compara por prioridad de estado
      const priorityA = statusPriority[a.estado] || 99;
      const priorityB = statusPriority[b.estado] || 99;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Si las prioridades son iguales, ordena por fecha (las más recientes primero)
      return b.fecha.toMillis() - a.fecha.toMillis();
    });
  }

  /**
   * Marca una asesoría específica como 'aprobada'.
   * Actualiza el estado tanto en la base de datos como localmente en la UI,
   * y notifica al solicitante.
   * @param {string} id El ID de la asesoría a aceptar.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la asesoría ha sido aceptada.
   */
  async aceptarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'aprobada'); // Actualiza el estado en la base de datos
      const asesoria = this.allAsesorias.find(a => a.id === id); // Busca la asesoría en la lista local
      if (asesoria) {
        asesoria.estado = 'aprobada'; // Actualiza el estado localmente para reflejar el cambio en la UI
        
        // Log para simular el envío de un mensaje de WhatsApp
        console.log(`Se enviará mensaje de confirmacion al whatsapp de ${asesoria.solicitanteNombre}`);

        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría aprobada', 'success'); // Muestra notificación de éxito
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido APROBADA'); // Almacena notificación para el solicitante
      }
      this.applyFiltersAndSort(); // Vuelve a aplicar filtros y ordenación para actualizar la vista
    } catch (error) {
      console.error('Error al aceptar la asesoría:', error);
      this.notificationService.show('Error al aceptar la asesoría', 'error'); // Muestra notificación de error
    }
  }

  /**
   * Marca una asesoría específica como 'finalizada'.
   * Actualiza el estado tanto en la base de datos como localmente en la UI,
   * y notifica al solicitante.
   * @param {string} id El ID de la asesoría a finalizar.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la asesoría ha sido finalizada.
   */
  async finalizarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'finalizada'); // Actualiza el estado en la base de datos
      const asesoria = this.allAsesorias.find(a => a.id === id); // Busca la asesoría en la lista local
      if (asesoria) {
        asesoria.estado = 'finalizada'; // Actualiza el estado localmente para reflejar el cambio en la UI
        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría marcada como finalizada', 'info'); // Muestra notificación de éxito
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido FINALIZADA'); // Almacena notificación para el solicitante
      }
      this.applyFiltersAndSort(); // Vuelve a aplicar filtros y ordenación para actualizar la vista
    } catch (error) {
      console.error('Error al finalizar la asesoría:', error);
      this.notificationService.show('Error al finalizar la asesoría', 'error'); // Muestra notificación de error
    }
  }

  /**
   * Marca una asesoría específica como 'rechazada'.
   * Actualiza el estado tanto en la base de datos como localmente en la UI,
   * y notifica al solicitante.
   * @param {string} id El ID de la asesoría a rechazar.
   * @returns {Promise<void>} Una promesa que se resuelve cuando la asesoría ha sido rechazada.
   */
  async rechazarAsesoria(id: string): Promise<void> {
    try {
      await this.asesoriasService.updateEstadoAsesoria(id, 'rechazada'); // Actualiza el estado en la base de datos
      const asesoria = this.allAsesorias.find(a => a.id === id); // Busca la asesoría en la lista local
      if (asesoria) {
        asesoria.estado = 'rechazada'; // Actualiza el estado localmente para reflejar el cambio en la UI
        const notificacionKey = 'notificacion_asesoria_para_' + asesoria.solicitanteId;
        this.notificationService.show('Asesoría rechazada', 'info'); // Muestra notificación de éxito
        localStorage.setItem(notificacionKey, 'Tu solicitud de asesoría ha sido RECHAZADA'); // Almacena notificación para el solicitante
      }
      this.applyFiltersAndSort(); // Vuelve a aplicar filtros y ordenación para actualizar la vista
    } catch (error) {
      console.error('Error al rechazar la asesoría:', error);
      this.notificationService.show('Error al rechazar la asesoría', 'error'); // Muestra notificación de error
    }
  }
}