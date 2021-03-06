import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {catchError} from 'rxjs/operators';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/observable/throw';

import {AuthProvider} from '../auth/auth.provider';
import {AuthConfig} from '../../types/auth-config.type';
import {AuthConfigAdditional} from '../../types/auth-config-additional.type';
import {AuthConfigProvider} from '../auth-config/auth-config.provider';
import {ArrayUtilsHelper} from '../../helpers/array-utils.helper';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private authConfig: AuthConfig & AuthConfigAdditional;

  constructor(private authConfigProvider: AuthConfigProvider, private injector: Injector) {
    this.authConfig = this.authConfigProvider.getConfig();
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authenticatedRequest = this.appendHeaders(request);
    return next.handle(authenticatedRequest).pipe(catchError(err => this.handleError(err, request, next)));
  }

  private handleError(error: HttpErrorResponse | any, request: HttpRequest<any>, next: HttpHandler) {
    const errorBody = this.authConfig.convertToApiErrorType(error.error);

    const authProvider = this.injector.get(AuthProvider);

    if (error.status === this.authConfig.accessTokenExpiredResponseStatus &&
      errorBody.errorCode === this.authConfig.accessTokenExpiredErrorCode) {

      if (this.authConfig.refreshTokenEnabled) {
        return Observable.fromPromise(authProvider.refresh()).mergeMap(() => {
          const authenticatedRequest = this.appendHeaders(request);
          return next.handle(authenticatedRequest);
        });
      } else {
        authProvider.logOut();
      }
    } else if (error.status === this.authConfig.refreshTokenExpiredResponseStatus &&
      errorBody.errorCode === this.authConfig.refreshTokenExpiredErrorCode) {
      authProvider.logOut();
    }

    return Observable.throw(new Error(`${errorBody.errorMessage} error occurred. error code is ${errorBody.errorCode}`));
  }

  private appendHeaders(request: HttpRequest<any>): HttpRequest<any> {
    const authProvider = this.injector.get(AuthProvider);
    let headers = new HttpHeaders();

    this.authConfig.globalHttpHeaders.forEach(headerData => {
      if (!ArrayUtilsHelper.IsInArray<string>(headerData.excludedMethods, request.method)) {
        headers = headers.set(headerData.key, headerData.value);
      }
    });

    if (this.authConfig.refreshTokenEnabled && request.url === this.authConfig.refreshTokenUrl) {
      headers = headers.set(this.authConfig.refreshTokenHeaderName,
        `${this.authConfig.refreshTokenPrefix} ${authProvider.getRefreshToken()}`);
    } else if (!ArrayUtilsHelper.IsInArray<string>(this.authConfig.tokenInterceptorExcludedUrls, request.url)) {
      headers = headers.set(this.authConfig.accessTokenHeaderName,
        `${this.authConfig.accessTokenPrefix} ${authProvider.getAccessToken()}`);
    }

    return request.clone({
      headers: headers
    });
  }
}
