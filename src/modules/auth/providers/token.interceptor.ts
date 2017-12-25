import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {catchError} from 'rxjs/operators';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';

import {AuthProvider} from '../providers/auth.provider';
import {ApiError} from '../types/api-error.type';
import {AuthConfig} from '../types/auth-config.type';
import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {AuthConfigProvider} from './auth-config.provider';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authConfig: AuthConfig & AuthConfigAdditional;

  constructor(private authConfigProvider: AuthConfigProvider, private injector: Injector) {
    this.authConfig = this.authConfigProvider.getConfig();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authenticatedRequest = this.authenticate(request);
    return next.handle(authenticatedRequest).pipe(catchError(err => this.handleError(err, request, next)));
  }

  private handleError(error: HttpErrorResponse | any, request: HttpRequest<any>, next: HttpHandler) {
    const errorBody = <ApiError>error.error;

    if (this.authConfig.refreshTokenEnabled && error.status === this.authConfig.accessTokenExpiredResponseStatus &&
      errorBody.errorCode === this.authConfig.accessTokenExpiredErrorCode) {
      const authProvider = this.injector.get(AuthProvider);
      return Observable.fromPromise(authProvider.refresh()).mergeMap((status) => {
        const authenticatedRequest = this.authenticate(request);
        return next.handle(authenticatedRequest);
      });
    }

    return Observable.throw(new Error(`${errorBody.errorMessage} occurred. Error code is ${errorBody.errorCode}`));
  }

  private authenticate(request: HttpRequest<any>): HttpRequest<any> {
    const authProvider = this.injector.get(AuthProvider);
    let headers = new HttpHeaders();

    if (!(request.method === 'GET')) {
      headers = headers.set('Content-Type', 'application/json');
    }

    if (this.authConfig.refreshTokenEnabled && request.url === this.authConfig.refreshTokenUrl) {
      headers = headers.set(this.authConfig.refreshTokenHeaderName,
        `${this.authConfig.refreshTokenPrefix} ${authProvider.getRefreshToken()}`);
    } else if (!this.inExcludedUrls(request.url)) {
      headers = headers.set(this.authConfig.accessTokenHeaderName,
        `${this.authConfig.accessTokenPrefix} ${authProvider.getAccessToken()}`);
    }

    return request.clone({
      headers: headers
    });
  }

  private inExcludedUrls(url: string) {
    this.authConfig.tokenInterceptorExcludedUrls.forEach(excludedUrl => {
      if (excludedUrl === url) {
        return true;
      }
    });

    return false;
  }
}
