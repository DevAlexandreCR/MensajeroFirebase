import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { LegalComponent } from './legal/legal.component';
import { MisionVisionComponent } from './mision-vision/mision-vision.component';
import { ComoFuncionaComponent } from './como-funciona/como-funciona.component';
import { InicioComponent } from './inicio/inicio.component';
import { MensajerobikeComponent } from './mensajerobike/mensajerobike.component';
import { MensajerogoComponent } from './mensajerogo/mensajerogo.component';
import { HomeComponent } from './home.component';
import { ReferidosGoComponent } from './referidos-go/referidos-go.component';

const routes: Routes = [
  { path: '', component: HomeComponent,  data: { animation: 'home' },
  children: [
    { path: 'privacidad', component: PrivacidadComponent,  data: { animation: 'privacidad' }},
    { path: 'terminos-y-condiciones', component: LegalComponent , data: { animation: 'terminos-y-condiciones'}},
    { path: 'mensajerobike', component: MensajerobikeComponent, data: { animation: 'mensajerobike' }},
    { path: 'mensajerogo', component: MensajerogoComponent, data: { animation: 'mensajerogo' }},
    { path: 'mision', component: MisionVisionComponent, data: { animation: 'mision' }},
    { path: 'referidos-go', component: ReferidosGoComponent, data: { animation: 'referidos-go' }},
    { path: 'conoce-mensajero', component: ComoFuncionaComponent, data: { animation: 'conoce-mensajero' }},
    { path: '', component: InicioComponent, pathMatch: 'full', data: { animation: ''}},
    { path: '**', redirectTo: '/', pathMatch: 'full', },
    { path: 'portal', loadChildren: '../portal/portal.module#PortalModule'}
  ]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
