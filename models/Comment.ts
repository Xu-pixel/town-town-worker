import { getModelForClass, prop } from "typegoose";
import mongoose from "mongoose";


export class Comment {
  @prop()
  orderId!: string;

  @prop()
  content!: string;

  @prop()
  authorId!: string;

  @prop()
  atId!: string;
}
