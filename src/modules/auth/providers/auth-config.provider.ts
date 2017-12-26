import {AuthConfig} from '../types/auth-config.type';
import {AuthConfigAdditional} from '../types/auth-config-additional.type';

export class AuthConfigProvider {
  private config: AuthConfigAdditional & AuthConfig;

  constructor(config: AuthConfig & AuthConfigAdditional) {
    this.setConfig(config);
  }

  public getConfig(): AuthConfig & AuthConfigAdditional {
    return this.config;
  }

  private setConfig(config: AuthConfig & AuthConfigAdditional) {
    if (config.refreshTokenUrl === null) {
      config.refreshTokenEnabled = false;
      console.error('refreshTokenUrl is not present. setting refreshTokenEnabled to false');
    }

    if (!(config.tokenGetter && config.tokenSetter && config.tokenRemover)) {
      config.persistTokensEnabled = false;
      console.error('tokenGetter, tokenSetter or tokenRemover functions not present setting persistTokens to false');
    }

    if (!((config.permissionDataSet && config.permissionDataSet.length > 0) || config.getPermissionUrl)) {
      config.userPermissionsEnabled = false;
      console.error('permissions data set not present or getPermissionUrl not present setting userPermissionsEnabled to false');
    }

    config.tokenInterceptorExcludedUrls.push(config.loginUrl);

    this.config = config;
  }
}
