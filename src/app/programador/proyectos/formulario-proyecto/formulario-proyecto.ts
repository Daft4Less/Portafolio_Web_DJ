import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formulario-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-proyecto.html',
  styleUrl: './formulario-proyecto.scss',
})
export class FormularioProyecto implements OnInit {
  
  proyectoForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.proyectoForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.proyectoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(5)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      tecnologias: ['', Validators.required],
      linkGitHub: ['', Validators.required],
      linkDemo: [''],
      imagenUrl: [''],
    });
  }

  onSubmit(): void {
    if (this.proyectoForm.valid) {
      console.log('Formulario válido:', this.proyectoForm.value);
      
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      this.proyectoForm.markAllAsTouched();
    }
  }
}
