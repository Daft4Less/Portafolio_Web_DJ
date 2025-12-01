import { Timestamp } from '@angular/fire/firestore';

export interface Asesoria {
  id?: string; 
  solicitanteId: string; 
  solicitanteNombre: string; 
  programadorId: string; 
  
  fecha: Timestamp; 
  comentario: string; 
  estado: 'pendiente' | 'aprobada' | 'rechazada'; 
  respuestaProgramador?: string; 
}
