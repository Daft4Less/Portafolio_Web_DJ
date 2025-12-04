import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';

// Rutas para usuarios no autenticados
@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanMatch {

  constructor(
    private authService: AutenticacionService, 
    private router: Router 
  ) {}

  // Loga para ver que rutas se cargan 
  canMatch(
    _route: Route,
    _segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1), // Toma solo el primer valor emitido por el Observable
      map(user => {
        // Caso 1: Usuario autenticado
        if (user) {
          // Si está logueado, redirige a una página autenticada
          return this.router.createUrlTree(['/inicio']);
        } 
        // Caso 2: Usuario no autenticado
        else {
          // Si no está logueado, permite el acceso a la ruta registro
          return true;
        }
      })
    );
  }
}
