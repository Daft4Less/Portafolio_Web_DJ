import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs'; // Added Observable and from
import { map } from 'rxjs/operators'; // Added map operator
import { ProgrammerSchedule } from '../models/programmer-schedule.model';


//Gestion de horario de disponibilidad de programadores
@Injectable({
  providedIn: 'root'
})
export class ProgrammerScheduleService {

  constructor(
    private firestore: Firestore, 
    private injector: Injector 
  ) { }


  // REFERENCIA() a los programadores en FS (metodo auxiliar)
  private getUserDocRef(programmerUid: string) {
    return doc(this.firestore, `users/${programmerUid}`);
  }


  // ADDHORARIO() a un programador 
  async addSchedule(programmerUid: string, schedule: Omit<ProgrammerSchedule, 'id'>): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); 
    if (!userDoc.exists()) {
      throw new Error('User document not found!');
    }

    const userData = userDoc.data();
    // Obtiene los horarios existentes o un array vacío si no hay ninguno
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    const newSchedule: ProgrammerSchedule = {
      ...schedule,
      id: new Date().getTime().toString() // Genera un ID único basado en el tiempo
    };

    const updatedSchedules = [...schedules, newSchedule]; // Añade el nuevo horario al array
    
    await updateDoc(userDocRef, { schedules: updatedSchedules }); // Actualiza el documento del usuario en FS
  }

  
  // ACTUALIZA() un horario ya existente de un programador 
  async updateSchedule(programmerUid: string, scheduleId: string, schedule: Partial<ProgrammerSchedule>): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    // Envuelve getDoc para manejar el contexto de inyección
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); 
    if (!userDoc.exists()) {
      throw new Error('User document not found!'); 
    }

    const userData = userDoc.data();
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    // Mapea y actualiza el horario correspondiente
    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        return { ...s, ...schedule, id: s.id }; // Fusiona los cambios manteniendo el ID original
      }
      return s;
    });

    await updateDoc(userDocRef, { schedules: updatedSchedules }); // Actualiza el documento del usuario en FS
  }


  // ELIMINAR() un horario 
  async deleteSchedule(programmerUid: string, scheduleId: string): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); 
    if (!userDoc.exists()) {
      throw new Error('User document not found!'); 
    }

    const userData = userDoc.data();
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    // Filtra el array de horarios para eliminar la entrada con el ID coincidente
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);

    await updateDoc(userDocRef, { schedules: updatedSchedules }); // Actualiza el documento del usuario en FS
  }

  //OBTENER() horarios de disponibilidad de un programador 
  getSchedules(programmerUid: string): Observable<ProgrammerSchedule[]> {
    const userDocRef = this.getUserDocRef(programmerUid);
    return runInInjectionContext(this.injector, () =>
      from(getDoc(userDocRef)).pipe(
        map((docSnap: DocumentSnapshot<DocumentData>) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Retorna los horarios del usuario, o un array vacío si no existen
            return (userData['schedules'] || []) as ProgrammerSchedule[];
          }
          return []; 
        })
      )
    );
  }

}
