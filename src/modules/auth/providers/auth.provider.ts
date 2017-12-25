import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {AuthConfigProvider} from './auth-config.provider';
import {AuthConfig} from '../types/auth-config.type';
import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {Auth} from '../types/auth.type';
import {TokenDecoderHelper} from '../helpers/token-decoder.helper';

@Injectable()
export class AuthProvider {
  private accessToken: string;
  private refreshToken: string;
  private authConfig: AuthConfig & AuthConfigAdditional;

  constructor(private authConfigProvider: AuthConfigProvider, private http: HttpClient) {
    this.authConfig = this.authConfigProvider.getConfig();
  }

  public async login(username: string, password: string): Promise<boolean> {
    const body = {username: username, password: password};
    const auth = await this.http.post<Auth>(this.authConfig.loginUrl, JSON.stringify(body)).toPromise();
    return await this.setAuth(auth);
  }

  public async refresh(): Promise<boolean> {
    if (this.authConfig.refreshTokenEnabled) {
      const auth = await this.http.get<Auth>(this.authConfig.refreshTokenUrl).toPromise();
      return await this.setAuth(auth);
    }

    return false;
  }

  public async isLoggedIn(): Promise<boolean> {
    return !!(await this.getAuth());
  }

  public async logOut(): Promise<boolean> {
    return await this.clearAuth();
  }

  public getAccessToken(): string {
    return this.accessToken;
  }

  public getRefreshToken(): string {
    return this.refreshToken;
  }

  public getValueInToken<T>(key: string): T {
    return <T>(TokenDecoderHelper.DecodeToken(this.accessToken)[key]);
  }

  private async getAuth(): Promise<Auth> {
    if (!this.accessToken && this.authConfig.persistTokens) {
      const accessTokenPromise = this.authConfig.tokenGetter('access-token');
      const refreshTokenPromise = this.authConfig.tokenGetter('refresh-token');
      [this.accessToken, this.refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return this.accessToken ? {accessToken: this.accessToken, refreshToken: this.refreshToken} : null;
  }

  private async setAuth(auth: Auth): Promise<boolean> {
    if (auth.accessToken === null || this.accessToken === '') {
      return false;
    }

    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;

    if (this.authConfig.persistTokens) {
      const accessTokenPromise = this.authConfig.tokenSetter('access-token', auth.accessToken);
      const refreshTokenPromise = this.authConfig.tokenSetter('refresh-token', auth.refreshToken);
      await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return true;
  }

  private async clearAuth(): Promise<boolean> {
    this.accessToken = null;
    this.refreshToken = null;

    if (this.authConfig.persistTokens) {
      const accessTokenPromise = this.authConfig.tokenRemover('access-token');
      const refreshTokenPromise = this.authConfig.tokenRemover('refresh-token');
      await Promise.all([accessTokenPromise, refreshTokenPromise]);
    }

    return true;
  }
}

