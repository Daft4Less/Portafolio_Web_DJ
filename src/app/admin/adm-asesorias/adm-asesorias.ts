import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradoresService } from '../../services/administradores.service';
import { UserProfile } from '../../services/autenticacion.service';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';


//Gestion de horarios de programadores.
@Component({
  selector: 'app-adm-asesorias',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-asesorias.html',
  styleUrls: ['./adm-asesorias.scss'],
})
export class AdmAsesorias implements OnInit {
  allUsers$: Observable<UserProfile[]>; // Observable que emite todos los perfiles de usuario
  programmers$: Observable<UserProfile[]>; // Observable que emite solo los perfiles de programadores

  private selectedProgrammerSubject = new BehaviorSubject<UserProfile | null>(null); // Subject para el programador actualmente seleccionado
  selectedProgrammer$ = this.selectedProgrammerSubject.asObservable(); // Observable del programador seleccionado

  scheduleForm!: FormGroup; // Formulario reactivo para la gestión de horarios
  private selectedScheduleSubject = new BehaviorSubject<ProgrammerSchedule | null>(null); // Subject para el horario seleccionado para edición
  selectedSchedule$ = this.selectedScheduleSubject.asObservable(); // Observable del horario seleccionado para edición

  showModal: boolean = false; // Controla la visibilidad del modal de gestión de horarios
  daysOfWeekArray = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; // Array de nombres de los días de la semana


