import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(private authService: AutenticacionService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1),
      map(user => {
        if (user && user.role === 'Administrador') {
          return true;
        } else if (user) {
          // Logged in but not admin, redirect to a default authenticated page or deny access
          return this.router.createUrlTree(['/inicio']); // Or another appropriate redirect
        } else {
          // Not logged in, redirect to login page
          return this.router.createUrlTree(['/login']);
        }
      })
    );
  }
}
