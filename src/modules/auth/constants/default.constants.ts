import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {ApiError, Auth, UserPermissions} from '../';

export const DEFAULT_ADDITIONAL_AUTH_CONFIG: AuthConfigAdditional = {
  accessTokenHeaderName: 'Authorization',
  accessTokenPrefix: 'Bearer',
  refreshTokenHeaderName: 'Authorization',
  refreshTokenPrefix: 'Basic',
  tokenInterceptorExcludedUrls: [],
  accessTokenStorageKey: 'access-token',
  refreshTokenStorageKey: 'refresh-token',
  userRoleIdKey: 'userRoleId',
  tokenGetter: async (tokenName: string) => localStorage.getItem(tokenName),
  tokenSetter: async (tokenName: string, token: any) => localStorage.setItem(tokenName, token),
  tokenRemover: async (tokenName: string) => localStorage.removeItem(tokenName),
  convertToAuthType: (auth: Auth) => auth,
  convertToUserPermissionType: (userPermissions: UserPermissions) => userPermissions,
  convertToApiErrorType: (apiError: ApiError) => apiError
};
