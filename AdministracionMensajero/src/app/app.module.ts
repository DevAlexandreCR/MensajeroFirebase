import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AngularFireModule, FirebaseApp } from '@angular/fire';
import { AppComponent } from './app.component';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AutenticacionService } from './servicios/autenticacion.service';
import { DataTableModule } from 'angular-6-datatable';
import { AgmCoreModule } from '@agm/core';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { ToastrModule } from 'ngx-toastr';
import { PruebasComponent } from './componentes/pruebas/pruebas.component';
import { WhatsappComponent } from './componentes/whatsapp/whatsapp.component';



export const firebaseConfig = {
apiKey: 'AIzaSyDfDCWsVDxuPjZJzR11x9V_RknoI9r0CPM', /*AIzaSyDfDCWsVDxuPjZJzR11x9V_RknoI9r0CPM*/
authDomain: 'mensajero-7802b.firebaseapp.com',
databaseURL: 'https://mensajero-7802b.firebaseio.com',
storageBucket: 'mensajero-7802b.appspot.com',
messagingSenderId: '161864388438',
appId: '1:161864388438:web:75a5e38289c635e6'
};

@NgModule({
 declarations: [AppComponent, PruebasComponent, WhatsappComponent],
 bootstrap: [AppComponent],
 providers: [AutenticacionService],
 imports: [
  NgbModule,
  BsDatepickerModule.forRoot(),
  BrowserModule,
  BrowserAnimationsModule,
  FormsModule,
  AngularFireModule.initializeApp(firebaseConfig),
  AngularFireDatabaseModule,
  AngularFireAuthModule,
  AngularFireStorageModule,
  NgbModule.forRoot(),
  ToastrModule.forRoot(),
  AgmCoreModule.forRoot({
   apiKey: 'AIzaSyAmwue6YtIzszOtSQgPbmuUdzyoXPOoWLQ'
  }),
  DataTableModule
  ],
})
export class AppModule { }
