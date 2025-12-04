import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, DocumentData, CollectionReference, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from './autenticacion.service';


// Gestion de usuarios administrativos
@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  private usersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    // Inicializa la referencia a la colección 'users' en FS
    this.usersCollection = collection(this.firestore, 'users');
  }



  //OBTENCION() una lista de todos los perfiles de usuario. (UID incluido)
  getAllUsers(): Observable<UserProfile[]> {
    return collectionData(this.usersCollection, { idField: 'uid' }) as Observable<UserProfile[]>;
  }


  // EDITAR() usuario existente por UID
  updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDocRef, data);
  }


  //ELIMINAR() un usuario por UID
  deleteUser(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userDocRef);
  }


  // OBTENER() el perfil de un usuario con UID
  async getUser(uid: string): Promise<UserProfile> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    } else {
      throw new Error('User not found!');
    }
  }
}
