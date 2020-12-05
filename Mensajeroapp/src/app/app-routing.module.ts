import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router } from '@angular/router';
import { MainGuards} from './servicios/main.guard';
import { AppComponent} from './app.component';
import { HomeComponent } from './home/home.component';


const Approutes: Routes = [
  { path: '', component: AppComponent, canActivate: [MainGuards]},
  { path: 'home', loadChildren: './home/home.module#HomeModule', canActivate: [MainGuards]},
  { path: 'portal', loadChildren: './portal/portal.module#PortalModule', canActivateChild: [MainGuards]},
  { path: '**', redirectTo: './home'}

];

@NgModule({
  imports: [
    RouterModule.forRoot(Approutes),
    CommonModule
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
 }
