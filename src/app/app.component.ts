import {Component} from '@angular/core';
import {AuthProvider} from '../modules/auth';

@Component({
  selector: 'app-root',
  template: '<h1>Test Auth-Package</h1>'
})
export class AppComponent {
  constructor(private authProvider: AuthProvider) {
    this.authProvider.login('randil@balcoo.com', '222222');
  }
}
