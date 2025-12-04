import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Observable, combineLatest, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Firestore, collection, collectionData, query, where, doc, getDoc } from '@angular/fire/firestore';

import { UserProfile } from './autenticacion.service';
import { ProyectosService } from './proyectos.service';
import { AsesoriasService } from './asesorias.service';
import { Project } from '../models/portfolio.model';





// Interfaz que incluye la lista de proyectos del programador 
export interface PerfilProgramador extends UserProfile {
  proyectos: Project[];
}



// Gestion y recuperacion de datos de programadores 
@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  constructor(
    private firestore: Firestore, 
    private proyectosService: ProyectosService, 
    private asesoriasService: AsesoriasService, 
    private injector: Injector 
  ) { }

  
  // OBTERNER() perfil programador por UID
  getProgramadorProfile(id: string): Observable<UserProfile | null> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    return runInInjectionContext(this.injector, () => // Envuelve getDoc para manejar la inyección
      from(getDoc(userDocRef)).pipe(
        map(docSnap => {
          if (docSnap.exists()) {
            return docSnap.data() as UserProfile;
          }
          return null;
        })
      )
    );
  }

  // OBTENER(): programadores para las tarjetas 
  getAllProgramadores(): Observable<UserProfile[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('role', '==', 'Programador')); // Filtra por usuarios con rol 'Programador'
    return runInInjectionContext(this.injector, () => // Envuelve collectionData para manejar el contexto de inyección
      collectionData(q, { idField: 'uid' }) as Observable<UserProfile[]>
    );
  }



  //OBETENER(): detalles del programador
  getProgramadorById(id: string): Observable<PerfilProgramador | null> {
    const programadorDocRef = doc(this.firestore, `users/${id}`);
    
    return runInInjectionContext(this.injector, () => // Envuelve getDoc para manejar la inyección
      from(getDoc(programadorDocRef)).pipe(
        map(docSnap => {
          if (!docSnap.exists() || docSnap.data()['role'] !== 'Programador') {
            return null;
          }

          const data = docSnap.data();
          return {
            ...data,
            proyectos: data['projects'] || [], 
          } as PerfilProgramador;
        })
      )
    );
  }


}
