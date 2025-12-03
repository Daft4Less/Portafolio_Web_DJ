import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, DocumentData, DocumentSnapshot } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs'; // Added Observable and from
import { map } from 'rxjs/operators'; // Added map operator
import { ProgrammerSchedule } from '../models/programmer-schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ProgrammerScheduleService {

  constructor(private firestore: Firestore, private injector: Injector) { } // Inject Injector

  private getUserDocRef(programmerUid: string) {
    return doc(this.firestore, `users/${programmerUid}`);
  }

  async addSchedule(programmerUid: string, schedule: Omit<ProgrammerSchedule, 'id'>): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); // Wrap getDoc
    if (!userDoc.exists()) {
      throw new Error('User document not found!');
    }

    const userData = userDoc.data();
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    const newSchedule: ProgrammerSchedule = {
      ...schedule,
      id: new Date().getTime().toString() // Simple unique ID
    };

    const updatedSchedules = [...schedules, newSchedule];
    
    await updateDoc(userDocRef, { schedules: updatedSchedules });
  }

  async updateSchedule(programmerUid: string, scheduleId: string, schedule: Partial<ProgrammerSchedule>): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); // Wrap getDoc
    if (!userDoc.exists()) {
      throw new Error('User document not found!');
    }

    const userData = userDoc.data();
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    const updatedSchedules = schedules.map(s => {
      if (s.id === scheduleId) {
        return { ...s, ...schedule, id: s.id }; // Ensure ID is not overwritten
      }
      return s;
    });

    await updateDoc(userDocRef, { schedules: updatedSchedules });
  }

  async deleteSchedule(programmerUid: string, scheduleId: string): Promise<void> {
    const userDocRef = this.getUserDocRef(programmerUid);
    const userDoc = await runInInjectionContext(this.injector, () => getDoc(userDocRef)); // Wrap getDoc
    if (!userDoc.exists()) {
      throw new Error('User document not found!');
    }

    const userData = userDoc.data();
    const schedules = (userData['schedules'] || []) as ProgrammerSchedule[];

    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);

    await updateDoc(userDocRef, { schedules: updatedSchedules });
  }

  getSchedules(programmerUid: string): Observable<ProgrammerSchedule[]> {
    const userDocRef = this.getUserDocRef(programmerUid);
    return runInInjectionContext(this.injector, () => // Wrap getDoc in runInInjectionContext
      from(getDoc(userDocRef)).pipe(
        map((docSnap: DocumentSnapshot<DocumentData>) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            return (userData['schedules'] || []) as ProgrammerSchedule[];
          }
          return [];
        })
      )
    );
  }

}
