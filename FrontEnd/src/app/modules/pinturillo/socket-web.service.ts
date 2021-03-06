import { Injectable, EventEmitter } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Socket } from 'ngx-socket-io';
import { environment } from 'src/environments/environment.prod';
const apiUrl = environment.apiUrl;
@Injectable({
  providedIn: 'root'
})
export class SocketWebService extends Socket {

  callback: EventEmitter<any> = new EventEmitter();

  constructor(private cookieService:CookieService) {
    super({
      url: apiUrl,
      options: {
          query: {
            nameRoom: cookieService.get('room')
          }
      }
    });

    this.listen();
  }

  listen = ()=>{
    this.ioSocket.on('event', (res: any) => this.callback.emit(res))
  }

  emitEvent = (payload = {} )=>{
    this.ioSocket.emit('event', payload);
  }
  
}
