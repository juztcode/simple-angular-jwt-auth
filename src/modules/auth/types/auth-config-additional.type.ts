export interface AuthConfigAdditional {
  accessTokenExpiredResponseStatus?: number;
  accessTokenExpiredErrorCode?: number;
  refreshTokenExpiredResponseStatus?: number;
  refreshTokenExpiredErrorCode?: number;
  accessTokenHeaderName?: string;
  accessTokenPrefix?: string;
  accessTokenStorageKey?: string;
  refreshTokenHeaderName?: string;
  refreshTokenPrefix?: string;
  refreshTokenStorageKey?: string;
  tokenInterceptorExcludedUrls?: string[];
  userIdKey?: string;
  userRoleIdKey?: string;
}
