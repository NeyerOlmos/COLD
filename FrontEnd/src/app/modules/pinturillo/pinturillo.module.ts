import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PinturilloRoutingModule } from './pinturillo-routing.module';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';
import { DrawComponent } from './draw/draw.component';
import { SocketWebService } from './socket-web.service';


@NgModule({
  declarations: [
    HomeComponent,
    RoomComponent,
    DrawComponent
  ],
  imports: [
    CommonModule,
    PinturilloRoutingModule
  ],
  exports:[
    
  ],providers:[SocketWebService]
})
export class PinturilloModule { }
