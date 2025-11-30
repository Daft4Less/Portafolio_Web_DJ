// src/app/services/autenticacion.service.ts
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Interfaz para el perfil de usuario en Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'Administrador' | 'Programador' | 'Usuario normal';
  // Campos adicionales para programadores
  especialidad?: string;
  descripcion?: string;
  contacto?: any; // Puede ser un objeto con redes sociales
}

@Injectable({
  providedIn: 'root'
})
export class Autenticacion {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private injector: Injector
  ) {}

  /**
   * REGISTRO: Solo permite crear un usuario si NO existe previamente.
   */
  async registerWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Si el usuario ya existe, cerramos la sesión que acaba de iniciar Google
      // y luego lanzamos el error.
      await this.auth.signOut();
      throw new Error('AUTH/USER-ALREADY-EXISTS');
    } else {
      // Si no existe, crea el perfil, lo guarda y luego lo devuelve.
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL!,
        role: 'Usuario normal' // Rol por defecto
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    }
  }

  /**
   * INICIO DE SESIÓN: Solo permite entrar a un usuario si YA existe.
   */
  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Si el perfil ya existe, lo devuelve para iniciar sesión.
      return docSnap.data() as UserProfile;
    } else {
      // Si el usuario no existe, cerramos la sesión que acaba de iniciar Google
      // y luego lanzamos el error.
      await this.auth.signOut();
      throw new Error('AUTH/USER-NOT-FOUND');
    }
  }

  // Devuelve el estado de autenticación y el perfil de usuario de Firestore
  getUsuarioActual(): Observable<UserProfile | null> {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return runInInjectionContext(this.injector, () =>
            from(getDoc(doc(this.firestore, `users/${user.uid}`))).pipe(
              map(docSnap => {
                return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
              })
            )
          );
        } else {
          return of(null);
        }
      })
    );
  }

  // Cierra la sesión del usuario
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}