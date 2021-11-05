import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  email: string = "";
  password: string = "";
  constructor(private router:Router) { }

  ngOnInit(): void {
  }
  login() {
    this.router.navigate(['dashboard']);
    console.log(this.email);
    console.log(this.password);
  }
}
