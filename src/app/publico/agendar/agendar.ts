import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Observable, combineLatest, of } from 'rxjs';
import { takeUntil, switchMap, map, distinctUntilChanged } from 'rxjs/operators';
import { ProgramadoresService } from '../../services/programadores.service';
import { AsesoriasService } from '../../services/asesorias.service';
import { UserProfile } from '../../services/autenticacion.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar.html',
  styleUrls: ['./agendar.scss'],
})
export class Agendar implements OnInit, OnDestroy {
  programador: UserProfile | null = null;
  programadorSchedules: ProgrammerSchedule[] = [];
  agendamientoForm: FormGroup;
  solicitudEnviada = false;
  errorEnvio = '';

  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  availableDates: string[] = [];
  availableTimesForSelectedDate: string[] = [];
  fullDayScheduleRange: string = '';

  private unsubscribe$ = new Subject<void>();

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private asesoriasService: AsesoriasService,
    private programmerScheduleService: ProgrammerScheduleService,
    private notificationService: NotificationService
  ) {
    this.agendamientoForm = this.fb.group({
      fecha: new FormControl('', Validators.required),
      hora: new FormControl({ value: '', disabled: true }, Validators.required),
      comentario: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        const programadorId = params.get('id');
        if (programadorId) {
          const programadorProfile$ = this.programadoresService.getProgramadorProfile(programadorId);
          const programmerSchedules$ = this.programmerScheduleService.getSchedules(programadorId);

          return combineLatest([programadorProfile$, programmerSchedules$]).pipe(
            map(([profile, schedules]) => {
              this.programador = profile;
              this.programadorSchedules = schedules;
              this.processSchedules();
              return null;
            })
          );
        }
        this.programador = null;
        this.programadorSchedules = [];
        this.availableDates = [];
        this.availableTimesForSelectedDate = [];
        return of(null);
      })
    ).subscribe();

    this.agendamientoForm.get('fecha')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe(selectedDate => {
      this.updateAvailableTimes(selectedDate);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  processSchedules(): void {
    this.availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysToLookAhead = 30;
    const scheduleMap: { [date: string]: string[] } = {};

    for (let i = 0; i < daysToLookAhead; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const currentDayOfWeek = currentDate.getDay();

      const daySchedules = this.programadorSchedules.filter(
        s => s.dayOfWeek === currentDayOfWeek && s.isAvailable
      );

      if (daySchedules.length > 0) {
        const dateString = currentDate.toISOString().split('T')[0];
        scheduleMap[dateString] = [];

        daySchedules.forEach((schedule: ProgrammerSchedule) => {
          let now = new Date();
          let isToday = currentDate.toDateString() === now.toDateString();

          let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

          let currentTime = new Date(currentDate);
          currentTime.setHours(startHour, startMinute, 0, 0);

          let endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          while (currentTime.getTime() < endTime.getTime()) {
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60);
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    scheduleMap[dateString].push(timeRange);
                } else {
                    break;
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60);
            }
          }
        });
        
        scheduleMap[dateString] = [...new Set(scheduleMap[dateString])].sort();

        if (scheduleMap[dateString].length > 0) {
            this.availableDates.push(dateString);
        }
      }
    }
    if (this.availableDates.length > 0) {
      this.agendamientoForm.get('fecha')?.setValue(this.availableDates[0]);
      this.updateAvailableTimes(this.availableDates[0]);
    } else {
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }

  updateAvailableTimes(selectedDate: string): void {
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    selectedDateObj.setHours(0, 0, 0, 0);

    const daySchedules: ProgrammerSchedule[] = this.programadorSchedules.filter(
      s => s.dayOfWeek === selectedDateObj.getDay() && s.isAvailable
    );

    let times: string[] = [];
    let now = new Date();
    let isToday = selectedDateObj.toDateString() === now.toDateString();

    daySchedules.forEach((schedule: ProgrammerSchedule) => {
        let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        let currentTime = new Date(selectedDateObj);
        currentTime.setHours(startHour, startMinute, 0, 0);

        let endTime = new Date(selectedDateObj);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (currentTime.getTime() < endTime.getTime()) {
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60);
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    times.push(timeRange);
                } else {
                    break;
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60);
            }
        }
    });
    this.availableTimesForSelectedDate = [...new Set(times)].sort();

    if (daySchedules.length > 0) {
        const earliestStart = daySchedules.reduce((min, s) => s.startTime < min ? s.startTime : min, daySchedules[0].startTime);
        const latestEnd = daySchedules.reduce((max, s) => s.endTime > max ? s.endTime : max, daySchedules[0].endTime);
        this.fullDayScheduleRange = `Disponibilidad: ${earliestStart} - ${latestEnd}`;
    } else {
        this.fullDayScheduleRange = '';
    }

    if (this.availableTimesForSelectedDate.length > 0) {
      this.agendamientoForm.get('hora')?.enable();
      this.agendamientoForm.get('hora')?.setValue(this.availableTimesForSelectedDate[0]);
    } else {
      this.agendamientoForm.get('hora')?.disable();
      this.agendamientoForm.get('hora')?.setValue('');
    }
  }

  async onSubmit(): Promise<void> {
    if (this.agendamientoForm.invalid || !this.programador) {
      this.agendamientoForm.markAllAsTouched();
      this.errorEnvio = 'El formulario no es válido o no se ha cargado el programador.';
      console.error(this.errorEnvio);
      return;
    }

    this.errorEnvio = '';
    const solicitud = {
      programadorId: this.programador.uid,
      ...this.agendamientoForm.value
    };

    try {
      await this.asesoriasService.addSolicitudAsesoria(solicitud);
      this.solicitudEnviada = true;
      this.notificationService.show('Solicitud enviada. Serás notificado cuando sea revisada.', 'success');
      if (this.programador) {
        localStorage.setItem('nueva_solicitud_para_' + this.programador.uid, 'true');
      }
      this.agendamientoForm.reset();
      this.processSchedules();
    } catch (error) {
      console.error('Error al enviar la solicitud de asesoría:', error);
      this.notificationService.show('Error al enviar la solicitud.', 'error');
      this.errorEnvio = 'Hubo un error al enviar la solicitud. Por favor, inténtalo más tarde.';
    }
  }

  resetearFormulario(): void {
    this.solicitudEnviada = false;
    this.errorEnvio = '';
    this.agendamientoForm.reset({
        fecha: this.availableDates.length > 0 ? this.availableDates[0] : '',
        hora: '',
        comentario: ''
    });
    if (this.availableDates.length > 0) {
        this.agendamientoForm.get('fecha')?.enable();
        this.agendamientoForm.get('hora')?.enable();
        this.updateAvailableTimes(this.availableDates[0]);
    } else {
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }
}
