import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, map } from 'rxjs/operators'; // Import map
import { Observable, of, combineLatest } from 'rxjs'; // Import combineLatest

import { ProgramadoresService, PerfilProgramador } from '../../services/programadores.service';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service'; // Import service
import { Project } from '../../models/portfolio.model';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model'; // Import model

interface PerfilProgramadorConHorario extends PerfilProgramador {
  schedules: ProgrammerSchedule[];
}

@Component({
  selector: 'app-ver-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-perfil.html',
  styleUrls: ['./ver-perfil.scss'],
})
export class VerPerfil implements OnInit {
  
  perfilConHorario$: Observable<PerfilProgramadorConHorario | null>;

  constructor(
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private programmerScheduleService: ProgrammerScheduleService // Inject service
  ) {
    this.perfilConHorario$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          const perfil$ = this.programadoresService.getProgramadorById(id);
          const schedules$ = this.programmerScheduleService.getSchedules(id);

          return combineLatest([perfil$, schedules$]).pipe(
            map(([perfil, schedules]) => {
              if (perfil) {
                return { ...perfil, schedules };
              }
              return null;
            })
          );
        }
        return of(null);
      })
    );
  }

  ngOnInit(): void {
    // La lógica está en el constructor con los observables
  }
}
