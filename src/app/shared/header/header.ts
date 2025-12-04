import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map, startWith } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { AutenticacionService, UserProfile } from '../../services/autenticacion.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header implements OnInit {

  currentUser$: Observable<UserProfile | null>;
  isLoginPage$: Observable<boolean>; // New observable to track if it's the login page
  isMenuOpen = false;

  constructor(private router: Router, private authService: AutenticacionService) {
    this.currentUser$ = this.authService.getUsuarioActual();

    this.isLoginPage$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => (event as NavigationEnd).urlAfterRedirects === '/login'),
      startWith(this.router.url === '/login')
    );
  }

  ngOnInit() {
    // No longer need to subscribe to shouldShowHeader$ here, as header is always visible
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onLogout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/login']);
    });
  }
}


