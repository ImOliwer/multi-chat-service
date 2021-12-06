// imports
import JsonWebToken, { JwtPayload } from "jsonwebtoken";

/**
 * Sign a token by payload, secret and expiration time.
 * 
 * @param {object} payload the payload to sign.
 * @param {string} secret the secret key to sign via.
 * @param {number} expirationSeconds the expiration time in seconds.
 * @returns {string} token signed.
 */
export function signToken(
  payload: object,
  secret: string,
  expirationSeconds: number
): string {
  return JsonWebToken.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expirationSeconds,
  });
}

/**
 * Validate a token by the same secret is was signed with.
 * 
 * @param {string} token the token to be validated.
 * @param {string} secret the secret used to sign the token passed, and validate with.
 * @returns {Promise<JwtPayload | null>} promise to verify & fetch the result from.
 */
export function validateToken(
  token: string,
  secret: string
): Promise<JwtPayload | null> {
  return new Promise((resolve, _) =>
    JsonWebToken.verify(token, secret, (error, decoded) =>
      resolve(error ? null : decoded)
    )
  );
}
