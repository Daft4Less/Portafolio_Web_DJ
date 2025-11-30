import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autenticacion, UserProfile } from './services/autenticacion'; // <-- Importar el servicio y la interfaz
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  user$: Observable<UserProfile | null>;
  private userSubscription: Subscription | undefined;
  currentUser: UserProfile | null = null;
  errorMessage: string | null = null;

  constructor(private autenticacion: Autenticacion) {
    this.user$ = this.autenticacion.getUsuarioActual();
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  onRegisterWithGoogle(): void {
    this.errorMessage = null; // Limpiar errores previos
    this.autenticacion.registerWithGoogle()
      .then(profile => {
        this.currentUser = profile;
      })
      .catch(error => {
        this.handleAuthError(error);
      });
  }

  onSignInWithGoogle(): void {
    this.errorMessage = null; // Limpiar errores previos
    this.autenticacion.signInWithGoogle()
      .then(profile => {
        this.currentUser = profile;
      })
      .catch(error => {
        this.handleAuthError(error);
      });
  }

  private handleAuthError(error: Error): void {
    if (error.message === 'AUTH/USER-ALREADY-EXISTS') {
      this.errorMessage = 'Esta cuenta ya existe. Por favor, inicia sesión.';
    } else if (error.message === 'AUTH/USER-NOT-FOUND') {
      this.errorMessage = 'Usuario no registrado. Por favor, regístrate primero.';
    } else {
      // Manejo de otros posibles errores de Firebase
      this.errorMessage = 'Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.';
      console.error(error);
    }
  }

  logout(): void {
    this.errorMessage = null;
    this.autenticacion.logout()
      .then(() => {
        console.log("Sesión cerrada exitosamente");
      })
      .catch(error => {
        this.errorMessage = 'Error al cerrar sesión.';
        console.error("Error al cerrar sesión:", error);
      });
  }
}