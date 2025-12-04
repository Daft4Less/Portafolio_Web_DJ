import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdministradoresService } from '../../services/administradores.service';
import { UserProfile } from '../../services/autenticacion.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators'; // switchMap ya no es necesario
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

// Gestion de usuarios y programadores.
@Component({
  selector: 'app-adm-programadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './adm-programadores.html',
  styleUrl: './adm-programadores.scss',
})
export class AdmProgramadores implements OnInit, OnDestroy { // OnDestroy se mantiene para posibles futuras de limpieza.

  allUsers$: Observable<UserProfile[]>; // Observable que emite todos los perfiles de usuario.
  programmers$: Observable<UserProfile[]>; // Observable que emite solo los perfiles de usuarios con rol 'Programador'.
  nonProgrammers$: Observable<UserProfile[]>; // Observable que emite los perfiles de usuarios sin rol 'Programador'.

  private selectedProgrammerSubject = new BehaviorSubject<UserProfile | null>(null); // Subject para el programador actualmente seleccionado.
  selectedProgrammer$ = this.selectedProgrammerSubject.asObservable(); // Observable del programador seleccionado.
  // La suscripción de selectedProgrammerSubscription fue eliminada previamente ya que no se usaba para horarios.

  programmerForm!: FormGroup; // Formulario reactivo para la edición del perfil del programador.

  showModal: boolean = false; // Controla la visibilidad del modal de gestión de programadores.


  roles = ['Administrador', 'Programador', 'Usuario normal']; // Roles de usuario disponibles en el sistema.


  constructor(
    private administradoresService: AdministradoresService, // Servicio para obtener y gestionar datos de usuarios
    // El servicio programmerScheduleService fue eliminado de aquí.
    private fb: FormBuilder // Servicio para construir formularios reactivos
  ) {
    // Inicializa el Observable que emite todos los perfiles de usuario.
    this.allUsers$ = this.administradoresService.getAllUsers();

    // Filtra el Observable `allUsers$` para obtener solo los usuarios con el rol 'Programador'.
    this.programmers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Programador'))
    );

    // Filtra el Observable `allUsers$` para obtener solo los usuarios que NO tienen el rol 'Programador'.
    this.nonProgrammers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role !== 'Programador'))
    );
  }

  // Inicializa el formulario reactivo programmerForm para la edición de perfiles de programador.
  ngOnInit() {
    this.programmerForm = this.fb.group({
      uid: ['', Validators.required], 
      displayName: ['', Validators.required], 
      email: [{ value: '', disabled: true }, Validators.required], // Correo electrónico, requerido y deshabilitado para edición
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

  }

  // limpieza de suscripciones si fuera necesario.
  ngOnDestroy(): void {
  }

  //Selecciona un programador de la lista y carga sus datos en el formulario de edición.
  selectProgrammer(programmer: UserProfile): void {
    this.selectedProgrammerSubject.next(programmer); // Establece el programador seleccionado
    try {
      // Rellena el formulario con los datos del perfil del programador
      this.programmerForm.patchValue({
        uid: programmer.uid,
        displayName: programmer.displayName,
        email: programmer.email,
        photoURL: programmer.photoURL,
        role: programmer.role,
        especialidad: programmer.especialidad || '',
        descripcion: programmer.descripcion || '',
        contacto: { // Rellena los campos de contacto o deja vacíos si no existen
          github: programmer.contacto?.github || '',
          linkedin: programmer.contacto?.linkedin || '',
          website: programmer.contacto?.website || ''
        }
      });
    } catch (error) {
      console.error('Error al poblar el formulario de programador:', error);
      alert('Error al cargar los datos del programador en el formulario. El modal se mostrará pero los campos pueden estar vacíos.');
    }
    this.showModal = true; // Abre el modal de edición/visualización del programador
  }

  //Guarda los cambios realizados en el perfil de un programador
  async saveProgrammer(): Promise<void> {
    if (this.programmerForm.valid) {
      // Extrae el UID y email, y el resto de los datos del formulario
      const { uid, email, ...formData } = this.programmerForm.getRawValue();
      const programmerData: Partial<UserProfile> = {
        ...formData,
        email: email // Re-asigna el email que podría haber sido deshabilitado en el formulario
      };

      try {
        await this.administradoresService.updateUserProfile(uid, programmerData); // Actualiza el perfil del usuario en FS
        alert('Programador actualizado exitosamente.');
        this.closeModal(); // Cierra el modal después de guardar
      } catch (error) {
        console.error('Error al actualizar programador:', error);
        alert('Error al actualizar programador.');
      }
    }
  }

  //Elimina un perfil de programador de la base de datos.
  async deleteProgrammer(uid: string): Promise<void> {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar este programador?')) {
      try {
        await this.administradoresService.deleteUser(uid); // Llama al servicio para eliminar el usuario
        alert('Programador eliminado exitosamente.');
        this.closeModal(); // Cierra el modal después de la eliminación
      } catch (error) {
        console.error('Error al eliminar programador:', error);
        alert('Error al eliminar programador.');
      }
    }
  }

  //Promueve un usuario al rol de Programador
  async promoteToProgrammer(user: UserProfile): Promise<void> {
    // Solicita confirmación al usuario antes de promoverlo
    if (confirm(`¿Estás seguro de que quieres promover a ${user.displayName} a Programador?`)) {
      try {
        // Actualiza el rol del usuario a 'Programador' en la base de datos
        await this.administradoresService.updateUserProfile(user.uid, { role: 'Programador' });
        // Actualiza el programador seleccionado en la UI para reflejar el cambio de rol
        this.selectProgrammer({ ...user, role: 'Programador' });
      } catch (error) {
        console.error('Error al promover a programador:', error);
        alert('Error al promover a programador.');
      }
    }
  }

  //Degrada un programador al rol de Usuario normal
  async demoteFromProgrammer(user: UserProfile): Promise<void> {
    // Solicita confirmación al usuario antes de degradar
    if (confirm(`¿Estás seguro de que quieres degradar a ${user.displayName} de Programador a Usuario normal?`)) {
      try {
        // Actualiza el rol del usuario a 'Usuario normal' en la base de datos
        await this.administradoresService.updateUserProfile(user.uid, { role: 'Usuario normal' });
        alert(`${user.displayName} ha sido degradado a Usuario normal.`);
        this.closeModal(); // Cierra el modal después de la degradación
      } catch (error) {
        console.error('Error al degradar a programador:', error);
        alert('Error al degradar a programador.');
      }
    }
  }

  //Cierra el modal de gestión de programadores.
  closeModal(): void {
    this.selectedProgrammerSubject.next(null); // Deselecciona el programador
    this.programmerForm.reset(); // Resetea el formulario
    this.showModal = false; // Oculta el modal
  }

}

