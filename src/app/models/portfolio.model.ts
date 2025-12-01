// src/app/models/portfolio.model.ts

export interface Project {
  id?: string; // Opcional: ID del documento en Firestore
  name: string;
  description: string;
  participationType: 'Frontend' | 'Backend' | 'Base de Datos' | 'Fullstack';
  technologies: string[]; // Array de strings, ej: ['Angular', 'Node.js', 'Firebase']
  repositoryLink?: string; // Opcional: Enlace al repositorio de código
  deploymentLink?: string; // Opcional: Enlace al despliegue (demo)
  section: 'Proyectos Académicos' | 'Proyectos Laborales'; // Para categorizar el proyecto
  userId: string; // Para vincular el proyecto a un programador específico
}

export interface PortfolioSection {
  name: 'Proyectos Académicos' | 'Proyectos Laborales';
  projects: Project[]; // Array de proyectos dentro de esta sección
}
