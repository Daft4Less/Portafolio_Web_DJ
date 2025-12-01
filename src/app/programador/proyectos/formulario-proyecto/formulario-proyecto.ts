import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProyectosService } from '../../../services/proyectos';
import { Proyecto } from '../tarjeta-proyecto/tarjeta-proyecto';

@Component({
  selector: 'app-formulario-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-proyecto.html',
  styleUrl: './formulario-proyecto.scss',
})
export class FormularioProyecto implements OnInit, OnChanges {
  
  @Input() proyecto?: Proyecto;
  @Output() proyectoAgregado = new EventEmitter<Proyecto>();
  proyectoForm: FormGroup;
  
  esModoEdicion: boolean = false;

  constructor(private fb: FormBuilder, private proyectosService: ProyectosService) {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['proyecto'] && this.proyecto) {
      this.esModoEdicion = true;
      this.proyectoForm.patchValue({
        ...this.proyecto,
        tecnologias: this.proyecto.tecnologias.join(', ')
      });
    } else {
      this.esModoEdicion = false;
      this.proyectoForm.reset();
    }
  }

  onSubmit(): void {
    if (this.proyectoForm.valid) {
      const formValue = this.proyectoForm.value;
      const proyectoAEnviar: Proyecto = {
        ...formValue,
        tecnologias: formValue.tecnologias.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech.length > 0)
      } as Proyecto;

      if (this.esModoEdicion && this.proyecto) {
        this.proyectosService.updateProyecto(this.proyecto.nombre, proyectoAEnviar).subscribe(
          (proyectoActualizado) => {
            console.log('Proyecto actualizado con éxito:', proyectoActualizado);
            this.proyectoForm.reset();
            this.proyectoAgregado.emit(proyectoActualizado);
          },
          (error) => {
            console.error('Error al actualizar el proyecto:', error);
          }
        );
      } else {
        this.proyectosService.addProyecto(proyectoAEnviar).subscribe(
          (proyectoAgregado) => {
            console.log('Proyecto agregado con éxito:', proyectoAgregado);
            this.proyectoForm.reset();
            this.proyectoAgregado.emit(proyectoAgregado);
          },
          (error) => {
            console.error('Error al agregar el proyecto:', error);
          }
        );
      }
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      this.proyectoForm.markAllAsTouched();
    }
  }
}
