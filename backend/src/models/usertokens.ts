// imports
import { Schema, model, SchemaTypes, SchemaDefinitionProperty } from "mongoose";
import { User } from "./user";

// data interface
export interface UserToken {
  // owner of this token
  user: User;

  // the token itself
  token: string;
}

// token schema
const UserTokenSchema = new Schema<
  UserToken & { createdAt: SchemaDefinitionProperty }
>({
  user: { type: SchemaTypes.ObjectId, ref: "User" },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: Number.parseInt(process.env.USER_TOKEN_EXPIRATION),
  },
});

// token model
const UserTokenModel = model("UserToken", UserTokenSchema);

// export the token model as default
export default UserTokenModel;
