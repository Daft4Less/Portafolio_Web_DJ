import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, combineLatest, of } from 'rxjs';
import { takeUntil, switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { ProgramadoresService } from '../../services/programadores.service';
import { AsesoriasService } from '../../services/asesorias.service';
import { UserProfile } from '../../services/autenticacion.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service';
import { NotificationService } from '../../services/notification';

// Agendar una asesoria con un programador especifico
@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar.html',
  styleUrls: ['./agendar.scss'],
})
export class Agendar implements OnInit, OnDestroy {
  programador: UserProfile | null = null; // Almacena el perfil del programador seleccionado
  programadorSchedules: ProgrammerSchedule[] = []; // Horarios de disponibilidad del programador
  agendamientoForm: FormGroup; // Formulario reactivo para la solicitud de agendamiento
  solicitudEnviada = false; // Indica si la solicitud de asesoría fue enviada exitosamente
  errorEnvio = ''; 

  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; 
  
  availableDates: string[] = []; // Fechas con disponibilidad calculada para el programador
  availableTimesForSelectedDate: string[] = []; // Franjas horarias disponibles para la fecha seleccionada
  fullDayScheduleRange: string = ''; // Rango horario general de disponibilidad del programador para el día

  private unsubscribe$ = new Subject<void>(); // Subject para gestionar la desuscripción de Observables


  /**
   * Formatea un objeto Date a una cadena de tiempo en formato "HH:MM".
   * @param {Date} date El objeto Date a formatear.
   * @returns {string} La hora formateada como "HH:MM".
   */
  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  constructor(
    private fb: FormBuilder, // Servicio para construir formularios reactivos
    private route: ActivatedRoute, // Para acceder a los parámetros de la URL
    private programadoresService: ProgramadoresService, // Servicio para obtener información de programadores
    private asesoriasService: AsesoriasService, // Servicio para gestionar solicitudes de asesoría
    private programmerScheduleService: ProgrammerScheduleService, // Servicio para obtener horarios de programadores
    private notificationService: NotificationService // Servicio para mostrar notificaciones al usuario
  ) {
    // Inicialización del formulario de agendamiento con sus controles y validaciones
    this.agendamientoForm = this.fb.group({
      fecha: new FormControl('', Validators.required), // Campo para la fecha, requerido
      hora: new FormControl({ value: '', disabled: true }, Validators.required), // Campo para la hora, requerido y deshabilitado inicialmente
      comentario: ['', [Validators.required, Validators.maxLength(300)]], // Campo de comentario, requerido con longitud máxima
    });
  }

