// imports
import { Schema, model } from "mongoose";
import { NamedEntity } from "./Entities";

// data interface
export interface User extends NamedEntity {
  // this user's email address
  email: string;

  // this user's hashed password/lock
  lock: string;

  // this user's biograph
  bio: string;

  // this user's avatar (image data)
  avatar: string;
}

// user schema
const UserSchema = new Schema<User>({
  createdAt: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  name: { type: String, required: true },
  email: { type: String, required: true },
  lock: { type: String, required: true },
  bio: String,
  avatar: String
});

// user model
const UserModel = model('User', UserSchema);

// export the user model as default
export default UserModel;