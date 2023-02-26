import { getModelForClass, prop } from "typegoose";
import mongoose from "mongoose";
import { Comment } from "./Comment.ts";

export class User {
  @prop()
  wxOpenId!: string;

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
}

export const UserModel = getModelForClass(User);
