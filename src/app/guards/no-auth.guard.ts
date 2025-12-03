import { Injectable } from '@angular/core';
import { CanMatch, Route, UrlSegment, Router, UrlTree } from '@angular/router';
import { Observable, take, map } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanMatch {

  constructor(private authService: AutenticacionService, private router: Router) {}

  canMatch(
    route: Route,
    segments: UrlSegment[]): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    return this.authService.getUsuarioActual().pipe(
      take(1),
      map(user => {
        if (user) {
          // If logged in, redirect to a default authenticated page (e.g., inicio)
          return this.router.createUrlTree(['/inicio']);
        } else {
          // If not logged in, allow access to the route
          return true;
        }
      })
    );
  }
}
