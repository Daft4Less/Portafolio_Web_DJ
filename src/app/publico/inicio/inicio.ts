import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, of, forkJoin } from 'rxjs';
import { takeUntil, switchMap, map } from 'rxjs/operators';

import { ProgramadoresService } from '../../services/programadores.service';
import { UserProfile } from '../../services/autenticacion.service';
import { Project } from '../../models/portfolio.model';

// Interfaz extendida para incluir el nombre del programador en el proyecto
export interface ProyectoPopular extends Project {
  programadorName?: string;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.scss'],
})
export class Inicio implements OnInit, OnDestroy {

  programadoresDestacados: UserProfile[] = [];

  private unsubscribe$ = new Subject<void>();

  constructor(private programadoresService: ProgramadoresService) { }

  ngOnInit(): void {
    this.cargarProgramadoresDestacados();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  cargarProgramadoresDestacados(): void {
    this.programadoresService.getProgramadoresDestacados().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((programadores: UserProfile[]) => {
      this.programadoresDestacados = programadores;
    });
  }
}
