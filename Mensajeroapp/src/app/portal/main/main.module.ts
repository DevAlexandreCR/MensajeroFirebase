import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from './main-routing.module';
import { LoginComponent} from './login/login.component';
import { RegistroComponent} from './registro/registro.component';
import { MainComponent} from './main.component';
import { FormsModule } from '@angular/forms';
import { CrudUsuarioService } from './servicios/crud-usuario.service';
import { CrudserviciosService } from './servicios/crudservicios.service';
import { CrudmensajeroService } from './servicios/crudmensajero.service';
import { AngularFireStorageModule} from '@angular/fire/storage';
import { DashboardModule } from './dashboard/dashboard.module';



@NgModule({
  declarations: [LoginComponent, RegistroComponent, MainComponent],
  imports: [
    CommonModule,
    FormsModule,
    AngularFireStorageModule,
    DashboardModule,
    MainRoutingModule
  ], providers: [ CrudUsuarioService, CrudserviciosService, CrudmensajeroService]
})
export class MainModule { }
