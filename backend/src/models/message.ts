// imports
import { Schema, model, SchemaTypes } from "mongoose";
import { Entity } from "./Entities";
import { User } from "./user";

// message representative
export interface Message extends Entity {
  // the text that was forwarded in this message.
  text: string;

  // who this message was sent from.
  from: User;

  // who this message was sent to.
  to: User;
}

// message schema
const MessageSchema = new Schema<Message>({
  createdAt: {
    type: Number,
    required: true,
    default: Date.now(),
  },
  text: { type: String, required: true },
  from: { type: SchemaTypes.ObjectId, ref: 'User' },
  to: { type: SchemaTypes.ObjectId, ref: 'User' }
});

// message model
const MessageModel = model("Message", MessageSchema);

// export the model as default
export default MessageModel;