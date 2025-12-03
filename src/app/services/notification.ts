import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<{ message: string, type: 'success' | 'error' | 'info' }>();
  public notification$ = this.notificationSubject.asObservable();

  constructor() { }

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.notificationSubject.next({ message, type });
  }
}
