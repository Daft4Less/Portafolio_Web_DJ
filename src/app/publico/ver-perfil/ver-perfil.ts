import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { switchMap, map } from 'rxjs/operators'; // Import map
import { Observable, of, combineLatest } from 'rxjs'; // Import combineLatest

import { ProgramadoresService, PerfilProgramador } from '../../services/programadores.service';
import { ProgrammerScheduleService } from '../../services/programmer-schedule.service'; // Import service
import { ProgrammerSchedule } from '../../models/programmer-schedule.model'; // Import model


//Interfaz combina el perfil del programadosr con la lista de horarios
interface PerfilProgramadorConHorario extends PerfilProgramador {
  schedules: ProgrammerSchedule[];
}

//Muestra el perfil publico y detallado del programador + horarios 
@Component({
  selector: 'app-ver-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ver-perfil.html',
  styleUrls: ['./ver-perfil.scss'],
})
export class VerPerfil implements OnInit {
  
  perfilConHorario$: Observable<PerfilProgramadorConHorario | null>; // Observable que emite el perfil combinado con los horarios
  daysOfWeekArray = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; // Array para mapear el día de la semana


  constructor(
    private route: ActivatedRoute, // Servicio para acceder a la información de la ruta actual
    private programadoresService: ProgramadoresService, // Servicio para obtener datos de programadores
    private programmerScheduleService: ProgrammerScheduleService // Servicio para obtener horarios de programadores
  ) {
    // Pipeline de observables para cargar el perfil completo y los horarios
    this.perfilConHorario$ = this.route.paramMap.pipe(
      // Obtiene el ID del programador de los parámetros de la URL
      switchMap(params => {
        const id = params.get('id');
        if (id) {
          // Obtiene ambos observables: perfil y horarios
          const perfil$ = this.programadoresService.getProgramadorById(id);
          const schedules$ = this.programmerScheduleService.getSchedules(id);

          // Combina los resultados de ambos observables
          return combineLatest([perfil$, schedules$]).pipe(
            map(([perfil, schedules]) => {
              if (perfil) {
                // Si el perfil existe, combina el perfil y los horarios en un solo objeto
                return { ...perfil, schedules };
              }
              return null; // Si no hay perfil, devuelve null
            })
          );
        }
        return of(null); // Si no hay ID en la URL, devuelve un observable con null
      })
    );
  }

  ngOnInit(): void {
    // Toda la lógica de obtención de datos se maneja a través de un pipeline de observables en el constructor.
    // Esto se debe a que `ActivatedRoute` (y sus parámetros) está disponible en el constructor.
    // La suscripción se maneja en el template con el pipe `async`.
  }
}
