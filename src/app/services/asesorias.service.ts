import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, CollectionReference, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Asesoria } from '../models/asesoria.model';

@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {

  private asesoriasCollection: CollectionReference<Asesoria>;

  constructor(private firestore: Firestore) {
    this.asesoriasCollection = collection(this.firestore, 'asesorias') as CollectionReference<Asesoria>;
  }

  // Crea una nueva solicitud de asesoría
  async createAsesoria(asesoriaData: Asesoria): Promise<void> {
    const docRef = doc(this.asesoriasCollection);
    asesoriaData.id = docRef.id; // Asignar el ID generado por Firestore
    return setDoc(docRef, asesoriaData);
  }

  // Obtiene las asesorías solicitadas a un programador específico
  getAsesoriasParaProgramador(programadorId: string): Observable<Asesoria[]> {
    const q = query(this.asesoriasCollection, where('programadorId', '==', programadorId));
    return collectionData(q, { idField: 'id' });
  }

  // Obtiene las asesorías que un usuario específico ha solicitado
  getAsesoriasDeSolicitante(solicitanteId: string): Observable<Asesoria[]> {
    const q = query(this.asesoriasCollection, where('solicitanteId', '==', solicitanteId));
    return collectionData(q, { idField: 'id' });
  }

  // Actualiza el estado de una asesoría (aprobada/rechazada)
  async updateEstadoAsesoria(asesoriaId: string, estado: 'aprobada' | 'rechazada', respuesta?: string): Promise<void> {
    const asesoriaDocRef = doc(this.asesoriasCollection, asesoriaId);
    const updateData: Partial<Asesoria> = { estado };
    if (respuesta) {
      updateData.respuestaProgramador = respuesta;
    }
    return updateDoc(asesoriaDocRef, updateData);
  }

  // (Opcional) Obtiene todas las asesorías (para el administrador)
  getAllAsesorias(): Observable<Asesoria[]> {
    return collectionData(this.asesoriasCollection, { idField: 'id' });
  }

  // (Opcional) Eliminar una asesoría (solo admin)
  async deleteAsesoria(asesoriaId: string): Promise<void> {
    const asesoriaDocRef = doc(this.asesoriasCollection, asesoriaId);
    return deleteDoc(asesoriaDocRef);
  }
}
