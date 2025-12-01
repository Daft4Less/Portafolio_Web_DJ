import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Importar RouterLink

@Component({
  selector: 'app-adm-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './adm-dashboard.html',
  styleUrl: './adm-dashboard.scss',
})
export class AdmDashboard {

}
