
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ProgrammerSchedule } from '../models/programmer-schedule.model';
import { Project } from '../models/portfolio.model';


//Definicion de la estructura de un perfil de usuario
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'Administrador' | 'Programador' | 'Usuario normal';
  
  especialidad?: string;
  descripcion?: string;
  contacto?: any; 
  schedules?: ProgrammerSchedule[];
  projects?: Project[];
}

// Servicio encargado de la autenticación de usuarios y la gestión de sus perfiles usando Firebase Authentication: Google Sign-In y Firestore.
@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(
    private auth: Auth, 
    private firestore: Firestore, 
    private injector: Injector 
  ) {}

  

  // REGISTRAR() un nuevo usuario usando la autenticación de Google.
  // Si existe en FS, se desconecta y lanza error.
  // Si no, crea perfil con rol 'Usuario normal' en FS.
  async registerWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Si el usuario ya tiene un documento en FS, indica que ya está registrado.
      await this.auth.signOut();
      throw new Error('AUTH/USER-ALREADY-EXISTS');
    } else {
      // Crea un nuevo perfil de usuario en FS si no existe.
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName!,
        photoURL: user.photoURL!,
        role: 'Usuario normal' 
      };
      await setDoc(userRef, newUserProfile);
      return newUserProfile;
    }
  }



  // INICIAR SESIÓN() a un usuario existente usando Google Sign-In.
  //Si no tiene perfil en FS, se desconecta y lanza error.
  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      // Si el usuario tiene un documento en FB, devuelve su perfil.
      return docSnap.data() as UserProfile;
    } else {
      // Caso contrario indica que no está registrado.
      await this.auth.signOut();
      throw new Error('AUTH/USER-NOT-FOUND');
    }
  }


  // Obtiene el perfil del usuario actualmente autenticado.
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

  
  //Cierra sesion del usuario actual.
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}