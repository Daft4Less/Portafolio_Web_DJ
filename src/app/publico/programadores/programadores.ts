import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { startWith, map, switchMap, takeUntil } from 'rxjs/operators';

import { ProgramadoresService } from '../../services/programadores.service';
import { UserProfile } from '../../services/autenticacion.service';

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss'],
})
export class Programadores implements OnInit, OnDestroy {
  
  private allProgrammers = new BehaviorSubject<UserProfile[]>([]);
  allProgrammers$ = this.allProgrammers.asObservable();
  
  filteredProgrammers$: Observable<UserProfile[]>;

  searchControl = new FormControl('');
  private unsubscribe$ = new Subject<void>();

  constructor(private programmersService: ProgramadoresService) {
    this.filteredProgrammers$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap(term => this.allProgrammers$.pipe(
        map((programmers: UserProfile[]) => this.filterProgrammers(programmers, term || ''))
      ))
    );
  }

  ngOnInit(): void {
    this.programmersService.getAllProgramadores().pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((programmers: UserProfile[]) => {
      this.allProgrammers.next(programmers);
    });
  }
  
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private filterProgrammers(programmers: UserProfile[], term: string): UserProfile[] {
    if (!term) {
      return programmers;
    }
    const lowerCaseTerm = term.toLowerCase();
    return programmers.filter(p => 
      p.displayName.toLowerCase().includes(lowerCaseTerm) ||
      (p.especialidad && p.especialidad.toLowerCase().includes(lowerCaseTerm))
      // Nota: El filtrado por tecnologías se omite porque 'tecnologias' no es un
      // campo directo del perfil de usuario en el modelo de datos actual.
    );
  }
}
