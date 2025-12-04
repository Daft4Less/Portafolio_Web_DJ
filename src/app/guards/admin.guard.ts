import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';


//Proteje rutas para que sean accesibles para el administrador
@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AutenticacionService,
    private router: Router // Servicio de enrutamiento para realizar redirecciones
  ) {}



  // La logica para determinar rutas para el administrador
  // Emite true si el acceso está permitido, o una UrlTree para redirigir.
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1), // Toma solo el primer valor emitido por el Observable para evitar suscripciones activas
      map(user => {
        // Caso 1: Usuario autenticado y con rol de Administrador
        if (user && user.role === 'Administrador') {
          return true; // Permite el acceso a la ruta
        } 
        // Caso 2: Usuario autenticado pero sin rol de Administrador
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
