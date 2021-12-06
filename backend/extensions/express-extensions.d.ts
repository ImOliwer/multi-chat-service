// imports
import * as express from "express";

// declare the module
declare module "express" {
  export interface Request {
    userToken?: string;
  }
}