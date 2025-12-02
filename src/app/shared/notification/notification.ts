import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  public message: string = '';
  public type: string = 'info';
  public isVisible: boolean = false;
  private notificationSubscription: Subscription | undefined;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$.subscribe(notification => {
      this.message = notification.message;
      this.type = notification.type;
      this.isVisible = true;

      setTimeout(() => {
        this.isVisible = false;
      }, 5000); // La notificación desaparecerá después de 5 segundos
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
