import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import path from 'path';
import { Inicio } from './publico/inicio/inicio';
import { Programadores } from './publico/programadores/programadores';
import { VerPerfil } from './publico/ver-perfil/ver-perfil';
import { Agendar } from './publico/agendar/agendar';
import { Login } from './auth/login/login';
import { Dashboard } from './programador/dashboard/dashboard';
import { Proyectos } from './programador/proyectos/proyectos';
import { Asesorias } from './programador/asesorias/asesorias';
import { AdmProgramadores } from './admin/adm-programadores/adm-programadores';
import { AdmUsuarios } from './admin/adm-usuarios/adm-usuarios';
import { AdmAsesorias } from './admin/adm-asesorias/adm-asesorias';
import { AdmDashboard } from './admin/adm-dashboard/adm-dashboard';

export const routes: Routes = [
    {path: '', component: Login},
    {path: 'inicio', component: Inicio},
    {path: 'programadores', component: Programadores},
    {path: 'empleado', component: VerPerfil},
    {path: 'agendar', component: Agendar},
    {path: 'login', component: Login},
    {path: 'programador/dashboard', component: Dashboard},
    {path:  'admin/dashboard', component: AdmDashboard},
    {path: 'programador/proyectos',component: Proyectos},
    {path: 'programador/asesorias', component: Asesorias },
    { path: 'admin/adm-programadores', component: AdmProgramadores },
    { path: 'admin/adm-usuarios', component: AdmUsuarios },
    { path: 'admin/adm-asesorias', component: AdmAsesorias },
    {path: '**', redirectTo: ''}
];
