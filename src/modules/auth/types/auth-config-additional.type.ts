import {UserPermissions} from './user-permissions.type';
import {Auth} from './auth.type';
import {ApiError} from './api-error.type';

export interface AuthConfigAdditional {
  accessTokenHeaderName?: string;
  accessTokenPrefix?: string;
  accessTokenStorageKey?: string;
  refreshTokenHeaderName?: string;
  refreshTokenPrefix?: string;
  refreshTokenStorageKey?: string;
  userRoleIdKey?: string;
  tokenInterceptorExcludedUrls?: string[];
  tokenGetter?: (tokenName: string) => Promise<string>;
  tokenSetter?: (tokenName: string, token: string) => Promise<any>;
  tokenRemover?: (tokenName: string) => Promise<any>;
  convertToAuthType?: (data: any) => Auth;
  convertToUserPermissionType?: (data: any) => UserPermissions;
  convertToApiErrorType?: (error: any) => ApiError;
}
