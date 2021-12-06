// imports
import { Request, Response, NextFunction } from "express";
import { extractBearerToken } from "../../util/express";

/**
 * Verify the user auth passed through a request's headers.
 * 
 * @param {Request} request the request related to the underlying callback.
 * @param {Response} response the response related to the underlying callback.
 * @param {NextFunction} next the function to continue peacefully or not.
 */
export default function verifyUserAuth(
  request: Request,
  response: Response,
  next: NextFunction
) {
  // extract the token
  const token = extractBearerToken(request);

  // respond with an "Unauthorized" if the auth header is missing
  if (token === undefined) {
    return response.status(401).json({
      message: "missing authorization header",
    });
  }

  // respond with an invalid token format if token is null
  if (token === null) {
    return response.status(400).json({
      message: "invalid token format - must be 'Bearer Token'",
    });
  }

  // add the token to the request and continue
  request.userToken = token;
  return next();
}