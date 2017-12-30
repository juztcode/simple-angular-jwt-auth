import {UserPermissions} from './user-permissions.type';

export interface AuthConfig {
  persistTokensEnabled: boolean;
  refreshTokenEnabled: boolean;
  userPermissionsEnabled: boolean;
  loginUrl: string;
  refreshTokenUrl?: string;
  getPermissionUrl?: string;
  permissionDataSet?: UserPermissions[];
  accessTokenExpiredResponseStatus: number;
  accessTokenExpiredErrorCode: number;
  refreshTokenExpiredResponseStatus?: number;
  refreshTokenExpiredErrorCode?: number;
}
