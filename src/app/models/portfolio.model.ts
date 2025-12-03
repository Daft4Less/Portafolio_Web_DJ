

export interface Project {
  id?: string; 
  name: string;
  description: string;
  participationType: 'Frontend' | 'Backend' | 'Base de Datos' | 'Fullstack';
  technologies: string[]; 
  repositoryLink?: string; 
  deploymentLink?: string; 
  section: 'Proyectos Académicos' | 'Proyectos Laborales'; 
  userId: string; 
}

export interface PortfolioSection {
  name: 'Proyectos Académicos' | 'Proyectos Laborales';
  projects: Project[]; 
}
