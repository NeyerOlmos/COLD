import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ColdDashboardComponent } from './cold-dashboard/cold-dashboard.component';
import { HomeComponent } from './modules/modeler/home/home.component';

const routes: Routes = [
  { path: 'modeler', loadChildren: () => import('./modules/modeler/modeler.module').then(m => m.ModelerModule) }, 
  { path: 'dashboard', component: ColdDashboardComponent }, 
  { path: '', component: HomeComponent }, 
  { path: 'pinturillo', loadChildren: () => import('./modules/pinturillo/pinturillo.module').then(m => m.PinturilloModule) }, 

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
