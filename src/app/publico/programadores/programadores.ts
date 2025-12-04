import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { startWith, map, switchMap, takeUntil } from 'rxjs/operators';

import { ProgramadoresService } from '../../services/programadores.service';
import { UserProfile } from '../../services/autenticacion.service';



// Muestra y gestiona la lista de programadores.
@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss'],
})
export class Programadores implements OnInit, OnDestroy {
  
  private allProgrammers = new BehaviorSubject<UserProfile[]>([]); // Almacena la lista completa de programadores
  allProgrammers$ = this.allProgrammers.asObservable(); // Observable de la lista completa
  
  filteredProgrammers$: Observable<UserProfile[]>; // Observable de la lista de programadores filtrada
  isAgendaMode: boolean = false; 

  searchControl = new FormControl(''); // Control de formulario para el campo de búsqueda
  private unsubscribe$ = new Subject<void>();

  constructor(
    private programmersService: ProgramadoresService, // Servicio para obtener y gestionar datos de programadores
    private route: ActivatedRoute // Servicio para acceder a la información de la ruta actual
  ) {
    // Realiza un filtrado dinámico de los programadores mostrados.
    this.filteredProgrammers$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Muestra todos los programadores al principio
      switchMap(term => this.allProgrammers$.pipe( // Cambia a un nuevo Observable cuando el término de búsqueda cambia
        map((programmers: UserProfile[]) => this.filterProgrammers(programmers, term || '')) // Aplica el filtro a la lista de programadores
      ))
    );
  }

  // Carga la lista de programadores
  ngOnInit(): void {
    // Suscribe a los parámetros de la URL para detectar si el modo es 'agendar'
    this.route.queryParamMap.pipe(
      takeUntil(this.unsubscribe$) // Gestiona la desuscripción al destruir el componente
    ).subscribe(params => {
      this.isAgendaMode = params.get('mode') === 'agendar';
    });

    // Carga todos los programadores del servicio y los almacena en allProgrammers
    this.programmersService.getAllProgramadores().pipe(
      takeUntil(this.unsubscribe$) // Gestiona la desuscripción al destruir el componente
    ).subscribe((programmers: UserProfile[]) => {
      this.allProgrammers.next(programmers);
    });
  }

  // Desuscribir todos los observables 
  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Emite un valor para notificar a todas las suscripciones de que deben terminar
    this.unsubscribe$.complete(); 
  }

  // FILTRA() lista de programadores segun la busqueda
  private filterProgrammers(programmers: UserProfile[], term: string): UserProfile[] {
    if (!term) {
      return programmers; // Si no hay término de búsqueda, devuelve todos los programadores
    }
    const lowerCaseTerm = term.toLowerCase();
    return programmers.filter(p => 
      p.displayName.toLowerCase().includes(lowerCaseTerm) || // Filtra por nombre de visualización
      (p.especialidad && p.especialidad.toLowerCase().includes(lowerCaseTerm)) // Filtra por especialidad (si existe)
    );
  }
}