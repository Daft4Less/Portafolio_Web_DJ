import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, DocumentData, CollectionReference, getDoc } from '@angular/fire/firestore';
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

  getAllUsers(): Observable<UserProfile[]> {
    return collectionData(this.usersCollection, { idField: 'uid' }) as Observable<UserProfile[]>;
  }

  
  updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return updateDoc(userDocRef, data);
  }

  
  deleteUser(uid: string): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${uid}`);
    return deleteDoc(userDocRef);
  }

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
