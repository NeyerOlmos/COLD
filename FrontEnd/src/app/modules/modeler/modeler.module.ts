import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelerRoutingModule } from './modeler-routing.module';

import { DiagramComponent,GojsAngularModule,OverviewComponent,PaletteComponent } from 'node_modules/gojs-angular';
import { InspectorComponent } from './inspector/inspector.component';
import { InspectorRowComponent } from './inspector/inspector-row.component';
import { MaterialModule } from 'src/app/material.module';
import { TestDiagramComponent } from './test-diagram/test-diagram.component';
import { HomeComponent } from './home/home.component';
import { ContainerModelerComponent } from './container-modeler/container-modeler.component';
import { ComponentModelerComponent } from './component-modeler/component-modeler.component';

@NgModule({
  declarations: [
    ContainerModelerComponent,
    ComponentModelerComponent,
    InspectorComponent,
    InspectorRowComponent,
    TestDiagramComponent,
    HomeComponent,
   
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ModelerRoutingModule,
    GojsAngularModule,
  ]
})
export class ModelerModule { }
