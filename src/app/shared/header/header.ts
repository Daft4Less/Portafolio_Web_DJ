import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';

// Cabecera de navegacion de la app
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {

  currentUser$: Observable<UserProfile | null>; // Observable que emite el perfil del usuario actualmente autenticado
  isLoginPage$: Observable<boolean>; // Observable que emite `true` si la página actual es la de login


  constructor(
    private router: Router,
    private authService: AutenticacionService // Servicio de autenticación para obtener el usuario actual
  ) {
    this.currentUser$ = this.authService.getUsuarioActual(); // Inicializa el observable del usuario actual

    // Crea un observable para determinar si la página actual es la de login
    this.isLoginPage$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd), // Solo considera eventos de fin de navegación
      map(event => (event as NavigationEnd).urlAfterRedirects === '/login'), // Mapea el evento a un booleano (true si es /login)
      startWith(this.router.url === '/login') // Emite un valor inicial basado en la URL actual al cargar el componente
    );
  }


  ngOnInit() {
    // La lógica de suscripción y gestión de datos se maneja declarativamente en el constructor
    // y en el template (con el pipe async), haciendo que este método sea opcionalmente vacío.
  }

  // Maneja la acción de cerrar sesión del usuario.
  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']); // Redirige a la página de login después de cerrar sesión
    });
  }
}


