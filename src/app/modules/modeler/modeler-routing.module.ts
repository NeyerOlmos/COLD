import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './modeler.component';

const routes: Routes = [{ path: '', component: ModelerComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelerRoutingModule { }
