import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdministradoresService } from '../../services/administradores.service';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';
// import { ProgrammerScheduleService } from '../../services/programmer-schedule.service'; // ELIMINADO
// import { ProgrammerSchedule } from '../../models/programmer-schedule.model'; // ELIMINADO
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators'; // switchMap ya no es necesario
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-adm-programadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-programadores.html',
  styleUrl: './adm-programadores.scss',
})
export class AdmProgramadores implements OnInit, OnDestroy { // OnDestroy se mantiene por selectedProgrammerSubscription

  allUsers$: Observable<UserProfile[]>;
  programmers$: Observable<UserProfile[]>;
  nonProgrammers$: Observable<UserProfile[]>;

  private selectedProgrammerSubject = new BehaviorSubject<UserProfile | null>(null);
  selectedProgrammer$ = this.selectedProgrammerSubject.asObservable();
  // private selectedProgrammerSubscription: Subscription | undefined; // Ya no se usa para horarios, se puede eliminar si no hay otros usos. Aquí lo dejo por ahora por si hay alguna otra suscripción implícita.

  programmerForm!: FormGroup;

  showModal: boolean = false; // Controla la visibilidad del modal principal

  // ELIMINADAS propiedades de Schedule management
  // programmerSchedules$: Observable<ProgrammerSchedule[]> | undefined;
  // scheduleForm!: FormGroup;
  // private selectedScheduleSubject = new BehaviorSubject<ProgrammerSchedule | null>(null);
  // selectedSchedule$ = this.selectedScheduleSubject.asObservable();

  roles = ['Administrador', 'Programador', 'Usuario normal'];
  // ELIMINADOS daysOfWeek y timeSlots

  constructor(
    private administradoresService: AdministradoresService,
    private autenticacionService: AutenticacionService,
    // private programmerScheduleService: ProgrammerScheduleService, // ELIMINADO
    private fb: FormBuilder
  ) {
    this.allUsers$ = this.administradoresService.getAllUsers();

    this.programmers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Programador'))
    );

    this.nonProgrammers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role !== 'Programador'))
    );
  }

  ngOnInit() {
    this.programmerForm = this.fb.group({
      uid: ['', Validators.required],
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      photoURL: [''],
      role: ['Usuario normal', Validators.required],
      especialidad: [''],
      descripcion: [''],
      contacto: this.fb.group({
        github: [''],
        linkedin: [''],
        website: ['']
      })
    });

    // ELIMINADA inicialización de scheduleForm
    // ELIMINADA suscripción de schedules
    // ELIMINADO programmerSchedules$
  }

  ngOnDestroy(): void {
    // if (this.selectedProgrammerSubscription) { // Sólo si se usaba, pero como se ha eliminado toda lógica de horarios, esto ya no es necesario aquí.
    //   this.selectedProgrammerSubscription.unsubscribe();
    // }
  }

  selectProgrammer(programmer: UserProfile): void {
    this.selectedProgrammerSubject.next(programmer);
    try {
      this.programmerForm.patchValue({
        uid: programmer.uid,
        displayName: programmer.displayName,
        email: programmer.email,
        photoURL: programmer.photoURL,
        role: programmer.role,
        especialidad: programmer.especialidad || '',
        descripcion: programmer.descripcion || '',
        contacto: {
          github: programmer.contacto?.github || '',
          linkedin: programmer.contacto?.linkedin || '',
          website: programmer.contacto?.website || ''
        }
      });
    } catch (error) {
      console.error('Error al poblar el formulario de programador:', error);
      alert('Error al cargar los datos del programador en el formulario. El modal se mostrará pero los campos pueden estar vacíos.');
    }
    // this.cancelScheduleEdit(); // ELIMINADO
    this.showModal = true;
  }

  async saveProgrammer(): Promise<void> {
    if (this.programmerForm.valid) {
      const { uid, email, ...formData } = this.programmerForm.getRawValue();
      const programmerData: Partial<UserProfile> = {
        ...formData,
        email: email
      };

      try {
        await this.administradoresService.updateUserProfile(uid, programmerData);
        alert('Programador actualizado exitosamente.');
        this.closeModal();
      } catch (error) {
        console.error('Error al actualizar programador:', error);
        alert('Error al actualizar programador.');
      }
    }
  }

  async deleteProgrammer(uid: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar este programador?')) {
      try {
        await this.administradoresService.deleteUser(uid);
        alert('Programador eliminado exitosamente.');
        this.closeModal();
      } catch (error) {
        console.error('Error al eliminar programador:', error);
        alert('Error al eliminar programador.');
      }
    }
  }

  async promoteToProgrammer(user: UserProfile): Promise<void> {
    if (confirm(`¿Estás seguro de que quieres promover a ${user.displayName} a Programador?`)) {
      try {
        await this.administradoresService.updateUserProfile(user.uid, { role: 'Programador' });
        this.selectProgrammer({ ...user, role: 'Programador' });
      } catch (error)
      {
        console.error('Error al promover a programador:', error);
        alert('Error al promover a programador.');
      }
    }
  }

  async demoteFromProgrammer(user: UserProfile): Promise<void> {
    if (confirm(`¿Estás seguro de que quieres degradar a ${user.displayName} de Programador a Usuario normal?`)) {
      try {
        await this.administradoresService.updateUserProfile(user.uid, { role: 'Usuario normal' });
        alert(`${user.displayName} ha sido degradado a Usuario normal.`);
        this.closeModal();
      } catch (error) {
        console.error('Error al degradar a programador:', error);
        alert('Error al degradar a programador.');
      }
    }
  }

  closeModal(): void {
    this.selectedProgrammerSubject.next(null);
    this.programmerForm.reset();
    // this.cancelScheduleEdit(); // ELIMINADO
    this.showModal = false;
  }

  // ELIMINADOS todos los Schedule Management Methods
  // ELIMINADO private generateTimeSlots(): string[]
}

