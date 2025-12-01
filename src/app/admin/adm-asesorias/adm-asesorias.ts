import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { AsesoriasService } from '../../services/asesorias.service'; // ELIMINADO
// import { Asesoria } from '../../models/asesoria.model'; // ELIMINADO
import { AdministradoresService } from '../../services/administradores.service'; // Para obtener nombres de usuarios
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service'; // Reutilizar UserProfile
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service'; // AÑADIDO
import { ProgrammerSchedule } from '../../models/programmer-schedule.model'; // AÑADIDO
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, filter, switchMap, take } from 'rxjs/operators'; // Añadido switchMap y take

import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-adm-asesorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-asesorias.html',
  styleUrl: './adm-asesorias.scss',
})
export class AdmAsesorias implements OnInit, OnDestroy {

  allUsers$: Observable<UserProfile[]>; // Para obtener todos los usuarios y filtrar
  programmers$: Observable<UserProfile[]>; // Lista de programadores
  
  private selectedProgrammerSubject = new BehaviorSubject<UserProfile | null>(null);
  selectedProgrammer$ = this.selectedProgrammerSubject.asObservable();
  private selectedProgrammerSubscription: Subscription | undefined;

  // Gestión de Horarios
  programmerSchedules$: Observable<ProgrammerSchedule[]> | undefined;
  scheduleForm!: FormGroup;
  private selectedScheduleSubject = new BehaviorSubject<ProgrammerSchedule | null>(null);
  selectedSchedule$ = this.selectedScheduleSubject.asObservable();
  
  showModal: boolean = false; // Controla la visibilidad del modal de horarios

  daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  timeSlots: string[] = this.generateTimeSlots();

  constructor(
    // private asesoriasService: AsesoriasService, // ELIMINADO
    private administradoresService: AdministradoresService,
    // private autenticacionService: AutenticacionService, // No se usa directamente aquí
    private programmerScheduleService: ProgrammerScheduleService, // AÑADIDO
    private fb: FormBuilder
  ) {
    this.allUsers$ = this.administradoresService.getAllUsers();
    this.programmers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Programador'))
    );
  }

  ngOnInit() {
    this.scheduleForm = this.fb.group({
      id: [null], // Para horarios existentes
      dayOfWeek: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true]
    });

    // Cargar horarios cuando se selecciona un programador
    this.selectedProgrammerSubscription = this.selectedProgrammer$.pipe(
      filter(programmer => !!programmer), // Solo si se selecciona un programador
      switchMap(programmer => this.programmerScheduleService.getProgrammerSchedules(programmer!.uid))
    ).subscribe(); // La visualización se maneja con el async pipe
    
    this.programmerSchedules$ = this.selectedProgrammer$.pipe(
        filter(programmer => !!programmer),
        switchMap(programmer => this.programmerScheduleService.getProgrammerSchedules(programmer!.uid))
    );
  }

  ngOnDestroy(): void {
    this.selectedProgrammerSubscription?.unsubscribe();
  }

  selectProgrammer(programmer: UserProfile): void {
    this.selectedProgrammerSubject.next(programmer);
    this.cancelScheduleEdit(); // Limpiar formulario de horarios
    this.showModal = true; // Mostrar el modal al seleccionar
  }

  // Métodos de gestión de horarios
  editSchedule(schedule: ProgrammerSchedule): void {
    this.selectedScheduleSubject.next(schedule);
    this.scheduleForm.patchValue(schedule);
  }

  async saveSchedule(): Promise<void> {
    if (this.scheduleForm.valid) {
      const programmer = this.selectedProgrammerSubject.getValue();
      if (!programmer) {
        alert('No hay programador seleccionado para guardar el horario.');
        return;
      }

      const scheduleData: ProgrammerSchedule = this.scheduleForm.value;

      try {
        if (scheduleData.id) { // Horario existente
          await this.programmerScheduleService.updateSchedule(programmer.uid, scheduleData.id, scheduleData);
          alert('Horario actualizado exitosamente.');
        } else { // Nuevo horario
          await this.programmerScheduleService.addSchedule(programmer.uid, scheduleData);
          alert('Horario agregado exitosamente.');
        }
        this.cancelScheduleEdit();
      } catch (error) {
        console.error('Error al guardar horario:', error);
        alert('Error al guardar horario.');
      }
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    const programmer = this.selectedProgrammerSubject.getValue();
    if (!programmer) {
      alert('No hay programador seleccionado para eliminar el horario.');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await this.programmerScheduleService.deleteSchedule(programmer.uid, scheduleId);
        alert('Horario eliminado exitosamente.');
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        alert('Error al eliminar horario.');
      }
    }
  }

  closeModal(): void {
    this.selectedProgrammerSubject.next(null); // Deseleccionar programador
    this.cancelScheduleEdit(); // Limpiar el formulario de horarios
    this.showModal = false; // Ocultar el modal
  }

  cancelScheduleEdit(): void {
    this.selectedScheduleSubject.next(null);
    this.scheduleForm.reset({ isAvailable: true }); // Reset con valor por defecto
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0');
        const minute = m.toString().padStart(2, '0');
        slots.push(`${hour}:${minute}`);
      }
    }
    return slots;
  }
}
