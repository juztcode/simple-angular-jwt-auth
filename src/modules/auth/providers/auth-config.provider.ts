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
    if (config.loginUrl === null) {
      config.refreshTokenEnabled = false;
    }

    if (config.refreshTokenUrl === null) {
      config.refreshTokenEnabled = false;
    }

    if (!(config.tokenGetter && config.tokenSetter && config.tokenRemover)) {
      config.persistTokensEnabled = false;
    }

    if (!((config.permissionDataSet && config.permissionDataSet.length > 0) || config.getPermissionUrl)) {
      config.userPermissionsEnabled = false;
    }

    config.tokenInterceptorExcludedUrls.push(config.loginUrl);

    this.config = config;
  }
}
