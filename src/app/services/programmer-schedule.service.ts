import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, updateDoc, deleteDoc, addDoc, CollectionReference, DocumentData, query, orderBy } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { ProgrammerSchedule } from '../models/programmer-schedule.model';

@Injectable({
  providedIn: 'root'
})
export class ProgrammerScheduleService {

  constructor(private firestore: Firestore) { }

  private getSchedulesCollection(programmerUid: string): CollectionReference<DocumentData> {
    return collection(this.firestore, `users/${programmerUid}/schedules`);
  }

  getProgrammerSchedules(programmerUid: string): Observable<ProgrammerSchedule[]> {
    const schedulesCollection = this.getSchedulesCollection(programmerUid);
    const q = query(schedulesCollection, orderBy('dayOfWeek'), orderBy('startTime')); // Order schedules
    return collectionData(q, { idField: 'id' }) as Observable<ProgrammerSchedule[]>;
  }

  addSchedule(programmerUid: string, schedule: Omit<ProgrammerSchedule, 'id'>): Promise<any> {
    const schedulesCollection = this.getSchedulesCollection(programmerUid);
    return addDoc(schedulesCollection, schedule);
  }

  updateSchedule(programmerUid: string, scheduleId: string, schedule: Partial<ProgrammerSchedule>): Promise<void> {
    const scheduleDocRef = doc(this.firestore, `users/${programmerUid}/schedules/${scheduleId}`);
    return updateDoc(scheduleDocRef, schedule);
  }

  deleteSchedule(programmerUid: string, scheduleId: string): Promise<void> {
    const scheduleDocRef = doc(this.firestore, `users/${programmerUid}/schedules/${scheduleId}`);
    return deleteDoc(scheduleDocRef);
  }
}
