import { Injectable } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { off } from 'process';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// Definición de la interfaz del perfil de Usuario 
interface perfilUsuario {
  userId: string;
  email: string | null;
  rol: 'administrador' | 'programador' | 'Externo' ; //Definicion de roles
  name: string | null;
  speciality?: string;
  description?: string;
  profilePictureUrl?: string;
  // Otros campos relevantes
}

@Injectable({
  providedIn: 'root',
})



export class Autenticacion {

  //1. Observable que rastrea el estado de autenticacion de Firebase
  public firebaseUser$ = user(this.autenticacionFirebase);

  //2. Observable que tendra el perfil de Firebase, incluyendo el rol
  public currentUser$: Observable<perfilUsuario | null>;

  constructor(private autenticacionFirebase: Auth, private firestore: Firestore) {
    this.currentUser$ = this.firebaseUser$.pipe(
      // witchMap: transforma el usuario de Firebase en el perfil de Firestore
      switchMap(firebaseUser => {
        if (!firebaseUser) {
          // Si no hay usuario, devuelve Obsercable de null
          return of (null);
        } 

        // Si hay usuario, obtiene el perfil de Firestore buscandolo en la coleccion 'usuarios' con el userId del usuario
        const userRef = doc(this.firestore, 'usuarios' , firebaseUser.uid );

        return new Observable<perfilUsuario | null> (observer => {
          getDoc(userRef).then (async docSnap => {
            if (docSnap.exists()) {

              //Si el perfil existe (usuario ya registrado), se emite los datos del perfil de Firestore
              observer.next(docSnap.data() as perfilUsuario);
            } else {

              //Si el perfil no existe (nuevo usuario), se crea un perfil por defecto con el rol 'Externo'
              const perfilInicial: perfilUsuario = {
                userId: firebaseUser.uid,
                email: firebaseUser.email,
                rol: 'Externo',
                name: firebaseUser.displayName || 'Nuevo Usuario',
                speciality: '',
                description: '',
                profilePictureUrl: ''
              };

              //Guardar el nuevo perfil en Firestore 
              await setDoc(userRef, perfilInicial);

              // NOTA IMPORTANTE: Para que un usuario sea 'admin' o 'programmer',
              // el administrador (tú, por ahora) deberá modificar este documento en la
              // consola de Firebase y cambiar 'role' a 'admin' o 'programmer'
            }
            observer.complete();
          }).catch (error => observer.error (error));
        });
      })
    );
  }


  // Metodo para el login con Google
  async googleSignIn(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();

      await signInWithPopup(this.autenticacionFirebase, provider);
    } catch (error) {
      console.error('Error al iniciar sesion con Google:', error);

      //Aqui se puede implementar el manejo de errores mas sofisticado
    
    }
  }

  // Metodo para cerrar sesion
  signOut(): Promise<void> {
    return signOut(this.autenticacionFirebase);
  }

}




