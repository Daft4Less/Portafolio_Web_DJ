import { Component, OnInit, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Project } from '../../../models/portfolio.model'; // Corregir la ruta de importación

//Componente de formulario reutilizable para añadir o editar los detalles de un proyecto.

@Component({
  selector: 'app-formulario-proyecto',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-proyecto.html',
  styleUrls: ['./formulario-proyecto.scss'],
})
export class FormularioProyecto implements OnInit, OnChanges {
  
  @Input() proyecto?: Project; // Propiedad de entrada: el proyecto a editar (opcional). Si se provee, el formulario se inicializa en modo edición.
  @Output() proyectoGuardado = new EventEmitter<Project>(); // Evento de salida: emite el proyecto cuando se guarda (nuevo o editado).
  @Output() cancelar = new EventEmitter<void>(); // Evento de salida: emite cuando el usuario cancela el formulario.

  proyectoForm: FormGroup; // Instancia del formulario reactivo para el proyecto.
  esModoEdicion: boolean = false; // Bandera para indicar si el formulario está en modo edición.


  constructor(private fb: FormBuilder) { // Servicio para construir formularios reactivos
    // Inicialización del formulario de proyecto con sus controles y reglas de validación.
    this.proyectoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Nombre del proyecto, requerido y con longitud mínima.
      description: ['', [Validators.required, Validators.maxLength(500)]], // Descripción, requerido y con longitud máxima.
      technologies: ['', Validators.required], // Tecnologías usadas, requerido (se espera un string separado por comas).
      repositoryLink: [''], // Enlace al repositorio de código (opcional).
      deploymentLink: [''], // Enlace al despliegue del proyecto (opcional).
      section: ['Proyectos Académicos', Validators.required], // Sección a la que pertenece el proyecto, requerido (con valor por defecto).
      participationType: ['Frontend', Validators.required], // Tipo de participación, requerido (con valor por defecto).
      userId: [''], // ID del usuario (programador) al que pertenece el proyecto.
      imagenUrl: [''], // URL de la imagen principal del proyecto.
    });
  }

  ngOnInit(): void {
    // La inicialización principal del formulario se realiza en el constructor,
    // y los cambios de entrada se gestionan en ngOnChanges.
  }

  // Inicializar el formulario en modo edición o adición cuando la propiedad `proyecto` cambia.
  ngOnChanges(changes: SimpleChanges): void {
    // Detecta si la propiedad 'proyecto' ha cambiado y si se ha proporcionado un proyecto
    if (changes['proyecto'] && this.proyecto) {
      this.esModoEdicion = true; // Establece el modo edición
      // Rellena el formulario con los datos del proyecto existente
      this.proyectoForm.patchValue({
        ...this.proyecto,
        technologies: this.proyecto.technologies.join(', ') // Convierte el array de tecnologías a un string separado por comas
      });
    } else {
      // Si no hay proyecto o se deselecciona, reinicia el formulario a modo adición
      this.esModoEdicion = false;
      this.proyectoForm.reset(); // Resetea todos los campos del formulario
      // Establece los valores por defecto para los campos de selección
      this.proyectoForm.patchValue({
        section: 'Proyectos Académicos',
        participationType: 'Frontend'
      });
    }
  }

  //Maneja el envío del formulario.
  onSubmit(): void {
    if (this.proyectoForm.valid) {
      const formValue = this.proyectoForm.value;
      // Construye el objeto Project a partir de los valores del formulario
      const proyectoParaEmitir: Project = {
        // Si está en modo edición y hay un proyecto, usa su ID; de lo contrario, deja un ID temporal o vacío
        id: this.esModoEdicion && this.proyecto ? this.proyecto.id : '',
        name: formValue.name,
        description: formValue.description,
        // Convierte el string de tecnologías a un array, limpiando espacios y eliminando entradas vacías
        technologies: formValue.technologies.split(',').map((tech: string) => tech.trim()).filter((tech: string) => tech),
        repositoryLink: formValue.repositoryLink,
        deploymentLink: formValue.deploymentLink,
        section: formValue.section,
        participationType: formValue.participationType,
        userId: formValue.userId || 'tempUserId', // Asigna un userId temporal si no existe, debería ser asignado por el componente padre
      };
      
      this.proyectoGuardado.emit(proyectoParaEmitir); // Emite el proyecto guardado
      this.proyectoForm.reset(); // Resetea el formulario después de la emisión
    } else {
      console.log('Formulario inválido. Por favor, revisa los campos.');
      this.proyectoForm.markAllAsTouched(); // Marca todos los campos como tocados para mostrar mensajes de validación
    }
  }

  //Maneja la acción de cancelar el formulario
  onCancelar(): void {
    this.cancelar.emit(); 
  }
}
