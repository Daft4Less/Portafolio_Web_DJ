import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradoresService } from '../../services/administradores.service';
import { UserProfile } from '../../services/autenticacion.service'; // Reutilizar UserProfile
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

//Gestion de usuarios con rol Usuario normal
@Component({
  selector: 'app-adm-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], 
  templateUrl: './adm-usuarios.html',
  styleUrl: './adm-usuarios.scss',
})
export class AdmUsuarios implements OnInit {

  allUsers$: Observable<UserProfile[]>; // Observable que emite todos los perfiles de usuario
  normalUsers$: Observable<UserProfile[]>; // Observable que emite solo los perfiles de usuarios con rol 'Usuario normal'

  private selectedUserSubject = new BehaviorSubject<UserProfile | null>(null); // Subject para el usuario actualmente seleccionado
  selectedUser$ = this.selectedUserSubject.asObservable(); // Observable del usuario seleccionado

  userForm!: FormGroup; // Formulario reactivo para la edición del perfil del usuario
  showModal: boolean = false; // Controla la visibilidad del modal de gestión de usuarios


  constructor(
    private administradoresService: AdministradoresService, // Servicio para obtener y gestionar datos de usuarios
    private fb: FormBuilder // Servicio para construir formularios reactivos
  ) {
    // Inicializa el Observable que emite todos los perfiles de usuario.
    this.allUsers$ = this.administradoresService.getAllUsers();

    // Filtra el Observable `allUsers$` para obtener solo los usuarios con el rol 'Usuario normal'.
    this.normalUsers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Usuario normal'))
    );
  }

  //Inicializa el formulario reactivo userForm para la edición de perfiles de usuario.
  ngOnInit() {
    this.userForm = this.fb.group({
      uid: ['', Validators.required], // UID del usuario, requerido
      displayName: ['', Validators.required], // Nombre visible del usuario, requerido
      email: [{ value: '', disabled: true }, Validators.required], // Correo electrónico, requerido y deshabilitado para edición
    });
  }

  //Selecciona un usuario de la lista y carga sus datos en el formulario de edición.
  selectUser(user: UserProfile): void {
    this.selectedUserSubject.next(user); // Establece el usuario seleccionado
    try {
      // Rellena el formulario con los datos del perfil del usuario
      this.userForm.patchValue({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
    } catch (error) {
      console.error('Error al poblar el formulario de usuario:', error);
      alert('Error al cargar los datos del usuario en el formulario. El modal se mostrará pero los campos pueden estar vacíos.');
    }
    this.showModal = true; // Abre el modal de edición/visualización del usuario
  }

  //Guarda los cambios realizados en el perfil básico de un usuario
  async saveUser(): Promise<void> {
    if (this.userForm.valid) {
      // Extrae el UID, email y displayName del formulario
      const { uid, email, displayName } = this.userForm.getRawValue();
      const userData: Partial<UserProfile> = {
        displayName: displayName,
        email: email // El email se incluye aunque esté deshabilitado en el formulario
      };

      try {
        await this.administradoresService.updateUserProfile(uid, userData); // Actualiza el perfil del usuario en Firestore
        alert('Usuario actualizado exitosamente.');
        this.closeModal(); // Cierra el modal después de guardar
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar usuario.');
      }
    }
  }

  // Elimina un perfil de usuario de la base de datos.
  async deleteUser(uid: string): Promise<void> {
    // Solicita confirmación al usuario antes de eliminar
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await this.administradoresService.deleteUser(uid); // Llama al servicio para eliminar el usuario
        alert('Usuario eliminado exitosamente.');
        this.closeModal(); // Cierra el modal después de la eliminación
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario.');
      }
    }
  }

  // Cierra el modal de gestión de usuarios.
  closeModal(): void {
    this.selectedUserSubject.next(null); // Deselecciona el usuario
    this.userForm.reset(); // Resetea el formulario
    this.showModal = false; // Oculta el modal
  }
}
