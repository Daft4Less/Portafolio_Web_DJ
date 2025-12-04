import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';
import { Observable } from 'rxjs';

/**
 * Componente que gestiona la página de inicio de sesión y registro de usuarios.
 * Permite a los usuarios autenticarse, registrarse (ambos con Google) y cerrar sesión.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  errorMessage: string | null = null; // Almacena mensajes de error para mostrarlos en la vista.
  user$: Observable<UserProfile | null>; // Observable que contiene el perfil del usuario actual, para mostrar u ocultar elementos de la UI.

  constructor(
    private authService: AutenticacionService, // Servicio de autenticación para interactuar con Firebase.
    private router: Router // Servicio de enrutamiento para redirigir al usuario.
  ) {
    this.user$ = this.authService.getUsuarioActual();
  }

  // Maneja el proceso de inicio de sesión con Google
  async login() {
    this.errorMessage = null;
    try {
      const userProfile = await this.authService.signInWithGoogle();
      if (userProfile) {
        // Redirige según el rol del usuario
        switch (userProfile.role) {
          case 'Administrador':
            this.router.navigate(['/admin/adm-programadores']);
            break;
          case 'Programador':
            this.router.navigate(['/programador/proyectos']);
            break;
          default:
            this.router.navigate(['/inicio']);
            break;
        }
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      // Muestra un mensaje de error específico si el usuario no está registrado
      if (error.message === 'AUTH/USER-NOT-FOUND') {
        this.errorMessage = 'El usuario no está registrado. Por favor, crea una cuenta primero.';
      } else {
        this.errorMessage = 'Ocurrió un error durante el inicio de sesión.';
      }
    }
  }


  //  Maneja el proceso de registro con Google
  async register() {
    this.errorMessage = null; 
    try {
      const userProfile = await this.authService.registerWithGoogle();
      if (userProfile) {
        // Redirige a la página de inicio tras un registro exitoso.
        this.router.navigate(['/inicio']); 
      }
    } catch (error: any) {
      console.error('Error en el registro:', error);
      this.errorMessage = 'Ocurrió un error durante el registro con Google.';
    }
  }

  //Maneja el proceso de cierre de sesión del usuario.
  async logout() {
    try {
      await this.authService.logout();
      // No se redirige, el usuario permanece en la página de login.
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.errorMessage = 'Ocurrió un error al cerrar sesión.';
    }
  }
}
