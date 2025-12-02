import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Interfaces locales para simular los datos
interface ProgramadorPerfil {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  role: string;
  schedules: Horario[];
}

interface Horario {
  dayOfWeek: number; // 0 (Domingo) a 6 (Sábado)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './agendar.html',
  styleUrls: ['./agendar.scss'],
})
export class Agendar implements OnInit {
  programador: ProgramadorPerfil | null = null; // Se inicializa como null
  agendamientoForm: FormGroup;
  solicitudEnviada = false;
  
  // Para mapear el número del día a su nombre
  diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  constructor(private fb: FormBuilder) {
    this.agendamientoForm = this.fb.group({
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      comentario: ['', [Validators.required, Validators.maxLength(300)]],
    });
  }

  ngOnInit(): void {
    // La simulación de carga de datos del programador se elimina.
    // El backend deberá llamar a un servicio, probablemente usando el ID del programador
    // obtenido de la URL, para llenar esta propiedad.
  }

  onSubmit(): void {
    if (this.agendamientoForm.valid) {
      console.log('Backend debe implementar: Enviar solicitud de asesoría', {
        programadorId: this.programador?.uid,
        ...this.agendamientoForm.value
      });
      this.solicitudEnviada = true;
      this.agendamientoForm.reset();
    } else {
      this.agendamientoForm.markAllAsTouched();
      console.error('El formulario no es válido.');
    }
  }

  resetearFormulario(): void {
    this.solicitudEnviada = false;
  }
}
