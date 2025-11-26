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

export const routes: Routes = [
    {path: '', component: Inicio},
    {path: 'inicio', component: Inicio},
    {path: 'programadores', component: Programadores},
    {path: 'empleado', component: VerPerfil},
    {path: 'agendar', component: Agendar},
    {path: 'login', component: Login},
    {path: 'programador/dashboard', component: Dashboard},
    {path: 'programador/proyectos',component: Proyectos},
    {path: 'programador/asesorias', component: Asesorias },
    {path: '**', redirectTo: ''}
];
