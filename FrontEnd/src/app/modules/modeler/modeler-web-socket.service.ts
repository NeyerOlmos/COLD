import { EventEmitter, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
//import { Socket } from 'ngx-socket-io';
import { io } from 'socket.io-client';
import { environment } from 'src/environments/environment';
// import {readFileSync} from 'fs';
//const socket = io();
const apiUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})

export class ModelerWebSocketService   {
  callback: EventEmitter<any> = new EventEmitter();
   socket = io("https://cold-api.herokuapp.com/",{
    transports:["websocket", "polling"],
    withCredentials: true,
    autoConnect:true,
    query: { nameRoom: this.cookieService.get('roomModeler') },
    //cert: readFileSync("./cert.pem")
  });
  constructor(private cookieService: CookieService) {
    
    this.socket =  io("https://cold-api.herokuapp.com/",{
      transports:["websocket", "polling"],
      withCredentials: true,
      autoConnect:true,
      query: { nameRoom: cookieService.get('roomModeler'),
     },
      //cert: readFileSync("./cert.pem")
    });
    this.socket.io.open();
    this.socket.on("connect", () => {
      console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
    });
    
    this.socket.on("connect_error", () => {
      // revert to classic upgrade
      this.socket.io.opts.transports = ["polling", "websocket"];
    });

    this.listenModeler();
    this.listenJsonModeler();
   }

   
   listenModeler = ()=>{
     this.socket.on('eventModeler', (res: any) => this.callback.emit(res))
   }
 
   emitEventModeler = (payload = {} )=>{
     this.socket.emit('eventModeler', payload);
   }
   
   listenJsonModeler = ()=>{
     this.socket.on('eventJsonModeler', (res: any) => this.callback.emit(res))
   }
 
   emitEventJsonModeler = (payload = {} )=>{
     this.socket.emit('eventJsonModeler', payload);
   }
   
}
