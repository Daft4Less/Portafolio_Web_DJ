import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc, deleteDoc, CollectionReference, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, of, firstValueFrom } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Asesoria } from '../models/asesoria.model';
import { AutenticacionService } from './autenticacion.service';


// Gestión de asesorías entre usuarios y programadores en FS
// Usuario solicita - Programador gestiona
@Injectable({
  providedIn: 'root'
})
export class AsesoriasService {

  private asesoriasCollection: CollectionReference<Asesoria>;

  constructor(
    private firestore: Firestore, 
    private authService: AutenticacionService 
    ) {
    // Inicializa la referencia a la colección 'asesorias' en Firestore
    this.asesoriasCollection = collection(this.firestore, 'asesorias') as CollectionReference<Asesoria>;
  }


  // CREAR() una nueva solicitud de asesoría FS
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
          // Convierte la fecha y hora de string a Timestamp de FS
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


  // OBTIENER() asesorías del programador autenticado
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
  

  //ACTUALIZAR() estado de una asesoría e incluye una respuesta del programador
  updateEstadoAsesoria(asesoriaId: string, estado: 'aprobada' | 'rechazada' | 'finalizada', respuesta?: string): Promise<void> {
    return firstValueFrom(this.authService.getUsuarioActual().pipe(
      switchMap(async user => {
        if (!user) {
          throw new Error('Usuario no autenticado.');
        }

        const asesoriaDocRef = doc(this.asesoriasCollection, asesoriaId);
        const docSnap = await getDoc(asesoriaDocRef);

        // Verifica que la asesoría exista y que el usuario autenticado sea el programador asociado
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


  // OBTIENE() asesorías con el id del programador
  getAsesoriasParaProgramador(programadorId: string): Observable<Asesoria[]> {
    const q = query(this.asesoriasCollection, where('programadorId', '==', programadorId));
    return collectionData(q, { idField: 'id' });
  }


  // OBTIENE() asesoria con el id del usuario solocitante 
  getAsesoriasDeSolicitante(solicitanteId: string): Observable<Asesoria[]> {
    const q = query(this.asesoriasCollection, where('solicitanteId', '==', solicitanteId));
    return collectionData(q, { idField: 'id' });
  }

  
}
