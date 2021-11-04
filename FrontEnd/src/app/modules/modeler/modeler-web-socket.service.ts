import { EventEmitter, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Socket } from 'ngx-socket-io';

@Injectable({
  providedIn: 'root'
})
export class ModelerWebSocketService  extends Socket {

  callback: EventEmitter<any> = new EventEmitter();

  constructor(private cookieService: CookieService) {
    super({
      url: 'http://localhost:5000',
      options: {
          query: {
            nameRoom: cookieService.get('roomModeler')
          }
      }
    });

    this.listenModeler();
   }

   
  listenModeler = ()=>{
    this.ioSocket.on('eventModeler', (res: any) => this.callback.emit(res))
  }

  emitEventModeler = (payload = {} )=>{
    this.ioSocket.emit('eventModeler', payload);
  }

}
