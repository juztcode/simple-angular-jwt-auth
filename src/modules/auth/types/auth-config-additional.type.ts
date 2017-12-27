import {UserPermissions} from './user-permissions.type';
import {Auth} from './auth.type';

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
  convertToAuthType?: (data: any) => Auth;
  convertToUserPermissionType?: (data: any) => UserPermissions;
}
