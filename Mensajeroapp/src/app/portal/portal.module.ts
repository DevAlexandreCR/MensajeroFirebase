import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortalRoutingModule } from './portal-routing.module';
import { PortalComponent } from './portal.component';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { MainModule } from './main/main.module';
import { AngularFireFunctionsModule } from '@angular/fire/functions';

@NgModule({
  declarations: [
    PortalComponent
  ],
  imports: [
    CommonModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    PortalRoutingModule,
    AngularFireFunctionsModule,
    MainModule
  ],
  providers: []
})
export class PortalModule { }
