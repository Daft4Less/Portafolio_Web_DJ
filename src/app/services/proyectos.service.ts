import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, setDoc, updateDoc, deleteDoc, DocumentData, CollectionReference, query, where } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Project } from '../models/portfolio.model';

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  constructor(private firestore: Firestore) {}

  // Obtiene todos los proyectos de un programador específico
  getProyectos(programadorId: string): Observable<Project[]> {
    const proyectosCollection = collection(this.firestore, `users/${programadorId}/projects`) as CollectionReference<Project>;
    // Puedes añadir un query aquí si necesitas ordenar o filtrar
    return collectionData(proyectosCollection, { idField: 'id' });
  }

  // Añade un nuevo proyecto a un programador
  async addProyecto(programadorId: string, project: Project): Promise<void> {
    const proyectosCollection = collection(this.firestore, `users/${programadorId}/projects`);
    // Firestore asignará un ID automáticamente
    const docRef = doc(proyectosCollection);
    project.id = docRef.id; // Asignar el ID generado al objeto Project
    return setDoc(docRef, project);
  }

  // Actualiza un proyecto existente
  async updateProyecto(programadorId: string, projectId: string, datosActualizados: Partial<Project>): Promise<void> {
    const projectDocRef = doc(this.firestore, `users/${programadorId}/projects/${projectId}`);
    return updateDoc(projectDocRef, datosActualizados);
  }

  // Elimina un proyecto
  async deleteProyecto(programadorId: string, projectId: string): Promise<void> {
    const projectDocRef = doc(this.firestore, `users/${programadorId}/projects/${projectId}`);
    return deleteDoc(projectDocRef);
  }
}
