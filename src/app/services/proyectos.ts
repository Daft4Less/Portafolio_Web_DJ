import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; 
// import { Project } from '../models/portfolio.model'; // Se comenta para evitar errores de path

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  // Se inicializa como un array vacío
  private proyectos: any[] = [];

  constructor() { }

  // Los métodos ahora usan el tipo `any`
  getProyectos(): Observable<any[]> {
    return of(this.proyectos); 
  }

  addProyecto(proyecto: any): Observable<any> {
    // this.proyectos.push(proyecto);
    console.log('Backend debe implementar: addProyecto', proyecto);
    return of(proyecto); 
  }

  updateProyecto(id: string, proyectoActualizado: any): Observable<any | undefined> {
    console.log('Backend debe implementar: updateProyecto', id, proyectoActualizado);
    // const index = this.proyectos.findIndex(p => p.id === id);
    // if (index > -1) {
    //   this.proyectos[index] = proyectoActualizado;
    //   return of(proyectoActualizado);
    // }
    return of(undefined);
  }

  deleteProyecto(id: string): Observable<boolean> {
    console.log('Backend debe implementar: deleteProyecto', id);
    // const initialLength = this.proyectos.length;
    // this.proyectos = this.proyectos.filter(p => p.id !== id);
    // return of(this.proyectos.length < initialLength);
    return of(true);
  }
}
