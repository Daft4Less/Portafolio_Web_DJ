import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc, deleteDoc, CollectionReference, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, from, of, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Asesoria } from '../models/asesoria.model';
import { AutenticacionService } from './autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {

  private asesoriasCollection: CollectionReference<Asesoria>;

  constructor(
    private firestore: Firestore,
    private authService: AutenticacionService
    ) {
    this.asesoriasCollection = collection(this.firestore, 'asesorias') as CollectionReference<Asesoria>;
  }

  // Crea una nueva solicitud de asesoría (Usado por /publico/agendar)
  addSolicitudAsesoria(solicitud: { programadorId: string; fecha: string; hora: string; comentario: string }): Promise<void> {
    return firstValueFrom(this.authService.getUsuarioActual().pipe(
      switchMap(async user => {
        if (!user) {
          throw new Error('Debes iniciar sesión para solicitar una asesoría.');
        }

        const docRef = doc(this.asesoriasCollection);
        
        const nuevaAsesoria: Asesoria = {
          id: docRef.id,
          programadorId: solicitud.programadorId,
          // La fecha del formulario es un string, hay que convertirla a Date y luego a Timestamp
          fecha: Timestamp.fromDate(new Date(`${solicitud.fecha}T${solicitud.hora}`)),
          comentario: solicitud.comentario,
          solicitanteId: user.uid,
          solicitanteNombre: user.displayName,
          estado: 'pendiente'
        };
        
        return setDoc(docRef, nuevaAsesoria);
      })
    ));
  }

  // Obtiene las asesorías para el programador autenticado
  getAsesorias(): Observable<Asesoria[]> {
    return this.authService.getUsuarioActual().pipe(
      switchMap(user => {
        if (user) {
          return this.getAsesoriasParaProgramador(user.uid);
        } else {
          return of([]);
        }
      })
    );
  }
  
  // Actualiza el estado de una asesoría con validación de permisos
  updateEstadoAsesoria(asesoriaId: string, estado: 'aprobada' | 'rechazada' | 'finalizada', respuesta?: string): Promise<void> {
    return firstValueFrom(this.authService.getUsuarioActual().pipe(
      switchMap(async user => {
        if (!user) {
          throw new Error('Usuario no autenticado.');
        }

        const asesoriaDocRef = doc(this.asesoriasCollection, asesoriaId);
        const docSnap = await getDoc(asesoriaDocRef);

        if (!docSnap.exists() || docSnap.data()['programadorId'] !== user.uid) {
          throw new Error('Permiso denegado. No puedes modificar esta asesoría.');
        }
        
        const updateData: Partial<Asesoria> = { estado };
        if (respuesta) {
          updateData.respuestaProgramador = respuesta;
        }
        
        return updateDoc(asesoriaDocRef, updateData);
      })
    ));
  }

  // --- Métodos existentes (se mantienen por posible uso en otras partes como Admin) ---

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