  constructor(
    private administradoresService: AdministradoresService, // Servicio para obtener y gestionar datos de usuarios (incluidos programadores)
    private programmerScheduleService: ProgrammerScheduleService, // Servicio para gestionar los horarios de los programadores
    private fb: FormBuilder // Servicio para construir formularios reactivos
  ) {
    // Inicializa el Observable de todos los usuarios
    this.allUsers$ = this.administradoresService.getAllUsers();
    // Filtra el Observable de todos los usuarios para obtener solo los programadores
    this.programmers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Programador'))
    );
  }

  //Inicializa el formulario reactivo scheduleForm con sus controles y validaciones
  ngOnInit() {
    this.scheduleForm = this.fb.group({
      id: [null], // Campo oculto para almacenar el ID del horario si se está editando
      // Grupo de controles para seleccionar los días de la semana, inicializados a falso
      daysOfWeek: this.fb.group(
        this.daysOfWeekArray.reduce((acc, _, index) => ({ ...acc, [index]: this.fb.control(false) }), {})
      ),
      startTime: ['', Validators.required], // Hora de inicio del horario, campo requerido
      endTime: ['', Validators.required], // Hora de fin del horario, campo requerido
      isAvailable: [true] // Indica si el horario está disponible (por defecto, true)
    });
  }

  //SELECCIONA() un programador de la lista y lo establece como el programador actual para gestionar sus horarios.
  selectProgrammer(programmer: UserProfile): void {
    // Asegura que 'schedules' sea un array, incluso si está vacío o indefinido
    const programmerWithSchedules = { ...programmer, schedules: programmer.schedules || [] };

    // Ordena los horarios por día de la semana para una mejor visualización
    if (programmerWithSchedules.schedules) {
      programmerWithSchedules.schedules.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    }

    this.selectedProgrammerSubject.next(programmerWithSchedules); // Emite el programador seleccionado
    this.cancelScheduleEdit(); // Cancela cualquier edición de horario previa
    this.showModal = true; // Abre el modal de gestión de horarios
  }


  // CARGA() los datos de un horario seleccionado en el formulario para su edición.
  editSchedule(schedule: ProgrammerSchedule): void {
    this.selectedScheduleSubject.next(schedule); // Emite el horario seleccionado para edición
    // Prepara el estado de los checkboxes de días de la semana para el formulario
    const daysOfWeekState = this.daysOfWeekArray.reduce((acc, _, index) => {
      return { ...acc, [index]: index === schedule.dayOfWeek };
    }, {});
    
    // Rellena el formulario con los datos del horario seleccionado
    this.scheduleForm.patchValue({
      id: schedule.id,
      daysOfWeek: daysOfWeekState,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isAvailable: schedule.isAvailable
    });

    // Deshabilita la selección de días de la semana en modo edición
    this.scheduleForm.get('daysOfWeek')?.disable();
  }

  // Guarda un nuevo horario o actualiza uno existente para el programador seleccionadO
  async saveSchedule(): Promise<void> {
    // Valida el formulario
    if (this.scheduleForm.invalid) {
      alert('Por favor, completa el formulario correctamente.');
      return;
    }

    // Asegura que hay un programador seleccionado
    const programmer = this.selectedProgrammerSubject.getValue();
    if (!programmer) {
      alert('No hay programador seleccionado.');
      return;
    }

    const formValue = this.scheduleForm.getRawValue();
    const { id, startTime, endTime, isAvailable } = formValue;

    try {
      if (id) { // Modo Edición: si el formulario tiene un ID, se actualiza un horario existente
        const scheduleToUpdate = { startTime, endTime, isAvailable };
        await this.programmerScheduleService.updateSchedule(programmer.uid, id, scheduleToUpdate);
        
        // Actualiza los datos locales del programador seleccionado para reflejar el cambio en la UI
        const updatedSchedules = programmer.schedules?.map(s => 
          s.id === id ? { ...s, ...scheduleToUpdate } : s
        ) || [];
        this.selectedProgrammerSubject.next({ ...programmer, schedules: updatedSchedules });
        
        alert('Horario actualizado exitosamente.');

      } else { // Modo Adición: si no hay ID, se añade(n) nuevo(s) horario(s)
        // Obtiene los días de la semana seleccionados
        const selectedDays = Object.keys(formValue.daysOfWeek)
          .filter(key => formValue.daysOfWeek[key])
          .map(Number);

        if (selectedDays.length === 0) {
          alert('Debes seleccionar al menos un día de la semana.');
          return;
        }

        // Añade un nuevo horario por cada día seleccionado
        for (const day of selectedDays) {
          const newSchedule: Omit<ProgrammerSchedule, 'id'> = {
            dayOfWeek: day,
            startTime,
            endTime,
            isAvailable
          };
          await this.programmerScheduleService.addSchedule(programmer.uid, newSchedule);
        }

        // Vuelve a obtener el programador para refrescar los ID de los nuevos horarios añadidos
        const updatedProgrammer = await this.administradoresService.getUser(programmer.uid);
        this.selectedProgrammerSubject.next(updatedProgrammer);

        alert('Horario(s) agregado(s) exitosamente.');
      }
      this.cancelScheduleEdit(); // Cierra o resetea el formulario después de guardar
    } catch (error) {
      console.error('Error al guardar horario:', error);
      alert('Error al guardar horario.');
    }
  }

  //ELIMINA() un horario específico del programador seleccionado.
  
  async deleteSchedule(scheduleId: string): Promise<void> {
    const programmer = this.selectedProgrammerSubject.getValue();
    // Valida que haya un programador y un horario seleccionados
    if (!programmer || !scheduleId) {
      alert('No hay programador o horario seleccionado.');
      return;
    }

    // Pide confirmación antes de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      try {
        await this.programmerScheduleService.deleteSchedule(programmer.uid, scheduleId); // Llama al servicio para eliminar

        // Actualiza los datos locales del programador para reflejar la eliminación en la UI
        const updatedSchedules = programmer.schedules?.filter(s => s.id !== scheduleId) || [];
        this.selectedProgrammerSubject.next({ ...programmer, schedules: updatedSchedules });

        alert('Horario eliminado exitosamente.');
      } catch (error) {
        console.error('Error al eliminar horario:', error);
        alert('Error al eliminar horario.');
      }
    }
  }

  //Cierra el modal de gestión de horarios, restablece el programador seleccionado y cualquier edición de horario.
  closeModal(): void {
    this.selectedProgrammerSubject.next(null); // Deselecciona el programador
    this.cancelScheduleEdit(); // Cancela cualquier edición o añade un nuevo horario
    this.showModal = false; // Oculta el modal
  }

  //Cancela la edición de un horario, reseteando el formulario y el estado de edición.
  //Restablece el formulario a su estado inicial para una nueva adición
  cancelScheduleEdit(): void {
    this.selectedScheduleSubject.next(null); // Borra el horario que estaba siendo editado
    this.scheduleForm.reset({ isAvailable: true }); // Resetea el formulario a sus valores por defecto
    this.scheduleForm.get('daysOfWeek')?.enable(); // Habilita la selección de días para permitir añadir nuevos horarios
  }
}
