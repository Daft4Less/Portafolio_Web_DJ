import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Autenticacion } from './services/autenticacion'; // <-- Importar el servicio
import { User } from '@angular/fire/auth';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  user$: Observable<User | null>;
  private userSubscription: Subscription | undefined;
  currentUser: User | null = null;

  constructor(private autenticacion: Autenticacion) {
    this.user$ = this.autenticacion.getUsuarioActual();
  }

  ngOnInit() {
    this.userSubscription = this.user$.subscribe(user => {
      this.currentUser = user;
      console.log('Usuario actual:', this.currentUser);
    });
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  SingInWithGoogle() {
    this.autenticacion.loginWithGoogle()
      .then(result => {
        console.log("Inicio de sesión exitoso:", result.user);
      })
      .catch(error => {
        console.error("Error en el inicio de sesión:", error);
      });
  }

  logout() {
    this.autenticacion.logout()
      .then(() => {
        console.log("Sesión cerrada exitosamente");
      })
      .catch(error => {
        console.error("Error al cerrar sesión:", error);
      });
  }
}