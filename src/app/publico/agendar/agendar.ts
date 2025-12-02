import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { ProgramadoresService } from '../../services/programadores.service';
import { AsesoriasService } from '../../services/asesorias.service';
import { UserProfile } from '../../services/autenticacion.service';
import { ProgrammerSchedule } from '../../models/programmer-schedule.model';

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar.html',
  styleUrls: ['./agendar.scss'],
})
export class Agendar implements OnInit, OnDestroy {
  programador: UserProfile | null = null;
  agendamientoForm: FormGroup;
  solicitudEnviada = false;
  errorEnvio = '';

  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  private unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private programadoresService: ProgramadoresService,
    private asesoriasService: AsesoriasService
  ) {
    this.agendamientoForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      comentario: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      takeUntil(this.unsubscribe$),
      switchMap(params => {
        const programadorId = params.get('id');
        if (programadorId) {
          return this.programadoresService.getProgramadorProfile(programadorId);
        }
        return [null];
      })
    ).subscribe((perfil: UserProfile | null) => {
      this.programador = perfil;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async onSubmit(): Promise<void> {
    if (this.agendamientoForm.invalid || !this.programador) {
      this.agendamientoForm.markAllAsTouched();
      this.errorEnvio = 'El formulario no es válido o no se ha cargado el programador.';
      console.error(this.errorEnvio);
      return;
    }

    this.errorEnvio = '';
    const solicitud = {
      programadorId: this.programador.uid,
      ...this.agendamientoForm.value
    };

    try {
      await this.asesoriasService.addSolicitudAsesoria(solicitud);
      this.solicitudEnviada = true;
      this.agendamientoForm.reset();
    } catch (error) {
      console.error('Error al enviar la solicitud de asesoría:', error);
      this.errorEnvio = 'Hubo un error al enviar la solicitud. Por favor, inténtalo más tarde.';
    }
  }

  resetearFormulario(): void {
    this.solicitudEnviada = false;
    this.errorEnvio = '';
  }
}
