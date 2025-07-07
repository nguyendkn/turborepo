/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  sub: string; // user id
  tokenId: string;
  iat: number;
  exp: number;
}
