import {InjectionToken, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {TokenInterceptor} from './providers/token/token.interceptor';
import {AuthConfigProvider} from './providers/auth-config/auth-config.provider';
import {AuthProvider} from './providers/auth/auth.provider';
import {PermissionProvider} from './providers/permission/permission.provider';

export const AUTH_CONFIG = new InjectionToken('auth config');
export const AUTH_ADDITIONAL_CONFIG = new InjectionToken('auth additional config');

export function getConfig(mainConfig, additionalConfig): AuthConfigProvider {
  return new AuthConfigProvider(mainConfig, additionalConfig);
}

@NgModule(
  {
    providers: [
      AuthProvider,
      PermissionProvider,
      {
        provide: AuthConfigProvider,
        useFactory: getConfig,
        deps: [AUTH_CONFIG, AUTH_ADDITIONAL_CONFIG]
      },
      {
        provide: HTTP_INTERCEPTORS,
        useClass: TokenInterceptor,
        multi: true
      }
    ]
  }
)
export class AuthModule {
}
