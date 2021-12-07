// imports
import * as express from "express";
import { User } from "@models/user";

// declare the module
declare module "express" {
  export interface Request {
    userToken?: string;
    user?: User;
  }
}