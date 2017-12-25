export class TokenDecoderHelper {
  public static DecodeToken(token: string): any {
    const parts = token.split('.');
    if (parts.length < 3) {
      throw new Error('jwt must have 3 parts');
    } else {
      return JSON.parse(TokenDecoderHelper.DecodeBase64String(parts[1]));
    }
  }

  private static DecodeBase64String(encoded: string): any {
    if (encoded === '' || encoded === null) {
      throw new Error('cant decode string to base64');
    } else {
      return atob(encoded);
    }
  }
}
