import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdministradoresService } from '../../services/administradores.service';
import { UserProfile } from '../../services/autenticacion.service'; // Reutilizar UserProfile
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-adm-usuarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Añadir ReactiveFormsModule
  templateUrl: './adm-usuarios.html',
  styleUrl: './adm-usuarios.scss',
})
export class AdmUsuarios implements OnInit {

  allUsers$: Observable<UserProfile[]>;
  normalUsers$: Observable<UserProfile[]>; // Usuarios con rol 'Usuario normal'

  private selectedUserSubject = new BehaviorSubject<UserProfile | null>(null);
  selectedUser$ = this.selectedUserSubject.asObservable();

  userForm!: FormGroup;
  showModal: boolean = false; // Controla la visibilidad del modal de edición

  constructor(
    private administradoresService: AdministradoresService,
    private fb: FormBuilder
  ) {
    this.allUsers$ = this.administradoresService.getAllUsers();

    this.normalUsers$ = this.allUsers$.pipe(
      map(users => users.filter(user => user.role === 'Usuario normal'))
    );
  }

  ngOnInit() {
    this.userForm = this.fb.group({
      uid: ['', Validators.required],
      displayName: ['', Validators.required],
      email: [{ value: '', disabled: true }, Validators.required], // Email no editable
    });
  }

  selectUser(user: UserProfile): void {
    this.selectedUserSubject.next(user);
    try {
      this.userForm.patchValue({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      });
    } catch (error) {
      console.error('Error al poblar el formulario de usuario:', error);
      alert('Error al cargar los datos del usuario en el formulario. El modal se mostrará pero los campos pueden estar vacíos.');
    }
    this.showModal = true; // Mostrar el modal al seleccionar
  }

  async saveUser(): Promise<void> {
    if (this.userForm.valid) {
      const { uid, email, displayName } = this.userForm.getRawValue(); // Obtener email aunque esté deshabilitado
      const userData: Partial<UserProfile> = {
        displayName: displayName,
        email: email // Asegurarse de que el email se incluya si se necesita, aunque no se edite
      };

      try {
        await this.administradoresService.updateUserProfile(uid, userData);
        alert('Usuario actualizado exitosamente.');
        this.closeModal(); // Cerrar modal después de guardar
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar usuario.');
      }
    }
  }

  async deleteUser(uid: string): Promise<void> {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await this.administradoresService.deleteUser(uid);
        alert('Usuario eliminado exitosamente.');
        this.closeModal(); // Cerrar modal si el usuario editado es eliminado
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        alert('Error al eliminar usuario.');
      }
    }
  }

  closeModal(): void {
    this.selectedUserSubject.next(null);
    this.userForm.reset();
    this.showModal = false; // Ocultar el modal
  }
}
