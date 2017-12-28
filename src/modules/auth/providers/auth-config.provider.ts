import {AuthConfig} from '../types/auth-config.type';
import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {DEFAULT_ADDITIONAL_AUTH_CONFIG} from '../constants/default.constants';

export class AuthConfigProvider {
  private config: AuthConfigAdditional & AuthConfig;

  constructor(config: AuthConfig, additionalConfig: AuthConfigAdditional) {
    this.setConfig(config, additionalConfig);
  }

  public getConfig(): AuthConfig & AuthConfigAdditional {
    return this.config;
  }

  private setConfig(mainConfig: AuthConfig, additionalConfig: AuthConfigAdditional) {
    if (mainConfig.refreshTokenUrl === null) {
      mainConfig.refreshTokenEnabled = false;
      console.error('refreshTokenUrl is not present. setting refreshTokenEnabled to false');
    }

    if (!(mainConfig.tokenGetter && mainConfig.tokenSetter && mainConfig.tokenRemover)) {
      mainConfig.persistTokensEnabled = false;
      console.error('tokenGetter, tokenSetter or tokenRemover functions not present setting persistTokens to false');
    }

    if (!((mainConfig.permissionDataSet && mainConfig.permissionDataSet.length > 0) || mainConfig.getPermissionUrl)) {
      mainConfig.userPermissionsEnabled = false;
      console.error('permissions data set not present or getPermissionUrl not present setting userPermissionsEnabled to false');
    }

    const config: any = {};
    Object.assign(config, mainConfig);
    Object.assign(config, DEFAULT_ADDITIONAL_AUTH_CONFIG);
    Object.assign(config, additionalConfig);
    config.tokenInterceptorExcludedUrls.push(config.loginUrl);

    this.config = config;
  }
}
