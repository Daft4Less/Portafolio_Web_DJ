import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Observable, combineLatest, of, forkJoin, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Firestore, collection, collectionData, query, where, limit, doc, getDoc, collectionGroup } from '@angular/fire/firestore';

import { AutenticacionService, UserProfile } from './autenticacion.service';
import { ProyectosService } from './proyectos.service';
import { AsesoriasService } from './asesorias.service';
import { Project } from '../models/portfolio.model';

export interface DashboardStats {
  totalProyectos: number;
  asesoriasPendientes: number;
  asesoriasCompletadas: number;
}

export interface PerfilProgramador extends UserProfile {
  proyectos: Project[];
}

@Injectable({
  providedIn: 'root'
})
export class ProgramadoresService {

  constructor(
    private firestore: Firestore,
    private authService: AutenticacionService,
    private proyectosService: ProyectosService,
    private asesoriasService: AsesoriasService,
    private injector: Injector // Inject Injector
  ) { }

  // ====================================================================
  // == MÉTODOS PARA LA SECCIÓN DEL PROGRAMADOR AUTENTICADO (/programador)
  // ====================================================================

  getDashboardStats(): Observable<DashboardStats> {
    return combineLatest([
      this.proyectosService.getProyectos(),
      this.asesoriasService.getAsesorias()
    ]).pipe(
      map(([proyectos, asesorias]) => {
        const totalProyectos = proyectos.length;
        const asesoriasPendientes = asesorias.filter(a => a.estado === 'pendiente' || a.estado === 'aprobada').length;
        const asesoriasCompletadas = asesorias.filter(a => a.estado === 'finalizada').length;
        return { totalProyectos, asesoriasPendientes, asesoriasCompletadas };
      })
    );
  }

  getProgramadorProfile(id: string): Observable<UserProfile | null> {
    const userDocRef = doc(this.firestore, `users/${id}`);
    return runInInjectionContext(this.injector, () => // Wrap getDoc in runInInjectionContext
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

  // ====================================================================
  // == MÉTODOS PARA LA SECCIÓN PÚBLICA (/publico)
  // ====================================================================

  getAllProgramadores(): Observable<UserProfile[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('role', '==', 'Programador'));
    return runInInjectionContext(this.injector, () => // Wrap collectionData in runInInjectionContext
      collectionData(q, { idField: 'uid' }) as Observable<UserProfile[]>
    );
  }

  getProgramadorById(id: string): Observable<PerfilProgramador | null> {
    const programadorDocRef = doc(this.firestore, `users/${id}`);
    
    return runInInjectionContext(this.injector, () => // Wrap getDoc in runInInjectionContext
      from(getDoc(programadorDocRef)).pipe(
        map(docSnap => {
          if (!docSnap.exists() || docSnap.data()['role'] !== 'Programador') {
            return null;
          }
          // El documento del programador ya contiene el array de proyectos.
          // Solo necesitamos asegurar que si el array no existe, se asigne uno vacío.
          const data = docSnap.data();
          return {
            ...data,
            proyectos: data['projects'] || [],
          } as PerfilProgramador;
        })
      )
    );
  }

  getProgramadoresDestacados(cantidad: number = 4): Observable<UserProfile[]> {
    return this.getAllProgramadores().pipe(
      map(programadores => programadores.slice(0, cantidad))
      // Nota: Una lógica de "destacados" más compleja requeriría un campo específico
      // en la DB para ordenar, ej. 'rating' o 'esDestacado'.
    );
  }
}
