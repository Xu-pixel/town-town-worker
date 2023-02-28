import { getModelForClass, prop } from "npm:@typegoose/typegoose@9.13.x";
import mongoose from "npm:mongoose@~6.7.2";
import { Comment } from "./Comment.ts";
import { Message } from "./Message.ts";

export class User {
  @prop()
  wxOpenId!: string

  @prop()
  name!: string;

  @prop()
  token!: string;

  @prop()
  avatar?: string;

  @prop()
  sex?: number;

  @prop()
  seniority?: number; //工龄

  @prop()
  phone?: string;

  @prop()
  address?: string;

  @prop()
  IDNumber?: string; //身份证号

  @prop()
  IDPic?: string; //身份证照片

  @prop({ ref: () => Comment })
  comments?: mongoose.Types.Array<Comment>;

  @prop({ type: () => [String] })
  stars?: mongoose.Types.Array<string>; //rid

  @prop({ ref: () => Message })
  messages?: mongoose.Types.Array<Message>;
}

export const UserModel = getModelForClass(User);
