// src/app/services/autenticacion.service.ts
import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, authState, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Autenticacion {

  constructor(private auth: Auth) {}

  // Inicia sesión con la ventana emergente de Google
  loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  // Devuelve el estado actual del usuario como un observable
  getUsuarioActual(): Observable<User | null> {
    return authState(this.auth);
  }

  // Cierra la sesión del usuario
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}