import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { ColdNavComponent } from './cold-nav/cold-nav.component';
import { ColdDashboardComponent } from './cold-dashboard/cold-dashboard.component';
import { CookieService } from 'ngx-cookie-service';
import { PinturilloModule } from './modules/pinturillo/pinturillo.module';

@NgModule({
  declarations: [
    AppComponent,
    ColdNavComponent,
    ColdDashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    PinturilloModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
