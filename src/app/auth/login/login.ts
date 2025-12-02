import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  errorMessage: string | null = null;
  user$: Observable<UserProfile | null>;

  constructor(
    private authService: AutenticacionService,
    private router: Router
  ) {
    this.user$ = this.authService.getUsuarioActual();
  }

  async login() {
    this.errorMessage = null;
    try {
      const userProfile = await this.authService.signInWithGoogle();
      if (userProfile) {
        
        switch (userProfile.role) {
          case 'Administrador':
            this.router.navigate(['/admin/adm-programadores']); // Direct to Gestión Programadores
            break;
          case 'Programador':
            this.router.navigate(['/programador/proyectos']); // Direct to Mis Proyectos
            break;
          default:
            this.router.navigate(['/inicio']); // Default to /inicio for normal users
            break;
        }
      }
    } catch (error: any) {
      console.error('Error en el inicio de sesión:', error);
      if (error.message === 'AUTH/USER-NOT-FOUND') {
        this.errorMessage = 'El usuario no está registrado. Por favor, crea una cuenta primero.';
      } else {
        this.errorMessage = 'Ocurrió un error durante el inicio de sesión.';
      }
    }
  }

  async register() {
    this.errorMessage = null;
    try {
      const userProfile = await this.authService.registerWithGoogle();
      if (userProfile) {
        // Assuming successful registration redirects to the home page or a profile setup page
        this.router.navigate(['/inicio']); 
      }
    } catch (error: any) {
      console.error('Error en el registro:', error);
      this.errorMessage = 'Ocurrió un error durante el registro con Google.';
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      // No redirection after logout, stay on the current page.
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      this.errorMessage = 'Ocurrió un error al cerrar sesión.';
    }
  }
}
