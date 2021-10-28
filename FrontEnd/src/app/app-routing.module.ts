import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'modeler', loadChildren: () => import('./modules/modeler/modeler.module').then(m => m.ModelerModule) }, 
  { path: 'pinturillo', loadChildren: () => import('./modules/pinturillo/pinturillo.module').then(m => m.PinturilloModule) }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