  /**
   * Hook del ciclo de vida de Angular que se ejecuta después de la inicialización del componente.
   * Se encarga de cargar el perfil y horarios del programador, así como de escuchar cambios en el formulario.
   */
  ngOnInit(): void {
    // Suscribe a los cambios en los parámetros de la URL para obtener el ID del programador
    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$), // Gestiona la desuscripción al destruir el componente
      switchMap(params => {
        const programadorId = params.get('id');
        if (programadorId) {
          // Obtiene el perfil del programador y sus horarios de forma concurrente
          const programadorProfile$ = this.programadoresService.getProgramadorProfile(programadorId);
          const programmerSchedules$ = this.programmerScheduleService.getSchedules(programadorId);

          // Combina los resultados de ambos Observables
          return combineLatest([programadorProfile$, programmerSchedules$]).pipe(
            map(([profile, schedules]) => {
              this.programador = profile;
              this.programadorSchedules = schedules;
              this.processSchedules(); // Procesa los horarios obtenidos
              return null;
            })
          );
        }
        // Si no hay ID de programador, reinicia los datos y devuelve un Observable vacío
        this.programador = null;
        this.programadorSchedules = [];
        this.availableDates = [];
        this.availableTimesForSelectedDate = [];
        return of(null);
      })
    ).subscribe();

    // Suscribe a los cambios del campo 'fecha' del formulario para actualizar las horas disponibles
    this.agendamientoForm.get('fecha')?.valueChanges.pipe(
      distinctUntilChanged(), // Solo emite si el valor de la fecha cambia
      takeUntil(this.unsubscribe$) // Gestiona la desuscripción
    ).subscribe(selectedDate => {
      this.updateAvailableTimes(selectedDate); // Actualiza las horas disponibles
    });
  }


  //  Desuscribir todos los observables 
  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Emite un valor para notificar a todas las suscripciones de que deben terminar
    this.unsubscribe$.complete(); // Completa el Subject
  }

  //Calcular fechas y los horarios diponibles 

  processSchedules(): void {
    this.availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establece la hora a 00:00:00 para comparación de fechas

    const daysToLookAhead = 30; // Número de días futuros para buscar disponibilidad
    const scheduleMap: { [date: string]: string[] } = {}; // Mapa para almacenar franjas horarias por fecha

    // Itera sobre los próximos días para encontrar disponibilidad
    for (let i = 0; i < daysToLookAhead; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i); // Calcula la fecha actual en la iteración
      const currentDayOfWeek = currentDate.getDay(); // Obtiene el día de la semana (0-6)

      // Filtra los horarios del programador para el día de la semana actual y si están disponibles
      const daySchedules = this.programadorSchedules.filter(
        s => s.dayOfWeek === currentDayOfWeek && s.isAvailable
      );

      if (daySchedules.length > 0) {
        const dateString = currentDate.toISOString().split('T')[0]; // Formatea la fecha a "YYYY-MM-DD"
        scheduleMap[dateString] = [];

        daySchedules.forEach((schedule: ProgrammerSchedule) => {
          let now = new Date();
          let isToday = currentDate.toDateString() === now.toDateString(); // Comprueba si la fecha actual es hoy

          let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

          let currentTime = new Date(currentDate);
          currentTime.setHours(startHour, startMinute, 0, 0); // Establece la hora de inicio del bloque de horario

          let endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0); // Establece la hora de fin del bloque de horario

          // Genera franjas de 1 hora dentro del bloque de horario
          while (currentTime.getTime() < endTime.getTime()) {
            // Valida si la franja horaria es válida (ej. no es una hora pasada si es hoy)
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Avanza 1 hora
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    scheduleMap[dateString].push(timeRange);
                } else {
                    break; // Termina si el slot excede el tiempo final
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Avanza si el slot no es válido
            }
          }
        });
        
        // Elimina duplicados y ordena las franjas horarias
        scheduleMap[dateString] = [...new Set(scheduleMap[dateString])].sort();

        if (scheduleMap[dateString].length > 0) {
            this.availableDates.push(dateString); // Añade la fecha si tiene franjas disponibles
        }
      }
    }
    // Si hay fechas disponibles, selecciona la primera y actualiza las horas
    if (this.availableDates.length > 0) {
      this.agendamientoForm.get('fecha')?.setValue(this.availableDates[0]);
      this.updateAvailableTimes(this.availableDates[0]);
    } else {
        // Si no hay fechas disponibles, deshabilita los controles de fecha y hora
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }

  // Actualiza las horas diponibles basandose en la feccha seleccionada por el usuario 
  updateAvailableTimes(selectedDate: string): void {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    selectedDateObj.setHours(0, 0, 0, 0); // Normaliza la fecha seleccionada a medianoche

    // Filtra los horarios del programador que coinciden con el día de la semana y están disponibles
    const daySchedules: ProgrammerSchedule[] = this.programadorSchedules.filter(
      s => s.dayOfWeek === selectedDateObj.getDay() && s.isAvailable
    );

    let times: string[] = []; // Array para almacenar las franjas horarias generadas
    let now = new Date();
    let isToday = selectedDateObj.toDateString() === now.toDateString(); // Comprueba si la fecha seleccionada es hoy

    daySchedules.forEach((schedule: ProgrammerSchedule) => {
        let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        let currentTime = new Date(selectedDateObj);
        currentTime.setHours(startHour, startMinute, 0, 0); // Establece el inicio del bloque horario

        let endTime = new Date(selectedDateObj);
        endTime.setHours(endHour, endMinute, 0, 0); // Establece el fin del bloque horario

        // Genera franjas de 1 hora dentro del bloque horario del programador
        while (currentTime.getTime() < endTime.getTime()) {
            // Valida que el slot no sea una hora pasada si la fecha seleccionada es hoy
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Avanza 1 hora para el siguiente slot
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                // Asegura que el slot generado no excede el tiempo final del horario
                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    times.push(timeRange);
                } else {
                    break; // Sale del bucle si el slot excede el tiempo final
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Avanza al siguiente slot si el actual no es válido
            }
        }
    });
    this.availableTimesForSelectedDate = [...new Set(times)].sort(); // Elimina duplicados y ordena las franjas horarias

    // Calcula el rango horario completo del día si hay horarios disponibles
    if (daySchedules.length > 0) {
        const earliestStart = daySchedules.reduce((min, s) => s.startTime < min ? s.startTime : min, daySchedules[0].startTime);
        const latestEnd = daySchedules.reduce((max, s) => s.endTime > max ? s.endTime : max, daySchedules[0].endTime);
        this.fullDayScheduleRange = `Disponibilidad: ${earliestStart} - ${latestEnd}`;
    } else {
        this.fullDayScheduleRange = '';
    }

    // Habilita/deshabilita y establece el valor del control 'hora' en el formulario
    if (this.availableTimesForSelectedDate.length > 0) {
      this.agendamientoForm.get('hora')?.enable();
      this.agendamientoForm.get('hora')?.setValue(this.availableTimesForSelectedDate[0]);
    } else {
      this.agendamientoForm.get('hora')?.disable();
      this.agendamientoForm.get('hora')?.setValue('');
    }
  }

  // Envio formulario de la asesoria agendada
  async onSubmit(): Promise<void> {
    // Valida que el formulario sea válido y que se haya cargado un programador
    if (this.agendamientoForm.invalid || !this.programador) {
      this.agendamientoForm.markAllAsTouched(); // Marca todos los controles como tocados para mostrar errores de validación
      this.errorEnvio = 'El formulario no es válido o no se ha cargado el programador.';
      console.error(this.errorEnvio);
      return;
    }

    this.errorEnvio = ''; 
    const solicitud = {
      programadorId: this.programador.uid, // Asigna el ID del programador a la solicitud
      ...this.agendamientoForm.value // Añade los valores del formulario a la solicitud
    };

    try {
      await this.asesoriasService.addSolicitudAsesoria(solicitud); // Envía la solicitud de asesoría
      this.solicitudEnviada = true; // Actualiza el estado de envío de la solicitud
      this.notificationService.show('Solicitud enviada. Serás notificado cuando sea revisada.', 'success'); // Muestra notificación de éxito
      
      // Marca en localStorage que hay una nueva solicitud pendiente para el programador
      if (this.programador) {
        localStorage.setItem('nueva_solicitud_para_' + this.programador.uid, 'true');
      }
      this.agendamientoForm.reset(); // Reinicia el formulario
      this.processSchedules(); // Vuelve a procesar los horarios para reflejar posibles cambios (aunque no aplicable directamente aquí)
    } catch (error) {
      console.error('Error al enviar la solicitud de asesoría:', error);
      this.notificationService.show('Error al enviar la solicitud.', 'error'); // Muestra notificación de error
      this.errorEnvio = 'Hubo un error al enviar la solicitud. Por favor, inténtalo más tarde.';
    }
  }

  // Resetea el formulario de agendar a su estado inicial
  resetearFormulario(): void {
    this.solicitudEnviada = false; // Restablece el indicador de solicitud enviada
    this.errorEnvio = ''; // Limpia el mensaje de error
    // Reinicia el formulario, pre-seleccionando la primera fecha disponible si existe
    this.agendamientoForm.reset({
        fecha: this.availableDates.length > 0 ? this.availableDates[0] : '',
        hora: '',
        comentario: ''
    });
    // Habilita o deshabilita los campos de fecha y hora según la disponibilidad
    if (this.availableDates.length > 0) {
        this.agendamientoForm.get('fecha')?.enable();
        this.agendamientoForm.get('hora')?.enable();
        this.updateAvailableTimes(this.availableDates[0]); // Actualiza las horas para la fecha pre-seleccionada
    } else {
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }
}
