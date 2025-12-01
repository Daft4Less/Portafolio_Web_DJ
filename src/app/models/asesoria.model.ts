import { Timestamp } from '@angular/fire/firestore';

export interface Asesoria {
  id?: string; // ID del documento en Firestore
  solicitanteId: string; // UID del usuario que solicita
  solicitanteNombre: string; // Nombre del usuario que solicita
  programadorId: string; // UID del programador al que se le solicita
  
  fecha: Timestamp; // Fecha y hora de la asesoría solicitada
  comentario: string; // Motivo de la asesoría
  
  estado: 'pendiente' | 'aprobada' | 'rechazada'; // Estado de la solicitud
  respuestaProgramador?: string; // Mensaje del programador al aprobar/rechazar
}
