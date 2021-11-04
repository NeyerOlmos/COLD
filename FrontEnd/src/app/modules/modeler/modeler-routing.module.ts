import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModelerComponent } from './modeler.component';
import { TestDiagramComponent } from './test-diagram/test-diagram.component';

const routes: Routes = [
  { path: ':room', component: ModelerComponent },
  { path: '', component: TestDiagramComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelerRoutingModule { }
