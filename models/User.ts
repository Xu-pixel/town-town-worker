import { getModelForClass, prop } from "npm:@typegoose/typegoose@9.13.x";
import mongoose from "npm:mongoose@~6.7.2";
import { Comment } from "./Comment.ts";
import { Message } from "./Message.ts";
import type { Ref } from "npm:@typegoose/typegoose@9.13.x"

export class User {
  @prop()
  wxOpenId!: string

  @prop()
  name!: string;

  @prop()
  token!: string;

  @prop({ default: false })
  status!: boolean; //是否认证

  @prop()
  avatar?: string;

  @prop()
  sex?: number;

  @prop()
  seniority?: number; //工龄

  @prop()
  phone?: string;

  @prop()
  area?: string; //地区

  @prop()
  location?: string; //详细地址

  @prop()
  IDNumber?: string; //身份证号

  @prop({ type: () => [String] })
  IDPics?: mongoose.Types.Array<string>; //身份证照片

  @prop({ ref: () => Comment })
  comments?: mongoose.Types.Array<Comment>;

  @prop({ type: () => [String] })
  stars?: mongoose.Types.Array<string>; //rid

  @prop({ ref: () => Message })
  messages?: mongoose.Types.Array<Message>;

  @prop({ type: () => [String] })
  works?: mongoose.Types.Array<string> //该用户加入的工作
}

export const UserModel = getModelForClass(User);
