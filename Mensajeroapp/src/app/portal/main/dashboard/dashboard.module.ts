import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { InicioComponent } from './inicio/inicio.component';
import { HistorialComponent } from './historial/historial.component';
import { InicioEmpresasComponent } from './inicio-empresas/inicio-empresas.component';
import { PerfilComponent } from './perfil/perfil.component';
import { PerfilEmpresaComponent } from './perfil-empresa/perfil-empresa.component';
import { VerEmpresaComponent } from './ver-empresa/ver-empresa.component';
import { DashboardComponent } from './dashboard.component';
import { NgbModule} from '@ng-bootstrap/ng-bootstrap'
import { AmazingTimePickerModule } from 'amazing-time-picker';
import { ListEmpresasComponent } from './inicio/list-empresas/list-empresas.component';


@NgModule({
  declarations: [ InicioComponent, HistorialComponent, DashboardComponent, InicioEmpresasComponent, PerfilComponent, PerfilEmpresaComponent,
     VerEmpresaComponent,
     ListEmpresasComponent],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    DashboardRoutingModule,
    AmazingTimePickerModule
  ]
})
export class DashboardModule { }
