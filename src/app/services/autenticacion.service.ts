
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, User, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';


export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'Administrador' | 'Programador' | 'Usuario normal';
  
  especialidad?: string;
  descripcion?: string;
  contacto?: any; 
}

@Injectable({
  providedIn: 'root'
})
export class AutenticacionService {

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private injector: Injector
  ) {}

  
  async registerWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      
      await this.auth.signOut();
      throw new Error('AUTH/USER-ALREADY-EXISTS');
    } else {
      
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

  
  async signInWithGoogle(): Promise<UserProfile> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const credential = await signInWithPopup(this.auth, provider);
    const user = credential.user;

    const userRef = doc(this.firestore, `users/${user.uid}`);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      
      return docSnap.data() as UserProfile;
    } else {
      
      await this.auth.signOut();
      throw new Error('AUTH/USER-NOT-FOUND');
    }
  }

  
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

  
  logout(): Promise<void> {
    return this.auth.signOut();
  }
}