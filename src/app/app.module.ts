import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {AuthModule} from '../modules/auth';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule.forRoot({
      accessTokenEnabled: true,
      refreshTokenEnabled: true,
      persistTokens: true,
      loginUrl: 'http://localhost:8080/auth/login',
      refreshTokenUrl: 'http://localhost:8080/auth/refresh',
      tokenGetter: async (tokenName: string) => await localStorage.getItem(tokenName),
      tokenSetter: async (tokenName: string, token: any) => await localStorage.setItem(tokenName, token),
      tokenRemover: async (tokenName: string) => await localStorage.removeItem(tokenName)
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
