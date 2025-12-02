import { Routes } from '@angular/router';
import { Inicio } from './publico/inicio/inicio';
import { Programadores } from './publico/programadores/programadores';
import { VerPerfil } from './publico/ver-perfil/ver-perfil';
import { Agendar } from './publico/agendar/agendar';
import { Login } from './auth/login/login';
import { Dashboard } from './programador/dashboard/dashboard'; // Keep import for potential direct navigation
import { Proyectos } from './programador/proyectos/proyectos';
import { Asesorias } from './programador/asesorias/asesorias';
import { AdmProgramadores } from './admin/adm-programadores/adm-programadores';
import { AdmUsuarios } from './admin/adm-usuarios/adm-usuarios';
import { AdmAsesorias } from './admin/adm-asesorias/adm-asesorias';
import { AdmDashboard } from './admin/adm-dashboard/adm-dashboard'; // Keep import for potential direct navigation

// Guards
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ProgramadorGuard } from './guards/programador.guard';
import { NoAuthGuard } from './guards/no-auth.guard';


export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirect root to login
    { path: 'inicio', component: Inicio },
    { path: 'programadores', component: Programadores },
    { path: 'ver-perfil/:id', component: VerPerfil },
    { path: 'agendar', component: Agendar, canActivate: [AuthGuard] },
    { path: 'login', component: Login, canMatch: [NoAuthGuard] },

    // Programador Routes
    {
        path: 'programador',
        canActivate: [ProgramadorGuard],
        children: [
            { path: '', redirectTo: 'proyectos', pathMatch: 'full' }, // Default for /programador
            { path: 'proyectos', component: Proyectos },
            { path: 'asesorias', component: Asesorias },
            { path: 'dashboard', component: Dashboard } // Keep dashboard accessible if explicitly navigated
        ]
    },

    // Admin Routes
    {
        path: 'admin',
        canActivate: [AdminGuard],
        children: [
            { path: '', redirectTo: 'adm-programadores', pathMatch: 'full' }, // Default for /admin
            { path: 'adm-programadores', component: AdmProgramadores },
            { path: 'adm-usuarios', component: AdmUsuarios },
            { path: 'adm-asesorias', component: AdmAsesorias },
            { path: 'dashboard', component: AdmDashboard } // Keep dashboard accessible if explicitly navigated
        ]
    },
    { path: '**', redirectTo: '/login' } // Redirect any other unknown path to login
];
