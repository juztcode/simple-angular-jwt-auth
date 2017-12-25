import {UserPermissions} from './user-permissions.type';

export interface AuthConfig {
  persistTokensEnabled: boolean;
  refreshTokenEnabled: boolean;
  userPermissionsEnabled: boolean;
  loginUrl: string;
  refreshTokenUrl?: string;
  getPermissionUrl?: string;
  permissionDataSet?: UserPermissions[];
  tokenGetter: (tokenName: string) => Promise<string>;
  tokenSetter: (tokenName: string, token: string) => Promise<any>;
  tokenRemover: (tokenName: string) => Promise<any>;
}
