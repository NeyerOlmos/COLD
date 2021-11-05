import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComponentModelerComponent } from './component-modeler/component-modeler.component';
import { ContainerModelerComponent } from './container-modeler/container-modeler.component';
import { HomeComponent } from './home/home.component';
import { TestDiagramComponent } from './test-diagram/test-diagram.component';

const routes: Routes = [
  { path: 'container/:room', component: ContainerModelerComponent },
  { path: 'component/:room', component: ComponentModelerComponent },
  { path: '', component: HomeComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModelerRoutingModule { }
