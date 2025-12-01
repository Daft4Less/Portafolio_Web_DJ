import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; 
import { Proyecto } from '../programador/proyectos/tarjeta-proyecto/tarjeta-proyecto'; 

@Injectable({
  providedIn: 'root'
})
export class ProyectosService {

  
  private proyectos: Proyecto[] = [
    
    {
      nombre: 'Web Personal v1',
      descripcion: 'Mi primera versión de portafolio web con un diseño moderno.',
      tecnologias: ['HTML', 'CSS', 'JavaScript'],
      linkGitHub: 'https://github.com/myuser/web-v1',
      linkDemo: 'https://web-v1.netlify.app',
      imagenUrl: 'https://via.placeholder.com/400x250.png/007bff/fff?text=Web+Personal'
    },
    {
      nombre: 'App de Tareas',
      descripcion: 'Aplicación para gestionar tareas diarias con funciones de añadir, editar y eliminar.',
      tecnologias: ['Angular', 'TypeScript', 'SCSS'],
      linkGitHub: 'https://github.com/myuser/todo-app',
      imagenUrl: 'https://via.placeholder.com/400x250.png/28a745/fff?text=Todo+App'
    }
  ];

  constructor() { }

  
  getProyectos(): Observable<Proyecto[]> {
    return of(this.proyectos); 
  }

  
  addProyecto(proyecto: Proyecto): Observable<Proyecto> {
    this.proyectos.push(proyecto);
    return of(proyecto); 
  }

 
  updateProyecto(nombre: string, proyectoActualizado: Proyecto): Observable<Proyecto | undefined> {
    const index = this.proyectos.findIndex(p => p.nombre === nombre);
    if (index > -1) {
      this.proyectos[index] = proyectoActualizado;
      return of(proyectoActualizado);
    }
    return of(undefined);
  }

 
  deleteProyecto(nombre: string): Observable<boolean> {
    const initialLength = this.proyectos.length;
    this.proyectos = this.proyectos.filter(p => p.nombre !== nombre);
    return of(this.proyectos.length < initialLength);
  }
}
