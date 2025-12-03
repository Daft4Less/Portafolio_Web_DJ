import { Component, OnDestroy, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AutenticacionService, UserProfile } from './services/autenticacion.service';
import { Observable, Subscription } from 'rxjs';
import { Header } from './shared/header/header';
import { NotificationComponent } from './shared/notification/notification';
import { NotificationService } from './services/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Header, NotificationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  user$: Observable<UserProfile | null>;
  private userSubscription: Subscription | undefined;
  currentUser: UserProfile | null = null;
  errorMessage: string | null = null;

  constructor(
    private autenticacion: AutenticacionService,
    private notificationService: NotificationService
  ) {
    this.user$ = this.autenticacion.getUsuarioActual();
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Usamos un pequeño retraso para dar tiempo a que la vista se cargue.
        setTimeout(() => this.revisarNotificacionesPorRol(user), 100);
      }
    });
  }

  // Escucha cambios en el localStorage desde OTRAS pestañas
  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent): void {
    // Revisa cualquier notificación relevante cuando el storage cambia para el usuario actual
    if (this.currentUser && event.key && event.key.startsWith('notificacion_asesoria_para_') && event.key.includes(this.currentUser.uid)) {
      this.revisarNotificacionesPorRol(this.currentUser);
    } else if (this.currentUser && event.key && event.key.startsWith('nueva_solicitud_para_') && event.key.includes(this.currentUser.uid)) {
      this.revisarNotificacionesPorRol(this.currentUser);
    }
  }

  private revisarNotificacionesPorRol(user: UserProfile): void {
    if (user.role === 'Programador') {
      const key = 'nueva_solicitud_para_' + user.uid;
      const hayNuevaSolicitud = localStorage.getItem(key);
      if (hayNuevaSolicitud) {
        this.notificationService.show('Tienes nuevas solicitudes de asesoría.', 'info');
        localStorage.removeItem(key);
      }
    } else if (user.role === 'Usuario normal') {
      const notificacionKey = 'notificacion_asesoria_para_' + user.uid;
      const notificacion = localStorage.getItem(notificacionKey);
      if (notificacion) {
        const tipo = notificacion.includes('APROBADA') ? 'success' : 'error';
        this.notificationService.show(notificacion, tipo);
        localStorage.removeItem(notificacionKey);
      }
    }
    // El rol de Administrador no hará nada y no recibirá estas notificaciones.
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  onRegisterWithGoogle(): void {
    this.errorMessage = null;
    this.autenticacion.registerWithGoogle()
      .then(profile => {
        this.currentUser = profile;
      })
      .catch(error => {
        this.handleAuthError(error);
      });
  }

  onSignInWithGoogle(): void {
    this.errorMessage = null;
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