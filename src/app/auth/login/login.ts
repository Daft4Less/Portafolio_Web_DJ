import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  errorMessage: string | null = null;

  constructor(
    private authService: AutenticacionService,
    private router: Router
  ) {}

  async login() {
    this.errorMessage = null;
    try {
      const userProfile = await this.authService.signInWithGoogle();
      if (userProfile) {
        
        switch (userProfile.role) {
          case 'Administrador':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'Programador':
            this.router.navigate(['/programador/dashboard']);
            break;
          default:
            this.router.navigate(['/inicio']);
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
}
