import {Injectable} from '@angular/core';
import {AuthConfigProvider} from '../auth-config/auth-config.provider';
import {AuthConfig, AuthConfigAdditional} from '../../';
import {HttpClient} from '@angular/common/http';
import {UserPermissions} from '../../types/user-permissions.type';

@Injectable()
export class PermissionProvider {
  private authConfig: AuthConfig & AuthConfigAdditional;
  private permissionDataSet: UserPermissions[];
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
      if (this.permissionDataSet && this.permissionDataSet.length === 0) {
        throw new Error('permissions not loaded');
      }

      const result = this.permissionDataSet.filter(up => up.userRoleId === userRoleId);
      if (result.length === 0) {
        throw new Error('unknown user role');
      }
      Object.assign(this.permissions, result[0].permissions);
    } else {
      throw new Error('permissions not enabled');
    }
  }

  private async loadUserPermissionDataSet(): Promise<any> {
    if (this.authConfig.userPermissionsEnabled) {
      if (this.permissionDataSet && this.permissionDataSet.length > 0) {
        return;
      } else if (this.authConfig.permissionDataSet && this.authConfig.permissionDataSet.length > 0) {
        this.permissionDataSet = this.authConfig.permissionDataSet;
        return;
      } else {
        try {
          this.permissionDataSet = await this.sendGetPermissionsRequest();
        } catch (e) {
          throw new Error('permission data set loading failed');
        }
      }

      if (!this.permissionDataSet || this.permissionDataSet.length === 0) {
        throw new Error('null permission data set loaded');
      }
    } else {
      throw new Error('permissions not enabled');
    }
  }

  private async sendGetPermissionsRequest(): Promise<UserPermissions[]> {
    const dataSet = await this.http.get<any[]>(this.authConfig.getPermissionUrl).toPromise();
    const permissionDataSet: UserPermissions[] = [];
    dataSet.forEach(data => permissionDataSet.push(this.authConfig.convertToUserPermissionType(data)));
    return permissionDataSet;
  }

}
