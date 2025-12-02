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
    console.log('processSchedules: Starting schedule processing.');
    console.log('processSchedules: programadorSchedules =', this.programadorSchedules);
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
      console.log(`processSchedules: For date ${currentDate.toISOString().split('T')[0]} (Day of Week: ${currentDayOfWeek}), found daySchedules:`, daySchedules);

      if (daySchedules.length > 0) {
        const dateString = currentDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
        scheduleMap[dateString] = [];

        daySchedules.forEach((schedule: ProgrammerSchedule) => {
          console.log(`processSchedules: Processing schedule for ${dateString}: ${schedule.startTime}-${schedule.endTime}`);
          let now = new Date(); // Capture current time once per function call
          let isToday = currentDate.toDateString() === now.toDateString();

          let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
          let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

          let currentTime = new Date(currentDate);
          currentTime.setHours(startHour, startMinute, 0, 0);

          let endTime = new Date(currentDate);
          endTime.setHours(endHour, endMinute, 0, 0);

          console.log(`processSchedules: Initial currentTime: ${this.formatTime(currentTime)}, endTime: ${this.formatTime(endTime)}`);
          console.log(`processSchedules: isToday: ${isToday}, now: ${this.formatTime(now)}`);

          while (currentTime.getTime() < endTime.getTime()) {
            console.log(`processSchedules: Inside while loop. Current time: ${this.formatTime(currentTime)}`);
            // Only add if the slot is in the future relative to 'now' if it's today,
            // or always add if it's a future date.
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;
            console.log(`processSchedules: isSlotValid condition evaluated to: ${isSlotValid}`);

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60);
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                // Ensure the slot doesn't exceed the schedule's end time
                console.log(`processSchedules: Checking slot: ${formattedSlotStartTime}-${formattedSlotEndTime}. slotEndTime: ${this.formatTime(slotEndTime)}, schedule endTime: ${this.formatTime(endTime)}`);
                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    scheduleMap[dateString].push(timeRange);
                    console.log(`processSchedules: Pushed timeRange: ${timeRange}`);
                } else {
                    console.log(`processSchedules: Slot ${formattedSlotStartTime}-${formattedSlotEndTime} exceeds schedule endTime. Breaking loop.`);
                    // If the next 60 min slot goes beyond the schedule's endTime,
                    // we should break the loop as no more valid slots can be formed.
                    break;
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Still advance for past slots if not valid
                console.log(`processSchedules: Slot not valid (past time), advancing currentTime to ${this.formatTime(currentTime)}`);
            }
          }
        });
        
        // Remove duplicates and sort times
        scheduleMap[dateString] = [...new Set(scheduleMap[dateString])].sort();
        console.log(`processSchedules: Final scheduleMap[${dateString}]:`, scheduleMap[dateString]);

        if (scheduleMap[dateString].length > 0) {
            this.availableDates.push(dateString);
            console.log(`processSchedules: Added ${dateString} to availableDates.`);
        }
      }
    }
    // Set first available date if exists
    console.log('processSchedules: All dates processed. availableDates:', this.availableDates);
    if (this.availableDates.length > 0) {
      this.agendamientoForm.get('fecha')?.setValue(this.availableDates[0]);
      console.log('processSchedules: Setting fecha to', this.availableDates[0]);
      // Manually trigger update for times if initial date is set
      this.updateAvailableTimes(this.availableDates[0]); // Explicitly call updateAvailableTimes
    } else {
        console.log('processSchedules: No available dates. Disabling fecha and hora controls.');
        this.agendamientoForm.get('fecha')?.disable();
        this.agendamientoForm.get('hora')?.disable();
    }
  }

  updateAvailableTimes(selectedDate: string): void {
    console.log('updateAvailableTimes: Starting for selectedDate:', selectedDate);
    const selectedDateObj = new Date(selectedDate + 'T00:00:00');
    selectedDateObj.setHours(0, 0, 0, 0); // Normalize to start of day
    console.log('updateAvailableTimes: selectedDateObj after setHours:', selectedDateObj);
    console.log('updateAvailableTimes: selectedDateObj.getDay():', selectedDateObj.getDay());

    const daySchedules: ProgrammerSchedule[] = this.programadorSchedules.filter(
      s => s.dayOfWeek === selectedDateObj.getDay() && s.isAvailable
    );
    console.log('updateAvailableTimes: Filtered daySchedules:', daySchedules);

    let times: string[] = [];
    let now = new Date(); // Capture current time once per function call
    let isToday = selectedDateObj.toDateString() === now.toDateString();

    daySchedules.forEach((schedule: ProgrammerSchedule) => {
        console.log(`updateAvailableTimes: Processing schedule: ${schedule.startTime}-${schedule.endTime}`);
        let [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        let [endHour, endMinute] = schedule.endTime.split(':').map(Number);

        let currentTime = new Date(selectedDateObj);
        currentTime.setHours(startHour, startMinute, 0, 0);

        let endTime = new Date(selectedDateObj);
        endTime.setHours(endHour, endMinute, 0, 0);

        console.log(`updateAvailableTimes: Initial currentTime: ${this.formatTime(currentTime)}, endTime: ${this.formatTime(endTime)}`);
        console.log(`updateAvailableTimes: isToday: ${isToday}, now: ${this.formatTime(now)}`);

        while (currentTime.getTime() < endTime.getTime()) {
            console.log(`updateAvailableTimes: Inside while loop. Current time: ${this.formatTime(currentTime)}`);
            // Only add if the slot is in the future relative to 'now' if it's today,
            // or always add if it's a future date.
            const isSlotValid = isToday ? currentTime.getTime() > now.getTime() : true;
            console.log(`updateAvailableTimes: isSlotValid condition evaluated to: ${isSlotValid}`);

            if (isSlotValid) {
                const slotStartTime = new Date(currentTime);
                currentTime.setMinutes(currentTime.getMinutes() + 60);
                const slotEndTime = new Date(currentTime);

                const formattedSlotStartTime = this.formatTime(slotStartTime);
                const formattedSlotEndTime = this.formatTime(slotEndTime);

                // Ensure the slot doesn't exceed the schedule's end time
                console.log(`updateAvailableTimes: Checking slot: ${formattedSlotStartTime}-${formattedSlotEndTime}. slotEndTime: ${this.formatTime(slotEndTime)}, schedule endTime: ${this.formatTime(endTime)}`);
                if (slotEndTime.getTime() <= endTime.getTime()) {
                    const timeRange = `${formattedSlotStartTime}-${formattedSlotEndTime}`;
                    times.push(timeRange);
                    console.log(`updateAvailableTimes: Pushed timeRange: ${timeRange}`);
                } else {
                    console.log(`updateAvailableTimes: Slot ${formattedSlotStartTime}-${formattedSlotEndTime} exceeds schedule endTime. Breaking loop.`);
                    // If the next 60 min slot goes beyond the schedule's endTime,
                    // we should break the loop as no more valid slots can be formed.
                    break;
                }
            } else {
                currentTime.setMinutes(currentTime.getMinutes() + 60); // Still advance for past slots
                console.log(`updateAvailableTimes: Slot not valid (past time), advancing currentTime to ${this.formatTime(currentTime)}`);
            }
        }
    });
    this.availableTimesForSelectedDate = [...new Set(times)].sort();
    console.log('updateAvailableTimes: Final availableTimesForSelectedDate:', this.availableTimesForSelectedDate);

    // Calculate full day schedule range
    if (daySchedules.length > 0) {
        const earliestStart = daySchedules.reduce((min, s) => s.startTime < min ? s.startTime : min, daySchedules[0].startTime);
        const latestEnd = daySchedules.reduce((max, s) => s.endTime > max ? s.endTime : max, daySchedules[0].endTime);
        this.fullDayScheduleRange = `Disponibilidad: ${earliestStart} - ${latestEnd}`;
        console.log('updateAvailableTimes: fullDayScheduleRange:', this.fullDayScheduleRange);
    } else {
        this.fullDayScheduleRange = '';
        console.log('updateAvailableTimes: No daySchedules, fullDayScheduleRange is empty.');
    }

    if (this.availableTimesForSelectedDate.length > 0) {
      this.agendamientoForm.get('hora')?.enable();
      this.agendamientoForm.get('hora')?.setValue(this.availableTimesForSelectedDate[0]);
      console.log('updateAvailableTimes: hora enabled and set to:', this.availableTimesForSelectedDate[0]);
    } else {
      this.agendamientoForm.get('hora')?.disable();
      this.agendamientoForm.get('hora')?.setValue('');
      console.log('updateAvailableTimes: hora disabled, no available times.');
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
