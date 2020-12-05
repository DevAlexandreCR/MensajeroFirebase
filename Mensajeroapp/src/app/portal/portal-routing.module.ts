import { NgModule } from '@angular/core';
import { Routes, RouterModule} from '@angular/router';
import { PortalComponent} from './portal.component';


const routes: Routes = [
  {path: '' , component: PortalComponent},
  {path: 'main', loadChildren: './main/main.module#MainModule'},
  {path: '**' , redirectTo: '/portal'},

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PortalRoutingModule {
}
