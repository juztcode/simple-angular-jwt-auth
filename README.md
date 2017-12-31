[![Build Status](https://www.travis-ci.org/randilfernando/simple-angular-jwt-auth.svg?branch=master)](https://travis-ci.org/randilfernando/simple-angular-jwt-auth)
[![npm Version](https://img.shields.io/npm/v/simple-angular-jwt-auth.svg)](https://www.npmjs.com/package/simple-angular-jwt-auth)
[![npm License](https://img.shields.io/npm/l/simple-angular-jwt-auth.svg)](https://opensource.org/licenses/MIT)

Simple-angular-jwt-auth is a library that can be used to implement authentication workflow of your angular 5+ application.
This library uses HttpClient to send http requests.

*For the changes introduced in this release please refer the changes section*

Click [here](https://embed.plnkr.co/qstWVYDhzfY4L4YF5Pxp?p=preview) to find a working demo.

## Available Functionality

- Basic authentication (Login, logout, check status)
- Http interceptor to append tokens
- Add additional http headers
- Can extend the authentication flow (via setAuth function)
- Decode and get token value (This will decode the token and return the requested value)
- User permissions
- Refresh tokens workflow

## New Features and Changes

- tokenGetter, tokenSetter, tokenRemover moved to AuthConfigAdditional and there are default values
>Migrate-step: Move those to the AuthConfigAdditional or you can use the default functions. The default functions are implemented using localStorage.

- accessTokenExpiredResponseStatus, accessTokenExpiredErrorCode, refreshTokenExpiredResponseStatus, refreshTokenExpiredErrorCode moved
to AuthConfig
>Migrate-step: Add these configurations to the AuthConfig. The refreshToken attributes are optional (depends on refreshTokenEnabled)

- Add extra headers to http requests
>Migrate-step: Add 'Content-Type' header to AuthConfigAdditional.globalHttpHeaders section.

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
    AuthModule.forRoot(authConfig, authConfigAdditional)
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
  accessTokenExpiredResponseStatus: number;
  accessTokenExpiredErrorCode: number;
  refreshTokenExpiredResponseStatus?: number;
  refreshTokenExpiredErrorCode?: number;
}
```

- persistTokensEnabled - If true the tokens are saved in the storage and tokenGetter, tokenSetter and tokenRemover functions also need to provide.
If those any of those functions are not provided the persistTokensEnabled will be false and hence the tokens are not saved in the storage.

- refreshTokenEnabled - Enable [refresh token](https://auth0.com/learn/refresh-tokens/) workflow. If the access token is expired then it 
try to get new token pair using refresh token and then retry the request again. You need to provide token expired error codes.

- userPermissionEnabled - Enable userRole based user permissions. To use this you need to have the userRoleId inside the token and you can
configure the attribute name (see: AuthOptionalConfig). The user permissions are stored in the PermissionProvider and can be mapped inside any
component. When the login is success the new permissions are set usign the userRoleId inside the token.

- loginUrl - Url used in login and the request must receive a Auth response and then the accessToken and refreshToken are saved.
```typescript
export interface Auth {
  accessToken: string;
  refreshToken: string;
}
```

- refreshTokenUrl (optional) - Use to get new token pair using refresh token. Auth response should be send with new token pair.

There are two ways to set permissions.
- getPermissionUrl (optional) - This use a url to get permissions. (see: UserPermission type)
- permissionDataSet (optional) - Use predefined permissions. (see: UserPermission type)

```typescript
export interface UserPermissions {
  userRoleId: number;
  permissions: any;
}
``` 

- accessTokenExpiredResponseStatus - Response status when access token expired. (used to retry the response)
- accessTokenExpiredErrorCode - You need to send error code inside the access token expired response. (used to retry the response)

>Note: Token interceptor will check error response for above conditions and retry the response. If refresh token not enabled user will logout

- refreshTokenExpiredResponseStatus(optional/depend on refreshTokenEnabled) - Response status when refresh token expired
- refreshTokenExpiredErrorCode(optional/depend on refreshTokenEnabled) - You need to send error code inside the refresh token expired response.

>Note: If a refresh token expired response received the user will logout.

## AuthConfigAdditional (additional configurations)

Those are the additional configurations default values are used and you can override them.
```typescript
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
  globalHttpHeaders: [],
  convertToAuthType: (auth: Auth) => auth,
  convertToUserPermissionType: (userPermissions: UserPermissions) => userPermissions,
  convertToApiErrorType: (apiError: ApiError) => apiError
};
```

- accessTokenHeaderName - Header name use when appending access token in each request.
- accessTokenPrefix - Prefix used when appending token (eg: Bearer {access-token})
- refreshTokenHeaderName - Header name use when appending refresh token in refresh request (see: refreshTokenUrl in AuthConfig).
- refreshTokenPrefix - Prefix used when appending token (eg: Basic {refresh-token})
- tokenInterceptorExcludedUrls - These urls are excluded when appending the access token. (eg: Login url)

>Note: Login url is automatically added to the excluded list

- accessTokenStorageKey = key used when storing the access-token in key value pair.
- refreshTokenStorageKey = key used when storing the refresh-token in key value pair.
- userRoleIdKey - attribute name related to the userRoleId inside the access-token payload.

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

- tokenGetter, tokenSetter, tokenRemover - If you plan to use different storage methods you can override default functions
eg: If you have a storage provider and need to use that

```typescript
const storage = new StorageProvider(); //you need to create a instance of the provider manually to use it inside AppModule.

async (tokenName: string) => {
  return storage.read(tokenName); //your method call
}
```

- globalHttpHeaders - You can provide a list of additional http headers that need to be appended. Also you can provide excluded method list.

```typescript
const data = [
  {key: 'Content-Type', value: 'application/json', excludedMethods: ['GET']}
]
```

>Note: excludedMethods array is optional.

You can configure the auth response type, permission response type and api error response type.
This library uses the generator functions to convert response to the relevant type.

- convertToAuthType - This function used to convert the response to the Auth type

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

- convertToUserPermissionType - This function used to convert the response to the UserPermission type

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

- convertToApiErrorType - This function used to convert the response to the UserPermission type

>Note: If not supplied the default function is used

```typescript
(apiError: ApiError) => {
  return apiError
}
```

If the error response sent from the server is different you can pass a generator function to get the ApiError type.
If the error response type from server
```json
{
  "errorResponse": {"errorCode": 4001, "errorMessage": "access token expired."}
}
```

Then the generator function
```typescript
(error: any) => {
  const apiError = {
    errorCode: error.errorResponse.errorCode,
    errorMessage: error.errorResponse.errorMessage
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

Repository: [https://github.com/randilfernando/simple-angular-jwt-auth](https://github.com/randilfernando/simple-angular-jwt-auth)  
Issues: [https://github.com/randilfernando/simple-angular-jwt-auth/issues](https://github.com/randilfernando/simple-angular-jwt-auth/issues)  
Demo: [https://embed.plnkr.co/qstWVYDhzfY4L4YF5Pxp?p=preview](https://embed.plnkr.co/qstWVYDhzfY4L4YF5Pxp?p=preview)
