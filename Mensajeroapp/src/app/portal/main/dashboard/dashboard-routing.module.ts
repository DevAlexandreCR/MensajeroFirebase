import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { HistorialComponent } from './historial/historial.component';
import { InicioEmpresasComponent } from './inicio-empresas/inicio-empresas.component';
import { DashboardComponent } from './dashboard.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa.component';
import { VerEmpresaComponent } from './ver-empresa/ver-empresa.component';
import { ListEmpresasComponent } from './inicio/list-empresas/list-empresas.component';

const routes: Routes = [
  {path: '', component: DashboardComponent,
  children: [
    {path: 'ver-empresa/:id', component: VerEmpresaComponent},
    {path: 'historial', component: HistorialComponent},
    {path: 'inicio', component: InicioComponent},
    {path: 'perfil', component: PerfilComponent},
    {path: 'perfil-empresa', component: PerfilEmpresaComponent},
    {path: 'inicio-empresas', component: InicioEmpresasComponent},
    {path: 'list-empresas', component: ListEmpresasComponent}
  ]}
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
