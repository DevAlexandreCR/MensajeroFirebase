import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireAuthModule} from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire';
import { environment} from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { ToastrModule} from 'ngx-toastr';
import { MessagingService } from './servicios/messaging.service';
import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { CrudUsuarioService } from './portal/main/servicios/crud-usuario.service';
import { enableProdMode } from '@angular/core' ;
import * as bootstrap from "bootstrap"

enableProdMode ();

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(
      { positionClass: 'toast-top-center',
      preventDuplicates: true
    }),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFontAwesomeModule,
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    AppRoutingModule
  ],
  providers: [MessagingService, AngularFireDatabase, AngularFireMessaging, CrudUsuarioService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
