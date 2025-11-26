import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import path from 'path';
import { Inicio } from './publico/inicio/inicio';
import { Programadores } from './publico/programadores/programadores';
import { VerPerfil } from './publico/ver-perfil/ver-perfil';
import { Agendar } from './publico/agendar/agendar';
import { Login } from './auth/login/login';

export const routes: Routes = [
    {path: '', component: Inicio},
    {path: 'inicio', component: Inicio},
    {path: 'programadores', component: Programadores},
    {path: 'empleado', component: VerPerfil},
    {path: 'agendar', component: Agendar},
    {path: 'login', component: Login},
    {path: '**', redirectTo: ''}
];
