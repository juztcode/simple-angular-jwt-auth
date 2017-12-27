[![Build Status](https://travis-ci.org/randilfernando/jwt-auth.svg?branch=master)](https://travis-ci.org/randilfernando/jwt-auth)
[![npm Version](https://img.shields.io/npm/v/simple-angular-jwt-auth.svg)](https://www.npmjs.com/package/simple-angular-jwt-auth)
[![npm License](https://img.shields.io/npm/l/simple-angular-jwt-auth.svg)](https://opensource.org/licenses/MIT)

Simple-angular-jwt-auth is a library that can be used to implement authentication workflow of your angular 5+ application.
This library uses HttpClient to send http requests.

## Add library to your project

```bash
npm install simple-angular-jwt-auth --save
```
> Note: This will install package and save the dependency in your package.json file.

## Initialize library in your application

To use the library in your application you need to import the AuthModule in your AppModule and provide configuration.

```typescript
@NgModule({
  imports: [
    AuthModule.forRoot(authConfig)
  ]
})
export class AppModule {}
```

Main AuthModule mainly built on the configuration you provided.

## Configuration

When importing the AuthModule you can provide two configurations. AuthConfig and AuthOptionalConfig. 
AuthConfig is a mandatory while AuthOptionalConfig is a optional and has a default value.

### AuthConfig (Main configuration)

```typescript
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
```

1. persistTokensEnabled - If true the tokens are saved in the storage and tokenGetter, tokenSetter and tokenRemover functions also need to provide.
If those any of those functions are not provided the persistTokensEnabled will be false and hence the tokens are not saved in the storage.
1. refreshTokenEnabled - Enable [refresh token](https://auth0.com/learn/refresh-tokens/) workflow. If the access token is expired then it 
try to get new token pair using refresh token and then retry the request again.
1. userPermissionEnabled - Enable userRole based user permissions. To use this you need to have the userRoleId inside the token and you can
configure the attribute name (see: AuthOptionalConfig). The user permissions are stored in the PermissionProvider and can be mapped inside any
component. When the login is success the new permissions are set usign the userRoleId inside the token.
1. loginUrl - Url used in login and the request must receive a Auth response and then the accessToken and refreshToken are saved.
```typescript
export interface Auth {
  accessToken: string;
  refreshToken: string;
}
```
1. refreshTokenUrl (optional) - Use to get new token pair using refresh token. Auth response should be send with new token pair.

There are two ways to set permissions.

1. getPermissionUrl (optional) - This use a url to get permissions. (see: UserPermission type)
2. permissionDataSet (optional) - Use predefined permissions. (see: UserPermission type)
```typescript
export interface UserPermissions {
  userRoleId: number;
  permissions: any;
}
``` 

If the persistTokens is enabled you need to pass tokenGetter, tokenSetter and tokenRemover functions.
The return type of the function should be a Promise.

eg: tokenGetter function

```typescript
async (tokenName: string) => {
  return localStorage.getItem(tokenName);
}
```

> Note: If you not pass tokenGetter, tokenSetter or tokenRemover functions then the persistTokens will be false.

## AuthConfigAdditional (additional configurations)

Those are the additional configurations default values are used and you can override them.

```typescript
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
  convertToUserPermissionType: (userPermissions: UserPermissions) => userPermissions
};
```

1. accessTokenExpiredResponseStatus - Response status when access token expired. (used to retry the response)
1. accessTokenExpiredErrorCode - You need to send error code inside the access token expired response. (used to retry the response)

>Note: Token interceptor will check error response for above conditions and retry the response.

1. accessTokenHeaderName - Header name use when appending access token in each request.
1. accessTokenPrefix - Prefix used when appending token (eg: Bearer {access-token})
1. refreshTokenHeaderName - Header name use when appending refresh token in refresh request (see: refreshTokenUrl in AuthConfig).
1. refreshTokenPrefix - Prefix used when appending token (eg: Basic {refresh-token})
1. tokenInterceptorExcludedUrls - These urls are excluded when appending the access token. (eg: Login url)

>Note: Login url is automatically added to the excluded list

1. accessTokenStorageKey = key used when storing the access-token in key value pair.
1. refreshTokenStorageKey = key used when storing the refresh-token in key value pair.
1. userIdKey - attribute name related to the userId inside the access-token payload.
1. userRoleIdKey - attribute name related to the userRoleId inside the access-token payload.

>Note: To use permissions feature you need to have userRoleId inside the token. The user role id must be a one present in the permission data set.

sample permission data set
```json
[
  {
    "userRoleId": 1,
    "permissions": {"canAccess": true, "homePage": "Dashboard"}
  },
  {
    "userRoleId": 2,
    "permissions": {"canAccess": false, "homePage": "Profile"}
  }
]
```

sample token payload
```json
{
  "userId": 100,
  "userRoleId": 1
}
```

You configure the auth response type and permission response type.
This library uses the generator functions to convert response to the relevant type.

1. convertToAuthType - This function used to convert the response to the Auth type

>Note: If not supplied the default function is used

```typescript
(data: Auth) => {
  return data;
}
```

If the auth type sent from the server is different you can pass a generator function to get the Auth type
If the auth type from server
```json
{
  "bearer": "access-token", 
  "basic": "refresh-token"
}
```

Then the generator function
```typescript
(data: any) => {
  const auth: Auth = {accessToken: authFromServer.bearer, refreshToken: authFromServer.basic};
  return auth;
}
```

1. convertToUserPermissionType - This function used to convert the response to the UserPermission type

>Note: If not supplied the default function is used

```typescript
(data: UserPermissions) => {
  return data;
}
```

If the user permission type sent from the server is different you can pass a generator function to get the UserPermissions type.
The library will iterate through the data set sent from the server and apply the generator function to get the UserPermissions type.
If the permission type from server
```json
[
  {
    "role": 1,
    "permission": [true, true, false]
  },
  {
    "role": 2,
    "permissions": [true, false, false]
  }
]
```

Then the generator function
```typescript
(data: any) => {
  const userPermissions: UserPermissions = {
    userRoleId: data.role,
    permissions: {
      canViewHome: data.permissions[0],
      canViewSettings: data.permissions[1],
      canViewInfo: data.permissions[2]
    }
  }
}
```

## Use library features in your application

After initializing the library you can use Providers to access features

### AuthProvider

Provide authentication functionality

#### login(requestBody: any): Promise<boolean>

This will send the login and save the auth inside the application and persist it. 
If the permissions are enabled this will also set the permission using the userRoleId.

@parameter {any} requestBody - set as the request body of the login request
```typescript
let requestBody = {username: 'test', password: '1234'}
```

@return {Promise<boolean>} - If the login is success send true else false.

#### setAuth(auth; Auth): Promise<boolean>

This function can be used to save Auth retrieved by any other request. (eg: user role change request)

@parameter {Auth} auth - auth retrieved
```typescript
let auth = {accessToken: 'access-token', refreshToken: 'refresh-token'}
```

@return {Promise<boolean>} - If the auth save is success return true else false.

#### logOut(): Promise<boolean>

Can use to logout from the application.
This will remove the auth from memory and also from storage.

#### isLoggedIn(): Promise<boolean>

Can use this function to check if the user is logged in.
If the token is present in the storage this will save the token inside the provider.

#### getAccessToken(): string

Return the accessToken (instance variable in the AuthProvider)

>Note: This will only accessible after a successful 'login' or after a successful 'isLoggedIn;

#### getRefreshToken: string

Return the refreshToken (instance variable in the AuthProvider)

>Note: This will only accessible after a successful 'login' or after a successful 'isLoggedIn;

#### getValueInToken<T>(key: string): T

@parameter {string} key - key of the attribute that need to retrieve (eg: 'userId')
@parameter T - type the return need to be casted to

### PermissionProvider

Can use this provider to access the permission functionality

#### setPermissionByUserRoleId(userRoleId: number): void

This will update the permission inside the PermissionProvider and affect all the places permissions are in use.
After the login the permissions are set.
You can use this to save permissions at any other place (eg: convert user role)

@parameter {number} userRoleId - id of the user role

>Note: This user role id should be a one in the permission data set

#### getPermissions(): any

This will return the permissions object inside PermissionsProvider and you can use it to define the user access.

## Help

Repository: [github.com/randilfernando/jwt-auth](github.com/randilfernando/jwt-auth)
Issues: [https://github.com/randilfernando/jwt-auth/issues](https://github.com/randilfernando/jwt-auth/issues)
