// imports
import { Request } from "express";

/**
 * Extract the bearer token from an express request's headers.
 * 
 * @param {Request} request the request to extract from.
 * @returns {string | undefined | null} token or invalidation.
 */
export function extractBearerToken(request: Request): string | undefined | null {
  // necessities
  const { "authorization": authorization } = request.headers;

  // ensure the presence of the header
  if (!authorization) {
    return undefined;
  }

  // ensure the length of '2'
  const bearer = authorization.toString().split(" ");
  if (bearer.length != 2) {
    return null;
  }

  // ensure that it's of type "Bearer" & value not empty
  const token = bearer[1];
  if (bearer[0] !== "Bearer" && token?.length !== 0) {
    return null;
  }

  // return the token
  return token;
}