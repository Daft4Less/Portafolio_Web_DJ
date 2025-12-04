import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';


// Proteger rutas que son accesibles para programadores 
@Injectable({
  providedIn: 'root'
})
export class ProgramadorGuard implements CanActivate {

  constructor(
    private authService: AutenticacionService, 
    private router: Router
  ) {}



  // Logica para activar una ruta 
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1), // Toma solo el primer valor emitido por el Observable para evitar suscripciones activas
      map(user => {
        // Caso 1: Usuario autenticado y con rol de Programador
        if (user && user.role === 'Programador') {
          return true; // Permite el acceso a la ruta
        } 
        // Caso 2: Usuario autenticado pero sin rol de Programador
        else if (user) {
          // Redirige a la página de inicio por no tener permisos suficientes
          return this.router.createUrlTree(['/inicio']);
        } 
        // Caso 3: Usuario no autenticado
        else {
          // Redirige a la página de login
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
