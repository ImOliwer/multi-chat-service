// imports
import { User } from "./models/user";

// express module
declare module "express-serve-static-core" {
  export interface Request<P,
    ResBody,
    ReqBody,
    ReqQuery,
    Locals extends Record<string, any>> {
    userToken?: string;
    user?: User;
  }
}