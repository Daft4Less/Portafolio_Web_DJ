import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

import { ProgramadoresService, PerfilProgramador } from '../../services/programadores.service';
import { Project } from '../../models/portfolio.model'; // Asegúrate que la ruta sea correcta

@Component({
  selector: 'app-ver-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-perfil.html',
  styleUrls: ['./ver-perfil.scss'],
})
export class VerPerfil implements OnInit {
  
  perfil$: Observable<PerfilProgramador | null>;

  constructor(
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService
  ) {
    this.perfil$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          return this.programadoresService.getProgramadorById(id);
        }
        return of(null); // Si no hay ID, no hay perfil
      })
    );
  }

  ngOnInit(): void {
    // La lógica está en el constructor con los observables
  }
}
