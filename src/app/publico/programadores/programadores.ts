import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

// Interfaz para el perfil del programador
interface Programador {
  uid: string;
  displayName: string;
  photoURL: string;
  role: string;
  especialidad: string;
  tecnologias: string[];
}

@Component({
  selector: 'app-programadores',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './programadores.html',
  styleUrls: ['./programadores.scss'],
})
export class Programadores implements OnInit {
  
  listaCompletaProgramadores: Programador[] = []; // Vacío, el backend lo llenará
  programadoresFiltrados$: Observable<Programador[]>;

  campoBusqueda = new FormControl('');

  constructor() {
    this.programadoresFiltrados$ = this.campoBusqueda.valueChanges.pipe(
      startWith(''),
      map(termino => this.filtrarProgramadores(termino || ''))
    );
  }

  ngOnInit(): void {
    // La carga de datos simulados se elimina.
    // El backend deberá llamar a un servicio para llenar este array.
  }

  private filtrarProgramadores(termino: string): Programador[] {
    if (!termino) {
      return this.listaCompletaProgramadores;
    }
    const terminoLower = termino.toLowerCase();
    return this.listaCompletaProgramadores.filter(p => 
      p.displayName.toLowerCase().includes(terminoLower) ||
      p.especialidad.toLowerCase().includes(terminoLower) ||
      p.tecnologias.some(t => t.toLowerCase().includes(terminoLower))
    );
  }
}
