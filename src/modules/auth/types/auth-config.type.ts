export interface AuthConfig {
  persistTokens: boolean;
  accessTokenEnabled: boolean;
  refreshTokenEnabled: boolean;
  loginUrl: string;
  refreshTokenUrl: string;
  tokenGetter: (tokenName: string) => Promise<string>;
  tokenSetter: (tokenName: string, token: string) => Promise<any>;
  tokenRemover: (tokenName: string) => Promise<any>;
}
