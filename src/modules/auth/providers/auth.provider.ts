import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {AuthConfigProvider} from './auth-config.provider';
import {AuthConfig} from '../types/auth-config.type';
import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {Auth} from '../types/auth.type';
import {TokenDecoderHelper} from '../helpers/token-decoder.helper';
import {PermissionProvider} from './permission.provider';

@Injectable()
export class AuthProvider {
  private accessToken: string;
  private refreshToken: string;
  private authConfig: AuthConfig & AuthConfigAdditional;

  constructor(private authConfigProvider: AuthConfigProvider, private permissionProvider: PermissionProvider, private http: HttpClient) {
    this.authConfig = this.authConfigProvider.getConfig();
  }

  public async login(requestBody: any): Promise<boolean> {
    if (this.authConfig.loginUrl) {
      const auth = await this.http.post<Auth>(this.authConfig.loginUrl, JSON.stringify(requestBody)).toPromise();
      return await this.setAuth(auth);
    } else {
      throw new Error('login url not set');
    }
  }

  public async refresh(): Promise<boolean> {
    if (this.authConfig.refreshTokenEnabled && this.authConfig.refreshTokenUrl) {
      const auth = await this.http.get<Auth>(this.authConfig.refreshTokenUrl).toPromise();
      return await this.setAuth(auth);
    } else {
      throw new Error('refresh token not enabled or refresh token url not set');
    }
  }

  public async isLoggedIn(): Promise<boolean> {
    const auth: Auth = {accessToken: null, refreshToken: null};
    if (!this.accessToken && this.authConfig.persistTokensEnabled) {
      const accessTokenPromise = this.authConfig.tokenGetter(this.authConfig.accessTokenStorageKey);
      const refreshTokenPromise = this.authConfig.tokenGetter(this.authConfig.refreshTokenStorageKey);
      [auth.accessToken, auth.refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return await this.setAuth(auth);
  }

  public async logOut(): Promise<boolean> {
    return await this.clearAuth();
  }

  public async setAuth(auth: Auth, persist: boolean = true): Promise<boolean> {
    if (auth.accessToken === null || this.accessToken === '') {
      return false;
    }

    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;

    if (persist && this.authConfig.persistTokensEnabled) {
      const accessTokenPromise = this.authConfig.tokenSetter(this.authConfig.accessTokenStorageKey, auth.accessToken);
      const refreshTokenPromise = this.authConfig.tokenSetter(this.authConfig.refreshTokenStorageKey, auth.refreshToken);
      await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    if (this.authConfig.userPermissionsEnabled) {
      await this.permissionProvider.setPermissionByUserRoleId(this.getValueInToken(this.authConfig.userRoleIdKey));
    }

    return true;
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public getRefreshToken(): string {
    if (this.authConfig.refreshTokenEnabled) {
      return this.refreshToken;
    } else {
      throw new Error('refresh token not enabled');
    }
  }

  public getValueInToken<T>(key: string): T {
    return <T>(TokenDecoderHelper.DecodeToken(this.accessToken)[key]);
  }

  private async getAuth(): Promise<Auth> {
    if (!this.accessToken && this.authConfig.persistTokensEnabled) {
      const accessTokenPromise = this.authConfig.tokenGetter(this.authConfig.accessTokenStorageKey);
      const refreshTokenPromise = this.authConfig.tokenGetter(this.authConfig.refreshTokenStorageKey);
      [this.accessToken, this.refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return this.accessToken ? {accessToken: this.accessToken, refreshToken: this.refreshToken} : null;
  }

  private async clearAuth(): Promise<boolean> {
    this.accessToken = null;
    this.refreshToken = null;

    if (this.authConfig.persistTokensEnabled) {
      const accessTokenPromise = this.authConfig.tokenRemover(this.authConfig.accessTokenStorageKey);
      const refreshTokenPromise = this.authConfig.tokenRemover(this.authConfig.refreshTokenStorageKey);
      await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return true;
  }
}

