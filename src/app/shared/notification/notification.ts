import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification';

//Muestra notificaciones transitorias al usuario
@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrls: ['./notification.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {
  public message: string = ''; // El mensaje a mostrar en la notificación
  public type: string = 'info'; // El tipo de notificación (info, success, error)
  public isVisible: boolean = false; // Controla la visibilidad de la notificación en la UI
  private notificationSubscription: Subscription | undefined; // Suscripción al servicio de notificaciones


  constructor(
    private notificationService: NotificationService // Servicio para emitir y gestionar notificaciones
  ) { }

  // Se suscribe al Observable de notificaciones del servicio para mostrar mensajes.
  ngOnInit(): void {
    this.notificationSubscription = this.notificationService.notification$.subscribe(notification => {
      this.message = notification.message; // Actualiza el mensaje de la notificación
      this.type = notification.type; // Actualiza el tipo de notificación (info, success, error)
      this.isVisible = true; // Hace visible la notificación

      // Establece un temporizador para ocultar la notificación automáticamente
      setTimeout(() => {
        this.isVisible = false;
      }, 5000); // La notificación desaparecerá después de 5 segundos
    });
  }

  //Se utiliza para desuscribir el Observable de notificaciones
  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }
}
