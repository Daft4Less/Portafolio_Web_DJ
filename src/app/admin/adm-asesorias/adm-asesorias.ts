import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradoresService } from '../../services/administradores.service';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-adm-asesorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-asesorias.html',
  styleUrls: ['./adm-asesorias.scss'],
})
export class AdmAsesorias implements OnInit {
  allUsers$: Observable<UserProfile[]>;
  programmers$: Observable<UserProfile[]>;

  private selectedProgrammerSubject = new BehaviorSubject<UserProfile | null>(null);
  selectedProgrammer$ = this.selectedProgrammerSubject.asObservable();

  scheduleForm!: FormGroup;
  private selectedScheduleSubject = new BehaviorSubject<ProgrammerSchedule | null>(null);
  selectedSchedule$ = this.selectedScheduleSubject.asObservable();

  showModal: boolean = false;
  daysOfWeekArray = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(
    private administradoresService: AdministradoresService,
    private programmerScheduleService: ProgrammerScheduleService,
    private fb: FormBuilder
  ) {
    this.allUsers$ = this.administradoresService.getAllUsers();
    this.programmers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Programador'))
    );
  }

  ngOnInit() {
    this.scheduleForm = this.fb.group({
      id: [null],
      daysOfWeek: this.fb.group(
        this.daysOfWeekArray.reduce((acc, _, index) => ({ ...acc, [index]: this.fb.control(false) }), {})
      ),
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      isAvailable: [true]
    });
  }

  selectProgrammer(programmer: UserProfile): void {
    // Ensure schedules is an array
    const programmerWithSchedules = { ...programmer, schedules: programmer.schedules || [] };

    // Sort schedules by dayOfWeek
    if (programmerWithSchedules.schedules) {
      programmerWithSchedules.schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }

    this.selectedProgrammerSubject.next(programmerWithSchedules);
    this.cancelScheduleEdit();
    this.showModal = true;
  }

  editSchedule(schedule: ProgrammerSchedule): void {
    this.selectedScheduleSubject.next(schedule);
    const daysOfWeekState = this.daysOfWeekArray.reduce((acc, _, index) => {
      return { ...acc, [index]: index === schedule.dayOfWeek };
    }, {});
    
    this.scheduleForm.patchValue({
      id: schedule.id,
      daysOfWeek: daysOfWeekState,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable
    });

    this.scheduleForm.get('daysOfWeek')?.disable();
  }

  async saveSchedule(): Promise<void> {
    if (this.scheduleForm.invalid) {
      alert('Por favor, completa el formulario correctamente.');
      return;
    }

    const programmer = this.selectedProgrammerSubject.getValue();
    if (!programmer) {
      alert('No hay programador seleccionado.');
      return;
    }

    const formValue = this.scheduleForm.getRawValue();
    const { id, startTime, endTime, isAvailable } = formValue;

    try {
      if (id) { // Edit Mode
        const scheduleToUpdate = { startTime, endTime, isAvailable };
        await this.programmerScheduleService.updateSchedule(programmer.uid, id, scheduleToUpdate);
        
        // Refresh local data
        const updatedSchedules = programmer.schedules?.map(s => 
          s.id === id ? { ...s, ...scheduleToUpdate } : s
        ) || [];
        this.selectedProgrammerSubject.next({ ...programmer, schedules: updatedSchedules });
        
        alert('Horario actualizado exitosamente.');

      } else { // Add Mode
        const selectedDays = Object.keys(formValue.daysOfWeek)
          .filter(key => formValue.daysOfWeek[key])
          .map(Number);

        if (selectedDays.length === 0) {
          alert('Debes seleccionar al menos un día de la semana.');
          return;
        }

        for (const day of selectedDays) {
          const newSchedule: Omit<ProgrammerSchedule, 'id'> = {
            dayOfWeek: day,
            startTime,
            endTime,
            isAvailable
          };
          await this.programmerScheduleService.addSchedule(programmer.uid, newSchedule);
        }

        // To refresh, we must re-fetch the user to get the new IDs.
        const updatedProgrammer = await this.administradoresService.getUser(programmer.uid);
        this.selectedProgrammerSubject.next(updatedProgrammer);

        alert('Horario(s) agregado(s) exitosamente.');
      }
      this.cancelScheduleEdit();
    } catch (error) {
      console.error('Error al guardar horario:', error);
      alert('Error al guardar horario.');
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    const programmer = this.selectedProgrammerSubject.getValue();
    if (!programmer || !scheduleId) {
      alert('No hay programador o horario seleccionado.');
      return;
    }

    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await this.programmerScheduleService.deleteSchedule(programmer.uid, scheduleId);

        // Refresh local data
        const updatedSchedules = programmer.schedules?.filter(s => s.id !== scheduleId) || [];
        this.selectedProgrammerSubject.next({ ...programmer, schedules: updatedSchedules });

        alert('Horario eliminado exitosamente.');
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        alert('Error al eliminar horario.');
      }
    }
  }

  closeModal(): void {
    this.selectedProgrammerSubject.next(null);
    this.cancelScheduleEdit();
    this.showModal = false;
  }

  cancelScheduleEdit(): void {
    this.selectedScheduleSubject.next(null);
    this.scheduleForm.reset({ isAvailable: true });
    this.scheduleForm.get('daysOfWeek')?.enable();
  }
}
