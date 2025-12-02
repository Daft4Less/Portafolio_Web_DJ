import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/portfolio.model'; // Corregir la ruta de importación

@Component({
  selector: 'app-formulario-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-proyecto.html',
  styleUrls: ['./formulario-proyecto.scss'],
})
export class FormularioProyecto implements OnInit, OnChanges {
  
  @Input() proyecto?: Project; // Recibe el proyecto a editar
  @Output() proyectoGuardado = new EventEmitter<Project>(); // Emitirá el proyecto nuevo o editado
  @Output() cancelar = new EventEmitter<void>(); // Emitirá para cerrar el formulario

  proyectoForm: FormGroup;
  esModoEdicion: boolean = false;

  constructor(private fb: FormBuilder) {
    this.proyectoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Corregido a 'name'
      description: ['', [Validators.required, Validators.maxLength(500)]], // Corregido a 'description'
      technologies: ['', Validators.required],
      repositoryLink: ['', Validators.required], // Corregido a 'repositoryLink'
      deploymentLink: [''], // Corregido a 'deploymentLink'
      section: ['Proyectos Académicos', Validators.required], // Añadir 'section' y valor por defecto
      participationType: ['Frontend', Validators.required], // Añadir 'participationType' y valor por defecto
      userId: [''], // Añadir 'userId'
      imagenUrl: [''],
    });
  }

  ngOnInit(): void {
    // La inicialización ya está en el constructor
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proyecto'] && this.proyecto) {
      this.esModoEdicion = true;
      this.proyectoForm.patchValue({
        ...this.proyecto,
        technologies: this.proyecto.technologies.join(', ') // Convertir array a string para el input
      });
    } else {
      this.esModoEdicion = false;
      this.proyectoForm.reset();
      this.proyectoForm.patchValue({ // Resetear valores por defecto
        section: 'Proyectos Académicos',
        participationType: 'Frontend'
      });
    }
  }

  onSubmit(): void {
    if (this.proyectoForm.valid) {
      const formValue = this.proyectoForm.value;
      const proyectoParaEmitir: Project = {
        id: this.esModoEdicion && this.proyecto ? this.proyecto.id : '',
        name: formValue.name,
        description: formValue.description,
        technologies: formValue.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech),
        repositoryLink: formValue.repositoryLink,
        deploymentLink: formValue.deploymentLink,
        section: formValue.section,
        participationType: formValue.participationType,
        userId: formValue.userId || 'tempUserId', // Asignar un userId temporal si no existe
      };
      
      this.proyectoGuardado.emit(proyectoParaEmitir);
      this.proyectoForm.reset();
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      this.proyectoForm.markAllAsTouched();
    }
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
