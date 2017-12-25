export interface AuthConfigAdditional {
  accessTokenExpiredResponseStatus?: number;
  accessTokenExpiredErrorCode?: number;
  refreshTokenExpiredResponseStatus?: number;
  refreshTokenExpiredErrorCode?: number;
  accessTokenHeaderName?: string;
  accessTokenPrefix?: string;
  refreshTokenHeaderName?: string;
  refreshTokenPrefix?: string;
  tokenInterceptorExcludedUrls?: string[];
}
