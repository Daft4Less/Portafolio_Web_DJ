import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, DocumentData, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserProfile } from './autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class AdministradoresService {

  private usersCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.usersCollection = collection(this.firestore, 'users');
  }

  /**
   * Obtiene un observable con la lista de todos los perfiles de usuario.
   * @returns Un observable que emite un array de perfiles de usuario.
   */
  getAllUsers(): Observable<UserProfile[]> {
    // El idField 'uid' asegura que el UID del documento se incluya en el objeto.
    return collectionData(this.usersCollection, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  /**
   * Actualiza los datos de un perfil de usuario específico.
   * @param uid El ID del usuario a actualizar.
   * @param data Un objeto con los campos a actualizar. Puede ser un cambio de rol o cualquier otro dato.
   * @returns Una promesa que se resuelve cuando la actualización se completa.
   */
  updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDocRef, data);
  }

  /**
   * Elimina el perfil de un usuario de la base de datos de Firestore.
   * @param uid El ID del usuario a eliminar.
   * @returns Una promesa que se resuelve cuando la eliminación se completa.
   */
  deleteUser(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userDocRef);
  }
}
