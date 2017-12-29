import {AuthConfigAdditional} from '../types/auth-config-additional.type';
import {ApiError, Auth, UserPermissions} from '../';

export const DEFAULT_ADDITIONAL_AUTH_CONFIG: AuthConfigAdditional = {
  accessTokenExpiredResponseStatus: 403,
  accessTokenExpiredErrorCode: 4001,
  refreshTokenExpiredResponseStatus: 403,
  refreshTokenExpiredErrorCode: 4002,
  accessTokenHeaderName: 'Authorization',
  accessTokenPrefix: 'Bearer',
  refreshTokenHeaderName: 'Authorization',
  refreshTokenPrefix: 'Basic',
  tokenInterceptorExcludedUrls: [],
  accessTokenStorageKey: 'access-token',
  refreshTokenStorageKey: 'refresh-token',
  userIdKey: 'userId',
  userRoleIdKey: 'userRoleId',
  convertToAuthType: (auth: Auth) => auth,
  convertToUserPermissionType: (userPermissions: UserPermissions) => userPermissions,
  convertToApiErrorType: (apiError: ApiError) => apiError
};
