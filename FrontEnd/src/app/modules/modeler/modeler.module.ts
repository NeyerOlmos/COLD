import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModelerRoutingModule } from './modeler-routing.module';
import { ModelerComponent } from './modeler.component';

import { DiagramComponent,GojsAngularModule,OverviewComponent,PaletteComponent } from 'node_modules/gojs-angular';
import { InspectorComponent } from './inspector/inspector.component';
import { InspectorRowComponent } from './inspector/inspector-row.component';
import { MaterialModule } from 'src/app/material.module';

@NgModule({
  declarations: [
    ModelerComponent,
    InspectorComponent,
    InspectorRowComponent,
   
  ],
  imports: [
    CommonModule,
    MaterialModule,
    ModelerRoutingModule,
    GojsAngularModule,
  ]
})
export class ModelerModule { }
