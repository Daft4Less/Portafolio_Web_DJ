import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

// Interfaces locales para los datos
interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string;
  imagenUrl: string;
  enlace: string;
}

interface PerfilProgramador {
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  especialidad: string;
  biografia: string;
  tecnologias: string[];
  proyectos: Proyecto[];
}

// Simulación de una "base de datos" de programadores
const PROGRAMADORES_DB: PerfilProgramador[] = [];

@Component({
  selector: 'app-ver-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-perfil.html',
  styleUrls: ['./ver-perfil.scss'],
})
export class VerPerfil implements OnInit {
  
  perfil$: Observable<PerfilProgramador | undefined>;

  constructor(private route: ActivatedRoute) {
    this.perfil$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      switchMap(id => {
        // En una app real, aquí se llamaría a un servicio: this.programadorService.getById(id)
        const perfilEncontrado = PROGRAMADORES_DB.find(p => p.uid === id);
        return of(perfilEncontrado);
      })
    );
  }

  ngOnInit(): void {
    // La lógica está en el constructor con los observables
  }
}
