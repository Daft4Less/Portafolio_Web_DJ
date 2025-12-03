import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc, docSnapshots, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, map, switchMap, firstValueFrom } from 'rxjs';
import { Project } from '../models/portfolio.model';
import { AutenticacionService, UserProfile } from './autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  constructor(
    private firestore: Firestore,
    private authService: AutenticacionService
  ) {}

  private getUserDocRef() {
    // Helper para no repetir código. Obtiene la referencia al documento del usuario actual.
    const user = this.authService.getUsuarioActual(); // Esto es un observable
    return user.pipe(
      map(u => u ? doc(this.firestore, `users/${u.uid}`) as DocumentReference<UserProfile> : null)
    );
  }

  // Obtiene los proyectos del programador autenticado desde el array en su documento
  getProyectos(): Observable<Project[]> {
    return this.getUserDocRef().pipe(
      switchMap(userDocRef => {
        if (!userDocRef) return of([]);
        return docSnapshots<UserProfile>(userDocRef).pipe(
          map(docSnap => docSnap.data()?.projects || [])
        );
      })
    );
  }

  // Añade un nuevo proyecto al array del programador autenticado
  async addProyecto(project: Omit<Project, 'id'>): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.');

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || [];
    
    const newProject: Project = {
      ...project,
      id: new Date().getTime().toString() // Generar un ID simple
    };

    const updatedProjects = [...existingProjects, newProject];
    return updateDoc(userDocRef, { projects: updatedProjects });
  }

  // Actualiza un proyecto existente en el array del programador
  async updateProyecto(projectId: string, datosActualizados: Partial<Project>): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.');

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || [];

    const updatedProjects = existingProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, ...datosActualizados, id: p.id }; // Asegurar que el ID no se sobreescriba
      }
      return p;
    });

    return updateDoc(userDocRef, { projects: updatedProjects });
  }

  // Elimina un proyecto del array del programador
  async deleteProyecto(projectId: string): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.');

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || [];
    
    const updatedProjects = existingProjects.filter(p => p.id !== projectId);
    
    return updateDoc(userDocRef, { projects: updatedProjects });
  }
}
