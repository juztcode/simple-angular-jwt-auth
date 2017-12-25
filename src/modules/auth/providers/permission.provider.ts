import {Injectable} from '@angular/core';
import {AuthConfigProvider} from './auth-config.provider';
import {AuthConfig, AuthConfigAdditional} from '../';
import {HttpClient} from '@angular/common/http';
import {UserPermissions} from '../types/user-permissions.type';

@Injectable()
export class PermissionProvider {
  private authConfig: AuthConfig & AuthConfigAdditional;
  private permissionDataSet: UserPermissions[] = [];
  private permissions = {};

  constructor(private authConfigProvider: AuthConfigProvider, private http: HttpClient) {
    this.authConfig = this.authConfigProvider.getConfig();
  }

  public getPermissions(): any {
    if (this.authConfig.userPermissionsEnabled) {
      return this.permissions;
    }

    throw new Error('permissions not enabled');
  }

  public async setPermissionByUserRoleId(userRoleId: number) {
    if (this.authConfig.userPermissionsEnabled) {
      await this.loadUserPermissionDataSet();
      const userPermissions = this.permissionDataSet.filter(up => up.userRoleId === userRoleId)[0];
      Object.assign(this.permissions, userPermissions.permissions);
    } else {
      throw new Error('permissions not enabled');
    }
  }

  private async loadUserPermissionDataSet(): Promise<any> {
    if (this.authConfig.userPermissionsEnabled) {
      if (this.permissionDataSet && this.permissionDataSet.length > 0) {
        return;
      }

      let permissionDataSet = this.authConfig.permissionDataSet;
      if (!this.authConfig.permissionDataSet || this.authConfig.permissionDataSet.length === 0) {
        try {
          permissionDataSet = await this.http.get<UserPermissions[]>(this.authConfig.getPermissionUrl).toPromise();
        } catch (e) {
          throw new Error('permission data set loading failed');
        }
      }

      permissionDataSet.forEach(userPermission => this.permissionDataSet.push(userPermission));
    } else {
      throw new Error('permissions not enabled');
    }
  }

}
