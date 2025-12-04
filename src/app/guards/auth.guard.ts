import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';


// Acceso usuarios autenticados - No autenticado va a la de login 
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AutenticacionService, 
    private router: Router // Servicio de enrutamiento para realizar redirecciones
  ) {}


  // Logica que determina si una ruta puede ser activada 
  canActivate(
    _route: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1), // Toma solo el primer valor emitido por el Observable para evitar suscripciones activas
      map(user => {
        // Caso 1: Usuario autenticado
        if (user) {
          return true; // Permite el acceso a la ruta
        } 
        // Caso 2: Usuario no autenticado
        else {
          // Redirige a la página de login
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
