import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import path from 'path';
import { Inicio } from './pages/inicio/inicio';

export const routes: Routes = [
    {path: '', component: Inicio},
    {path: 'inicio', component: Inicio},
    {path: '**', redirectTo: ''}
];
