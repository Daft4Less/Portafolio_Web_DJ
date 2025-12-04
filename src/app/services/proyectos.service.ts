import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc, docSnapshots, DocumentReference } from '@angular/fire/firestore';
import { Observable, of, map, switchMap, firstValueFrom } from 'rxjs';
import { Project } from '../models/portfolio.model';
import { AutenticacionService, UserProfile } from './autenticacion.service';


//Gestion de proyectos de los programadores 
@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  constructor(
    private firestore: Firestore, 
    private authService: AutenticacionService 
  ) {}


  //OBTENER() el id para ver si es un programador desde FS
  private getUserDocRef(): Observable<DocumentReference<UserProfile> | null> {
    const user = this.authService.getUsuarioActual();
    return user.pipe(
      map(u => u ? doc(this.firestore, `users/${u.uid}`) as DocumentReference<UserProfile> : null)
    );
  }


  //OBTENER() los proyectos del programador 
  getProyectos(): Observable<Project[]> {
    return this.getUserDocRef().pipe(
      switchMap(userDocRef => {
        if (!userDocRef) return of([]); // Si no hay referencia al documento de usuario, devuelve un array vacío
        return docSnapshots<UserProfile>(userDocRef).pipe(
          map(docSnap => docSnap.data()?.projects || []) // Extrae el array de proyectos o devuelve uno vacío
        );
      })
    );
  }


  // AGREGARPROYECTO() al array de los proyectos del programador 
  async addProyecto(project: Omit<Project, 'id'>): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.'); // Asegura que el usuario esté autenticado

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || []; // Obtiene proyectos existentes o un array vacío
    
    const newProject: Project = {
      ...project,
      id: new Date().getTime().toString() // Genera un ID único simple basado en el tiempo
    };

    const updatedProjects = [...existingProjects, newProject]; // Añade el nuevo proyecto al array
    return updateDoc(userDocRef, { projects: updatedProjects }); // Actualiza el documento del usuario en Firestore
  }


  // ACTUALIZA() proyectp existente en el array de proyectos del programador 
  async updateProyecto(projectId: string, datosActualizados: Partial<Project>): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.'); // Asegura que el usuario esté autenticado

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || []; // Obtiene proyectos existentes
    
    // Mapea y actualiza el proyecto correspondiente, asegurando que el ID no se cambie accidentalmente
    const updatedProjects = existingProjects.map(p => {
      if (p.id === projectId) {
        return { ...p, ...datosActualizados, id: p.id }; // Fusiona los cambios manteniendo el ID original
      }
      return p;
    });

    return updateDoc(userDocRef, { projects: updatedProjects }); // Actualiza el documento del usuario en Firestore
  }
  
  // EMILINA() proyecto especifico del array de proyectos del programador 
  async deleteProyecto(projectId: string): Promise<void> {
    const userDocRef = await firstValueFrom(this.getUserDocRef());
    if (!userDocRef) throw new Error('Usuario no autenticado.'); // Asegura que el usuario esté autenticado

    const docSnap = await getDoc(userDocRef);
    const existingProjects = docSnap.data()?.projects || []; // Obtiene proyectos existentes
    
    // Filtra el array de proyectos para eliminar la entrada con el ID coincidente
    const updatedProjects = existingProjects.filter(p => p.id !== projectId);
    
    return updateDoc(userDocRef, { projects: updatedProjects }); // Actualiza el documento del usuario en Firestore
  }
}
