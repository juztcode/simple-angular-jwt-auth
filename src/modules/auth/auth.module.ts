import {ModuleWithProviders, NgModule} from '@angular/core';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {TokenInterceptor} from './providers/token.interceptor';
import {DEFAULT_ADDITIONAL_AUTH_CONFIG} from './constants/default.constants';
import {AuthConfigProvider} from './providers/auth-config.provider';
import {AuthConfig} from './types/auth-config.type';
import {AuthConfigAdditional} from './types/auth-config-additional.type';
import {AuthProvider} from './providers/auth.provider';

@NgModule()
export class AuthModule {
  static forRoot(mainConfig: AuthConfig, additionalConfig?: AuthConfigAdditional): ModuleWithProviders {
    const config: any = DEFAULT_ADDITIONAL_AUTH_CONFIG;
    Object.assign(config, mainConfig, additionalConfig);

    return {
      ngModule: AuthModule,
      providers: [
        AuthProvider,
        {
          provide: AuthConfigProvider,
          useValue: new AuthConfigProvider(config)
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    };
  }
}
