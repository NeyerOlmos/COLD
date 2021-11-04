import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  room: string = '';
  constructor(private router: ActivatedRoute, private cookieService:CookieService) { }

  ngOnInit(): void {
    this.room = this.router.snapshot.paramMap.get('room') as string;

    //console.log(this.room)
    this.cookieService.set('room', this.room);
  }

}
