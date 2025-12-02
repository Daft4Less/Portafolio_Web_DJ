import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms'; // Import FormControl
import { ActivatedRoute } from '@angular/router';
import { Subject, Observable, combineLatest, of } from 'rxjs';
import { takeUntil, switchMap, map, distinctUntilChanged } from 'rxjs/operators'; // Import distinctUntilChanged

import { ProgramadoresService } from '../../services/programadores.service';
import { AsesoriasService } from '../../services/asesorias.service';
import { UserProfile } from '../../services/autenticacion.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service';

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
  
  availableDates: string[] = []; // List of dates with available slots
  availableTimesForSelectedDate: string[] = []; // Times for the currently selected date
  fullDayScheduleRange: string = ''; // New property to display the full range

  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private asesoriasService: AsesoriasService,
    private programmerScheduleService: ProgrammerScheduleService
  ) {
    this.agendamientoForm = this.fb.group({
      fecha: new FormControl('', Validators.required), // Use FormControl
      hora: new FormControl({ value: '', disabled: true }, Validators.required), // Use FormControl, disable initially
      comentario: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        const programadorId = params.get('programadorId');
        if (programadorId) {
          const programadorProfile$ = this.programadoresService.getProgramadorProfile(programadorId);
          const programmerSchedules$ = this.programmerScheduleService.getSchedules(programadorId);

          return combineLatest([programadorProfile$, programmerSchedules$]).pipe(
            map(([profile, schedules]) => {
              this.programador = profile;
              this.programadorSchedules = schedules;
              this.processSchedules(); // Process schedules after fetching
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

    // Listen for date changes to update available times
    this.agendamientoForm.get('fecha')?.valueChanges.pipe(
      distinctUntilChanged(), // Only emit when the value is truly different
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
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const daysToLookAhead = 30; // Look for schedules in the next 30 days
    const scheduleMap: { [date: string]: string[] } = {};

    for (let i = 0; i < daysToLookAhead; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday

      const daySchedules = this.programadorSchedules.filter(
        s => s.dayOfWeek === currentDayOfWeek && s.isAvailable
      );

      if (daySchedules.length > 0) {
        const dateString = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        scheduleMap[dateString] = [];

        daySchedules.forEach(schedule => {
          // Generate time slots within start and end time (e.g., every 30 mins)
          let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

          let currentTime = new Date(currentDate);
          currentTime.setHours(startHour, startMinute, 0, 0);

          let endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          while (currentTime.getTime() < endTime.getTime()) {
            // Only add if the slot is in the future
            if (currentTime.getTime() > new Date().getTime()) { // Corrected logic
                const timeSlot = currentTime.toTimeString().slice(0, 5);
                scheduleMap[dateString].push(timeSlot);
            }
            currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
          }
        });
        
        // Remove duplicates and sort times
        scheduleMap[dateString] = [...new Set(scheduleMap[dateString])].sort();

        if (scheduleMap[dateString].length > 0) {
            this.availableDates.push(dateString);
        }
      }
    }
    // Set first available date if exists
    if (this.availableDates.length > 0) {
      this.agendamientoForm.get('fecha')?.setValue(this.availableDates[0]);
      // Manually trigger update for times if initial date is set
      this.updateAvailableTimes(this.availableDates[0]); // Explicitly call updateAvailableTimes
    } else {
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }

  updateAvailableTimes(selectedDate: string): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentDate = new Date(selectedDate);
    currentDate.setHours(0, 0, 0, 0);

    const daySchedules = this.programadorSchedules.filter(
      s => s.dayOfWeek === currentDate.getDay() && s.isAvailable
    );

    let times: string[] = [];
    daySchedules.forEach(schedule => {
        let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        let currentTime = new Date(currentDate);
        currentTime.setHours(startHour, startMinute, 0, 0);

        let endTime = new Date(currentDate);
        endTime.setHours(endHour, endMinute, 0, 0);

        while (currentTime.getTime() < endTime.getTime()) {
            // Only add if the slot is in the future
            if (currentTime.getTime() > new Date().getTime()) { // Corrected logic
                const timeSlot = currentTime.toTimeString().slice(0, 5);
                times.push(timeSlot);
            }
            currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots
        }
    });
    this.availableTimesForSelectedDate = [...new Set(times)].sort();

    // Calculate full day schedule range
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
      this.agendamientoForm.reset();
      // Optionally re-process schedules after submission if availability changes
      this.processSchedules();
    } catch (error) {
      console.error('Error al enviar la solicitud de asesoría:', error);
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
        this.agendamientoForm.get('hora')?.enable(); // Ensure hora is enabled
        this.updateAvailableTimes(this.availableDates[0]);
    } else {
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }
}
