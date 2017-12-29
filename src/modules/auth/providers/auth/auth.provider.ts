import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {AuthConfigProvider} from '../auth-config/auth-config.provider';
import {AuthConfig} from '../../types/auth-config.type';
import {AuthConfigAdditional} from '../../types/auth-config-additional.type';
import {Auth} from '../../types/auth.type';
import {TokenDecoderHelper} from '../../helpers/token-decoder.helper';
import {PermissionProvider} from '../permission/permission.provider';

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
      const auth = await this.sendLoginRequest(requestBody);
      return await this.setAuth(auth);
    } else {
      throw new Error('login url not set');
    }
  }

  public async refresh(): Promise<boolean> {
    if (this.authConfig.refreshTokenEnabled && this.authConfig.refreshTokenUrl) {
      const auth = await this.sendRefreshTokenRequest();
      return await this.setAuth(auth);
    } else {
      throw new Error('refresh token not enabled or refresh token url not set');
    }
  }

  public async isLoggedIn(): Promise<boolean> {
    if (!this.accessToken && this.authConfig.persistTokensEnabled) {
      const auth: Auth = {accessToken: null, refreshToken: null};
      const accessTokenPromise = this.authConfig.tokenGetter(this.authConfig.accessTokenStorageKey);
      const refreshTokenPromise = this.authConfig.tokenGetter(this.authConfig.refreshTokenStorageKey);
      [auth.accessToken, auth.refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
      return await this.setAuth(auth, false);
    } else {
      return true;
    }
  }

  public async logOut(): Promise<boolean> {
    return await this.clearAuth();
  }

  public async setAuth(auth: Auth, persist: boolean = true): Promise<boolean> {
    const condition = auth !== null && auth.accessToken !== null && typeof auth.accessToken === 'string' && auth.accessToken.length > 0;

    if (condition) {
      try {
        await Promise.all([this.setAccessToken(auth.accessToken, persist), this.setRefreshToken(auth.refreshToken, persist)]);

        if (this.authConfig.userPermissionsEnabled) {
          await this.permissionProvider.setPermissionByUserRoleId(this.getValueInToken(this.authConfig.userRoleIdKey));
        }
      } catch (e) {
        await this.logOut();
        throw e;
      }
    }

    return condition;
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

  private async setAccessToken(token: string, persist: boolean = true): Promise<boolean> {
    const condition = token !== null && typeof token === 'string' && token.length > 0;

    if (condition) {
      this.accessToken = token;
      if (persist && this.authConfig.persistTokensEnabled) {
        await this.authConfig.tokenSetter(this.authConfig.accessTokenStorageKey, token);
      }
    }

    return condition;
  }

  private async setRefreshToken(token: string, persist: boolean = true): Promise<boolean> {
    const condition = this.authConfig.refreshTokenEnabled && token !== null && typeof token === 'string' && token.length > 0;

    if (condition) {
      this.refreshToken = token;
      if (persist && this.authConfig.persistTokensEnabled) {
        await this.authConfig.tokenSetter(this.authConfig.refreshTokenStorageKey, token);
      }
    }

    return condition;
  }

  public getValueInToken<T>(key: string): T {
    if (this.accessToken) {
      return <T>(TokenDecoderHelper.DecodeToken(this.accessToken)[key]);
    } else {
      return null;
    }
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

  private async sendLoginRequest(requestBody: any): Promise<Auth> {
    const data = await this.http.post<any>(this.authConfig.loginUrl, JSON.stringify(requestBody)).toPromise();
    return this.authConfig.convertToAuthType(data);
  }

  private async sendRefreshTokenRequest(): Promise<Auth> {
    const data = await this.http.get<any>(this.authConfig.refreshTokenUrl).toPromise();
    return this.authConfig.convertToAuthType(data);
  }
}

