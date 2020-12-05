import { NgModule } from '@angular/core';
import { HomeRoutingModule } from './home-routing.module';
import { PrivacidadComponent } from './privacidad/privacidad.component';
import { LegalComponent } from './legal/legal.component';
import { MisionVisionComponent } from './mision-vision/mision-vision.component';
import { ComoFuncionaComponent } from './como-funciona/como-funciona.component';
import { InicioComponent } from './inicio/inicio.component';
import { MensajerobikeComponent } from './mensajerobike/mensajerobike.component';
import { MensajerogoComponent } from './mensajerogo/mensajerogo.component';
import { HomeComponent } from './home.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { CommonModule } from '@angular/common';
import { ReferidosGoComponent } from './referidos-go/referidos-go.component';

@NgModule({
  declarations: [
    MensajerobikeComponent, PrivacidadComponent, LegalComponent, MisionVisionComponent,
    ComoFuncionaComponent, InicioComponent, MensajerogoComponent, HomeComponent, ReferidosGoComponent
  ],
  imports: [
    AngularFontAwesomeModule,
    CommonModule,
    HomeRoutingModule
  ]
})
export class HomeModule { }
